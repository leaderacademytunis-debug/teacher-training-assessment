/**
 * Monthly Report Scheduler
 * Sends monthly performance reports to all active teachers
 * Runs on the 1st of each month at 9:00 AM
 */

import { getDb } from "../db";
import { users, competencyPoints, competencyTransactions } from "../../drizzle/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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
 * Generate HTML email template for monthly report
 */
function generateMonthlyReportHTML(data: any): string {
  const levelColors: Record<string, string> = {
    "مبتدئ": "#6366f1",
    "متطور": "#f59e0b",
    "خبير": "#10b981",
    "ماهر رقمي": "#8b5cf6",
  };

  const levelColor = levelColors[data.level] || "#1D9E75";

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1D9E75 0%, #16a34a 100%); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-box { background: #f9fafb; padding: 15px; border-radius: 8px; border-right: 4px solid ${levelColor}; text-align: right; }
        .stat-value { font-size: 24px; font-weight: bold; color: ${levelColor}; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
        .level-badge { display: inline-block; background: ${levelColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { background: ${levelColor}; height: 100%; width: 65%; }
        .recommendation { background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: right; }
        .recommendation-title { font-weight: bold; color: #92400e; margin-bottom: 8px; }
        .recommendation-text { color: #78350f; font-size: 14px; }
        .button { display: inline-block; background: #1D9E75; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 تقرير أدائك الشهري</h1>
          <p>Leader Academy - منصة التعليم الذكي</p>
        </div>

        <div class="content">
          <p style="text-align: right; color: #374151; margin-bottom: 20px;">
            مرحباً بك <strong>${data.teacherName}</strong>،
          </p>

          <p style="text-align: right; color: #6b7280; line-height: 1.6;">
            إليك ملخص أدائك هذا الشهر في استخدام أدوات الذكاء الاصطناعي على منصة Leader Academy.
          </p>

          <div class="divider"></div>

          <div style="text-align: center;">
            <div class="level-badge">${data.level}</div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">65% نحو المستوى التالي</p>
          </div>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${data.totalPoints}</div>
              <div class="stat-label">إجمالي النقاط</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">+${data.monthlyPoints}</div>
              <div class="stat-label">النقاط هذا الشهر</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.percentile}%</div>
              <div class="stat-label">أنت في أفضل X%</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.monthlyUsageCount}</div>
              <div class="stat-label">استخدام الأدوات</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="recommendation">
            <div class="recommendation-title">💡 نصيحة ذكية</div>
            <div class="recommendation-text">
              أنت قريب جداً من مستوى "خبير"! أنجز 3 جذاذات إضافية هذا الأسبوع لتصل إلى 300 نقطة.
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://leaderacademy.school/teacher-analytics" class="button">عرض تحليلاتي الكاملة</a>
          </div>

          <p style="text-align: right; color: #9ca3af; font-size: 13px; margin-top: 30px;">
            شكراً لاستخدامك منصة Leader Academy. نحن ملتزمون بدعم تطورك المهني المستمر.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">© 2026 Leader Academy - جميع الحقوق محفوظة</p>
          <p style="margin: 8px 0 0 0;">هذا البريد مرسل تلقائياً، يرجى عدم الرد عليه</p>
        </div>
      </div>
    </body>
    </html>
  `;
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

        // Prepare report data
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

        // Generate HTML email
        const emailHtml = generateMonthlyReportHTML(reportData);

        console.log(`[Monthly Report] Sending email to ${teacher.email}`);

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: "noreply@leaderacademy.school",
          to: teacher.email,
          subject: `تقرير أدائك الشهري - Leader Academy 📊`,
          html: emailHtml,
        });

        if (emailResult.error) {
          throw new Error(`Resend error: ${emailResult.error.message}`);
        }

        console.log(`[Monthly Report] Email sent successfully to ${teacher.email}`);
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
 * Send test email to a single teacher
 */
export async function sendTestMonthlyReport(teacherId: number): Promise<{ success: boolean; message: string }> {
  const database = (await getDb())!;

  try {
    // Get teacher
    const [teacher] = await database
      .select()
      .from(users)
      .where(eq(users.id, teacherId));

    if (!teacher) {
      return { success: false, message: "معلم غير موجود" };
    }

    // Get current month data
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [competencyData] = await database
      .select()
      .from(competencyPoints)
      .where(
        and(
          eq(competencyPoints.userId, teacherId),
          eq(competencyPoints.monthYear, currentMonth)
        )
      );

    if (!competencyData) {
      return { success: false, message: "لا توجد بيانات كفاءة لهذا المعلم" };
    }

    // Prepare and send test email
    const reportData = {
      teacherId: teacher.id,
      teacherName: teacher.arabicName || teacher.name,
      email: teacher.email,
      totalPoints: competencyData.totalPoints,
      monthlyPoints: competencyData.monthlyPoints || 0,
      pointsGain: competencyData.totalPoints,
      level: competencyData.level,
      percentile: competencyData.percentile || 0,
      monthlyUsageCount: competencyData.monthlyUsageCount || 0,
      sentAt: new Date(),
    };

    const emailHtml = generateMonthlyReportHTML(reportData);

    const emailResult = await resend.emails.send({
      from: "noreply@leaderacademy.school",
      to: teacher.email,
      subject: `[اختبار] تقرير أدائك الشهري - Leader Academy 📊`,
      html: emailHtml,
    });

    if (emailResult.error) {
      return { success: false, message: `خطأ Resend: ${emailResult.error.message}` };
    }

    return { success: true, message: `تم إرسال البريد التجريبي إلى ${teacher.email}` };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `خطأ: ${errorMsg}` };
  }
}

/**
 * Helper function to get next scheduled run time
 */
export function getNextScheduledRunTime(): Date {
  const now = new Date();
  let nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);

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
  const isFirstMinute = now.getMinutes() < 5;

  return isFirstDay && isNineAM && isFirstMinute;
}
