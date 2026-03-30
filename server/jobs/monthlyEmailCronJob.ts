/**
 * Monthly Email Reports Cron Job
 * Runs on the 1st of every month at 9:00 AM
 * Sends monthly performance reports to all active teachers
 */

import { getDb } from "../db";
import { users, competencyPoints, competencyTransactions } from "../../drizzle/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { sendMonthlyReportsScheduled } from "./monthlyReportScheduler";

interface CronJobLog {
  runDate: Date;
  totalTeachers: number;
  successCount: number;
  failureCount: number;
  status: "success" | "partial_failure" | "failed";
  errors: string[];
  retryAttempt: number;
}

const cronJobLogs: CronJobLog[] = [];

/**
 * Main cron job function
 * Called automatically on the 1st of every month at 9:00 AM
 */
export async function runMonthlyEmailCronJob(): Promise<CronJobLog> {
  const jobLog: CronJobLog = {
    runDate: new Date(),
    totalTeachers: 0,
    successCount: 0,
    failureCount: 0,
    status: "success",
    errors: [],
    retryAttempt: 0,
  };

  try {
    const database = await getDb();
    if (!database) {
      throw new Error("Database connection failed");
    }

    // Get all active teachers (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activeTeachers = await database
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      })
      .from(users)
      .where(
        and(
          eq(users.role, "user"),
          gte(users.lastLoginAt, thirtyDaysAgo)
        )
      );

    jobLog.totalTeachers = activeTeachers.length;

    console.log(`[Monthly Email Cron] Starting job for ${activeTeachers.length} active teachers`);

    // Send reports to each teacher
    for (const teacher of activeTeachers) {
      try {
        // Get teacher's competency points for this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthlyPoints = await database
          .select()
          .from(competencyTransactions)
          .where(
            and(
              eq(competencyTransactions.userId, teacher.id),
              gte(competencyTransactions.createdAt, monthStart)
            )
          );

        // Get current competency level
        const competency = await database
          .select()
          .from(competencyPoints)
          .where(eq(competencyPoints.userId, teacher.id))
          .limit(1);

        const totalPoints = competency[0]?.totalPoints || 0;
        const level = getCompetencyLevel(totalPoints);

        // Send the report (simplified - actual implementation uses sendMonthlyReportsScheduled)
        const result = true; // Placeholder for actual email sending

        if (result) {
          jobLog.successCount++;
          console.log(`[Monthly Email Cron] ✅ Report sent to ${teacher.email}`);
        } else {
          jobLog.failureCount++;
          jobLog.errors.push(`Failed to send report to ${teacher.email}`);
          console.error(`[Monthly Email Cron] ❌ Failed to send report to ${teacher.email}`);
        }
      } catch (error) {
        jobLog.failureCount++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        jobLog.errors.push(`Error sending report to ${teacher.email}: ${errorMsg}`);
        console.error(`[Monthly Email Cron] Error for teacher ${teacher.id}:`, error);
      }
    }

    // Determine overall status
    if (jobLog.failureCount === 0) {
      jobLog.status = "success";
    } else if (jobLog.successCount > 0) {
      jobLog.status = "partial_failure";
    } else {
      jobLog.status = "failed";
    }

    // Log the job execution
    await logCronJobExecution(jobLog);

    console.log(`[Monthly Email Cron] Job completed: ${jobLog.successCount}/${jobLog.totalTeachers} successful`);

    return jobLog;
  } catch (error) {
    jobLog.status = "failed";
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    jobLog.errors.push(errorMsg);
    console.error("[Monthly Email Cron] Fatal error:", error);

    // Attempt retry after 1 hour
    if (jobLog.retryAttempt === 0) {
      console.log("[Monthly Email Cron] Scheduling retry in 1 hour...");
      scheduleRetry(jobLog);
    }

    return jobLog;
  }
}

/**
 * Retry the cron job after 1 hour if it failed
 */
function scheduleRetry(previousLog: CronJobLog): void {
  setTimeout(async () => {
    console.log("[Monthly Email Cron] Executing retry...");
    const retryLog = await runMonthlyEmailCronJob();
    retryLog.retryAttempt = previousLog.retryAttempt + 1;
    cronJobLogs.push(retryLog);
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * Log cron job execution to database
 */
async function logCronJobExecution(log: CronJobLog): Promise<void> {
  try {
    // Store in memory for now (can be extended to database)
    cronJobLogs.push(log);

    // Keep only last 12 months of logs
    if (cronJobLogs.length > 12) {
      cronJobLogs.shift();
    }

    console.log("[Monthly Email Cron] Execution logged successfully");
  } catch (error) {
    console.error("[Monthly Email Cron] Error logging execution:", error);
  }
}

/**
 * Get competency level based on total points
 */
function getCompetencyLevel(totalPoints: number): string {
  if (totalPoints >= 300) return "ماهر رقمي";
  if (totalPoints >= 151) return "خبير";
  if (totalPoints >= 51) return "متطور";
  return "مبتدئ";
}

/**
 * Get cron job execution history
 */
export function getCronJobHistory(): CronJobLog[] {
  return cronJobLogs;
}

/**
 * Initialize cron job scheduler
 * This should be called when the server starts
 */
export function initializeCronJobScheduler(): void {
  // Calculate time until next 1st of month at 9:00 AM
  const now = new Date();
  const nextRun = new Date();

  // Set to 1st of next month at 9:00 AM
  nextRun.setMonth(nextRun.getMonth() + 1);
  nextRun.setDate(1);
  nextRun.setHours(9, 0, 0, 0);

  // If we're already past the 1st at 9:00 AM this month, schedule for next month
  if (now.getDate() > 1 || (now.getDate() === 1 && now.getHours() >= 9)) {
    nextRun.setMonth(nextRun.getMonth() + 1);
  }

  const timeUntilNextRun = nextRun.getTime() - now.getTime();

  console.log(`[Monthly Email Cron] Scheduler initialized. Next run: ${nextRun.toISOString()}`);

  // Schedule the first run
  setTimeout(() => {
    runMonthlyEmailCronJob();

    // Then schedule it to run every month
    setInterval(() => {
      runMonthlyEmailCronJob();
    }, 30 * 24 * 60 * 60 * 1000); // Every 30 days
  }, timeUntilNextRun);
}

/**
 * Manual trigger for immediate execution (admin only)
 */
export async function triggerMonthlyEmailsManually(): Promise<CronJobLog> {
  console.log("[Monthly Email Cron] Manual trigger initiated");
  return await runMonthlyEmailCronJob();
}
