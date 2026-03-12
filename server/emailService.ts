import nodemailer from 'nodemailer';
import { ENV } from './_core/env';

// Create reusable transporter
const createTransport = () => {
  // Check if SMTP credentials are configured
  if (!ENV.SMTP_HOST || !ENV.SMTP_USER || !ENV.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email sending will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT || 587,
    secure: ENV.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const transporter = createTransport();
  
  if (!transporter) {
    console.log(`[Email Service] Skipping email to ${to} - SMTP not configured`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${ENV.SMTP_FROM_NAME || 'ليدر أكاديمي'}" <${ENV.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email Service] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error);
    return false;
  }
}

export function getApprovalEmailTemplate(userName: string, userNameAr: string): string {
  const appUrl = ENV.VITE_APP_URL || 'https://your-domain.manus.space';
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .success-icon {
      text-align: center;
      font-size: 64px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .highlight {
      color: #667eea;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 مبروك! تم قبول تسجيلك</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <div class="message">
        <p>عزيزي/عزيزتي <span class="highlight">${userNameAr || userName}</span>،</p>
        <p>يسعدنا إبلاغك بأنه تم <strong>قبول طلب تسجيلك</strong> في ليدر أكاديمي بنجاح!</p>
        <p>يمكنك الآن الوصول إلى جميع الدورات التدريبية المتاحة والبدء في رحلتك التعليمية لتطوير مهاراتك المهنية.</p>
        <center>
          <a href="${appUrl}" class="cta-button">
            🚀 ابدأ التعلم الآن
          </a>
        </center>
        <p style="margin-top: 30px; font-size: 16px; color: #666;">
          إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ليدر أكاديمي - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getRejectionEmailTemplate(userName: string, userNameAr: string, reason?: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .info-icon {
      text-align: center;
      font-size: 64px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 30px;
    }
    .reason-box {
      background-color: #fff3cd;
      border-right: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .reason-box strong {
      color: #856404;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .highlight {
      color: #f5576c;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>إشعار بخصوص طلب التسجيل</h1>
    </div>
    <div class="content">
      <div class="info-icon">ℹ️</div>
      <div class="message">
        <p>عزيزي/عزيزتي <span class="highlight">${userNameAr || userName}</span>،</p>
        <p>نشكرك على اهتمامك بالتسجيل في ليدر أكاديمي.</p>
        <p>بعد مراجعة طلبك، نأسف لإبلاغك بأنه <strong>لم يتم قبول التسجيل</strong> في الوقت الحالي.</p>
        ${reason ? `
        <div class="reason-box">
          <strong>السبب:</strong> ${reason}
        </div>
        ` : ''}
        <p style="margin-top: 30px; font-size: 16px; color: #666;">
          إذا كنت تعتقد أن هناك خطأ أو لديك استفسار، يرجى التواصل معنا للحصول على مزيد من التوضيحات.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ليدر أكاديمي - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ===== PAYMENT WORKFLOW EMAIL TEMPLATES =====

export function getNewPaymentRequestEmailTemplate(userName: string, userEmail: string, serviceName: string, amount?: string): string {
  const appUrl = ENV.VITE_APP_URL || 'https://your-domain.manus.space';
  const SERVICE_LABELS: Record<string, string> = {
    edugpt_pro: 'EDUGPT PRO',
    course_ai: 'دورة الذكاء الاصطناعي',
    course_pedagogy: 'دورة البيداغوجيا',
    full_bundle: 'الباقة الكاملة',
  };
  const serviceLabel = SERVICE_LABELS[serviceName] || serviceName;
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6D00 0%, #FF9100 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 30px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 16px; }
    .info-table td:first-child { font-weight: bold; color: #555; width: 40%; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #FF6D00 0%, #FF9100 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; }
    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 13px; color: #666; }
    .urgent-badge { background: #FFF3E0; border-right: 4px solid #FF6D00; padding: 12px 15px; border-radius: 4px; margin: 15px 0; font-size: 15px; color: #E65100; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 طلب دفع جديد يحتاج مراجعتك</h1>
    </div>
    <div class="content">
      <div class="urgent-badge">
        ⚡ يوجد طلب دفع جديد بانتظار المراجعة والتفعيل
      </div>
      <table class="info-table">
        <tr><td>المستخدم</td><td>${userName}</td></tr>
        <tr><td>البريد الإلكتروني</td><td>${userEmail}</td></tr>
        <tr><td>الخدمة المطلوبة</td><td>${serviceLabel}</td></tr>
        ${amount ? `<tr><td>المبلغ</td><td>${amount} د.ت</td></tr>` : ''}
        <tr><td>التاريخ</td><td>${new Date().toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
      </table>
      <center>
        <a href="${appUrl}/admin" class="cta-button">
          📋 مراجعة الطلب في لوحة التحكم
        </a>
      </center>
    </div>
    <div class="footer">
      <p>© 2026 ليدر أكاديمي - إشعار تلقائي للمسؤول</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getPaymentApprovedEmailTemplate(userName: string, serviceNames: string[]): string {
  const appUrl = ENV.VITE_APP_URL || 'https://your-domain.manus.space';
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: white; padding: 35px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: bold; }
    .content { padding: 35px 30px; }
    .success-icon { text-align: center; font-size: 64px; margin-bottom: 15px; }
    .message { font-size: 17px; line-height: 1.8; color: #333; margin-bottom: 25px; }
    .services-box { background: #E8F5E9; border-right: 4px solid #4CAF50; padding: 15px 20px; border-radius: 4px; margin: 20px 0; }
    .services-box ul { list-style: none; padding: 0; margin: 10px 0 0 0; }
    .services-box li { padding: 5px 0; font-size: 16px; }
    .services-box li::before { content: "✅ "; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-size: 17px; font-weight: bold; }
    .footer { background-color: #f8f9fa; padding: 18px; text-align: center; font-size: 13px; color: #666; }
    .highlight { color: #2E7D32; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 تم تفعيل اشتراكك بنجاح!</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <div class="message">
        <p>عزيزي/عزيزتي <span class="highlight">${userName}</span>،</p>
        <p>يسعدنا إبلاغك بأنه تم <strong>قبول طلب الدفع</strong> وتفعيل خدماتك في ليدر أكاديمي!</p>
        <div class="services-box">
          <strong>الخدمات المفعّلة:</strong>
          <ul>
            ${serviceNames.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <p>يمكنك الآن الوصول إلى جميع الأدوات والميزات المتاحة ضمن اشتراكك.</p>
        <center>
          <a href="${appUrl}" class="cta-button">
            🚀 ابدأ الاستخدام الآن
          </a>
        </center>
        <p style="margin-top: 25px; font-size: 15px; color: #666;">
          إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ليدر أكاديمي - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getPaymentRejectedEmailTemplate(userName: string, reason: string): string {
  const appUrl = ENV.VITE_APP_URL || 'https://your-domain.manus.space';
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #EF5350 0%, #E53935 100%); color: white; padding: 35px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 35px 30px; }
    .info-icon { text-align: center; font-size: 64px; margin-bottom: 15px; }
    .message { font-size: 17px; line-height: 1.8; color: #333; margin-bottom: 25px; }
    .reason-box { background-color: #FFF3E0; border-right: 4px solid #FF9800; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
    .reason-box strong { color: #E65100; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-size: 17px; font-weight: bold; }
    .footer { background-color: #f8f9fa; padding: 18px; text-align: center; font-size: 13px; color: #666; }
    .highlight { color: #E53935; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>إشعار بخصوص طلب الدفع</h1>
    </div>
    <div class="content">
      <div class="info-icon">ℹ️</div>
      <div class="message">
        <p>عزيزي/عزيزتي <span class="highlight">${userName}</span>،</p>
        <p>نشكرك على اهتمامك بخدمات ليدر أكاديمي.</p>
        <p>بعد مراجعة طلب الدفع الخاص بك، نأسف لإبلاغك بأنه <strong>لم يتم قبول الطلب</strong> في الوقت الحالي.</p>
        <div class="reason-box">
          <strong>السبب:</strong> ${reason}
        </div>
        <p>يمكنك إعادة تقديم الطلب بعد تصحيح المشكلة المذكورة أعلاه.</p>
        <center>
          <a href="${appUrl}/pricing" class="cta-button">
            🔄 إعادة تقديم الطلب
          </a>
        </center>
        <p style="margin-top: 25px; font-size: 15px; color: #666;">
          إذا كنت تعتقد أن هناك خطأ، يرجى التواصل معنا.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ليدر أكاديمي - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getCertificateEmailTemplate(
  userName: string,
  userNameAr: string,
  courseName: string,
  certificateUrl: string
): string {
  const appUrl = ENV.VITE_APP_URL || 'https://your-domain.manus.space';
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .certificate-icon {
      text-align: center;
      font-size: 80px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 18px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 30px;
    }
    .course-name {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 20px 10px;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .secondary-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .highlight {
      color: #f5576c;
      font-weight: bold;
    }
    .achievement-box {
      background-color: #e8f5e9;
      border-right: 4px solid #4caf50;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .achievement-box p {
      margin: 10px 0;
      font-size: 16px;
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 مبروك! حصلت على شهادة إتمام</h1>
    </div>
    <div class="content">
      <div class="certificate-icon">🏆</div>
      <div class="message">
        <p>عزيزي/عزيزتي <span class="highlight">${userNameAr || userName}</span>،</p>
        <p>تهانينا الحارة! 🎉</p>
        <p>يسعدنا إبلاغك بأنك أتممت بنجاح الدورة التدريبية:</p>
        <div class="course-name">
          📚 ${courseName}
        </div>
        <div class="achievement-box">
          <p><strong>✨ إنجاز رائع!</strong></p>
          <p>لقد أظهرت التزاماً وتفانياً في التعلم والتطوير المهني</p>
        </div>
        <p>تم إرفاق شهادة الإتمام الرسمية بهذا البريد الإلكتروني. يمكنك تحميلها ومشاركتها مع الآخرين.</p>
        <center>
          <a href="${certificateUrl}" class="cta-button">
            📥 تحميل الشهادة (PDF)
          </a>
          <a href="${appUrl}/my-certificates" class="cta-button secondary-button">
            📋 عرض جميع شهاداتي
          </a>
        </center>
        <p style="margin-top: 30px; font-size: 16px; color: #666;">
          نتمنى لك المزيد من التوفيق والنجاح في مسيرتك المهنية! 🌟
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 ليدر أكاديمي - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `;
}


// ===== SUBMISSION COMMENT EMAIL TEMPLATES =====

export function getCommentNotificationEmailTemplate(
  participantName: string,
  instructorName: string,
  assignmentTitle: string,
  batchName: string,
  commentText: string,
): string {
  const appUrl = ENV.VITE_APP_URL || 'https://your-domain.manus.space';
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 30px; }
    .message { font-size: 16px; line-height: 1.8; color: #333; }
    .comment-box { background-color: #f0f7ff; border-right: 4px solid #3b82f6; padding: 15px 20px; border-radius: 8px; margin: 20px 0; font-size: 15px; color: #1e3a5f; line-height: 1.8; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 15px; }
    .info-label { font-weight: bold; color: #555; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin-top: 20px; }
    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 13px; color: #666; }
    .highlight { color: #3b82f6; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>تعليق جديد من المدرب</h1>
    </div>
    <div class="content">
      <div class="message">
        <p>عزيزي/عزيزتي <span class="highlight">${participantName}</span>،</p>
        <p>أضاف المدرب <strong>${instructorName}</strong> تعليقاً جديداً على تسليمك:</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #555; width: 35%;">الواجب</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${assignmentTitle}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">الدفعة</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${batchName}</td></tr>
      </table>
      
      <div class="comment-box">
        <strong>التعليق:</strong><br/>
        ${commentText}
      </div>
      
      <center>
        <a href="${appUrl}/my-courses" class="cta-button">
          عرض التسليم والرد
        </a>
      </center>
      
      <p style="margin-top: 25px; font-size: 14px; color: #888;">
        يمكنك الرد على تعليق المدرب من خلال صفحة تسليماتك في المنصة.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 ليدر أكاديمي - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `;
}
