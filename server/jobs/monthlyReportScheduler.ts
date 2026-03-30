/**
 * Monthly Report Scheduler
 * Sends monthly performance reports to all active teachers
 * Runs on the 1st of each month at 9:00 AM
 */

import { getDb } from "../db";
import { users, competencyPoints, competencyTransactions } from "../../drizzle/schema";
import { eq, and, gte, desc } from "drizzle-orm";

interface MonthlyReportLog {
  id?: number;
  sentAt: Date;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  status: "success" | "partial" | "failed";
  errorMessage?: string;
}

/**
 * Main scheduler function to send monthly reports
 * Should be called via cron job or webhook at 1st of month, 9:00 AM
 */
export async function sendMonthlyReportsScheduled(): Promise<MonthlyReportLog> {
  const database = (await getDb())!;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .slice(0, 7);

  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  try {
    // Get all active teachers (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeTeachers = await database
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "teacher"),
          gte(users.lastSignedIn || new Date(0), thirtyDaysAgo)
        )
      );

    console.log(`[Monthly Report Scheduler] Found ${activeTeachers.length} active teachers`);

    // Process each teacher
    for (const teacher of activeTeachers) {
      try {
        // Get current month competency data
        const [currentData] = await database
          .select()
          .from(competencyPoints)
          .where(
            and(
              eq(competencyPoints.userId, teacher.id),
              eq(competencyPoints.monthYear, currentMonth)
            )
          );

        if (!currentData) {
          console.log(`[Monthly Report] No data for teacher ${teacher.id} in ${currentMonth}`);
          continue;
        }

        // Get previous month data for comparison
        const [previousData] = await database
          .select()
          .from(competencyPoints)
          .where(
            and(
              eq(competencyPoints.userId, teacher.id),
              eq(competencyPoints.monthYear, previousMonth)
            )
          );

        const previousPoints = previousData?.totalPoints || 0;
        const pointsGain = currentData.totalPoints - previousPoints;

        // Log the report send attempt
        console.log(
          `[Monthly Report] Sending report to ${teacher.email}: ${currentData.totalPoints} points`
        );

        // In production, integrate with Resend or your email service
        // For now, we'll just log it
        const reportData = {
          teacherId: teacher.id,
          teacherName: teacher.arabicName || teacher.name,
          email: teacher.email,
          totalPoints: currentData.totalPoints,
          monthlyPoints: currentData.monthlyPoints || 0,
          pointsGain,
          level: currentData.level,
          percentile: currentData.percentile || 0,
          monthlyUsageCount: currentData.monthlyUsageCount || 0,
          sentAt: new Date(),
        };

        console.log(
          `[Monthly Report] Report data:`,
          JSON.stringify(reportData, null, 2)
        );

        // TODO: Send email via Resend API
        // await sendEmailViaResend({
        //   to: teacher.email,
        //   subject: `تقرير أدائك الشهري - Leader Academy 📊`,
        //   html: generateMonthlyReportHTML(reportData),
        // });

        successCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[Monthly Report] Error processing teacher ${teacher.id}:`, errorMsg);
        errors.push(`Teacher ${teacher.id}: ${errorMsg}`);
        failureCount++;
      }
    }

    const status =
      failureCount === 0 ? "success" : failureCount < successCount ? "partial" : "failed";

    const result: MonthlyReportLog = {
      sentAt: new Date(),
      recipientCount: activeTeachers.length,
      successCount,
      failureCount,
      status,
      errorMessage: errors.length > 0 ? errors.join("; ") : undefined,
    };

    console.log(
      `[Monthly Report Scheduler] Completed: ${successCount} success, ${failureCount} failed`
    );

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Monthly Report Scheduler] Fatal error:", errorMsg);

    return {
      sentAt: new Date(),
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
      status: "failed",
      errorMessage: errorMsg,
    };
  }
}

/**
 * Webhook endpoint to trigger monthly reports
 * Should be called from external scheduler (e.g., cron.io, AWS EventBridge)
 */
export async function handleMonthlyReportWebhook(
  req: any
): Promise<{ success: boolean; message: string; result?: MonthlyReportLog }> {
  try {
    // Verify webhook signature if needed
    const result = await sendMonthlyReportsScheduled();
    return {
      success: result.status !== "failed",
      message: `Monthly reports sent: ${result.successCount} success, ${result.failureCount} failed`,
      result,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to send monthly reports: ${errorMsg}`,
    };
  }
}

/**
 * Helper function to get next scheduled run time
 */
export function getNextScheduledRunTime(): Date {
  const now = new Date();
  let nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);

  // If we're already past the 1st of next month at 9 AM, schedule for the month after
  if (nextRun <= now) {
    nextRun = new Date(now.getFullYear(), now.getMonth() + 2, 1, 9, 0, 0);
  }

  return nextRun;
}

/**
 * Helper function to check if it's time to run the scheduler
 */
export function shouldRunScheduler(): boolean {
  const now = new Date();
  const isFirstDay = now.getDate() === 1;
  const isNineAM = now.getHours() === 9;
  const isFirstMinute = now.getMinutes() < 5; // Allow 5-minute window

  return isFirstDay && isNineAM && isFirstMinute;
}
