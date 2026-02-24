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
      from: `"${ENV.SMTP_FROM_NAME || 'منصة تأهيل المدرسين'}" <${ENV.SMTP_USER}>`,
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
        <p>يسعدنا إبلاغك بأنه تم <strong>قبول طلب تسجيلك</strong> في منصة تأهيل المدرسين بنجاح!</p>
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
      <p>© 2026 منصة تأهيل المدرسين - جميع الحقوق محفوظة</p>
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
        <p>نشكرك على اهتمامك بالتسجيل في منصة تأهيل المدرسين.</p>
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
      <p>© 2026 منصة تأهيل المدرسين - جميع الحقوق محفوظة</p>
      <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>
  `;
}
