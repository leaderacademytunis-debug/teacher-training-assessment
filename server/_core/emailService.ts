import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend service
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: "Leader Academy <noreply@leaderacademy.school>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error };
    }

    console.log(`[EMAIL] Sent to ${options.to} - ID: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  tempPassword: string,
  loginUrl: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1D9E75; padding-bottom: 20px;">
          <h1 style="color: #1D9E75; margin: 0; font-size: 28px;">مرحباً بك في Leader Academy</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">منصة التعليم الذكي والمساعد البيداغوجي</p>
        </div>

        <!-- Welcome Message -->
        <div style="margin-bottom: 25px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
            السلام عليكم ورحمة الله وبركاته <strong>${fullName}</strong>،
          </p>
          <p style="color: #555; font-size: 14px; line-height: 1.8; margin: 0 0 15px 0;">
            شكراً لتسجيلك في منصة Leader Academy. نحن سعداء بانضمامك إلى مجتمعنا من المعلمين الذين يستخدمون الذكاء الاصطناعي لتحسين عملية التدريس.
          </p>
        </div>

        <!-- Login Credentials -->
        <div style="background-color: #f9f9f9; border-right: 4px solid #E8590C; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <p style="color: #333; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">بيانات الدخول المؤقتة:</p>
          <p style="color: #555; font-size: 13px; margin: 8px 0;">
            <strong>البريد الإلكتروني:</strong> ${email}
          </p>
          <p style="color: #555; font-size: 13px; margin: 8px 0;">
            <strong>كلمة المرور المؤقتة:</strong> <code style="background-color: #e8e8e8; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${tempPassword}</code>
          </p>
          <p style="color: #E8590C; font-size: 12px; margin: 10px 0 0 0; font-style: italic;">
            ⚠️ يرجى تغيير كلمة المرور بعد أول دخول لأسباب أمنية
          </p>
        </div>

        <!-- Login Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #1D9E75; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
            دخول المنصة الآن
          </a>
        </div>

        <!-- Features -->
        <div style="background-color: #f0f8f5; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
          <p style="color: #1D9E75; font-weight: bold; margin: 0 0 10px 0; font-size: 14px;">ما يمكنك فعله على المنصة:</p>
          <ul style="color: #555; font-size: 13px; line-height: 1.8; margin: 0; padding-right: 20px;">
            <li>استخدام 18 أداة ذكية لإعداد الدروس والاختبارات</li>
            <li>إنشاء محتوى تعليمي متقدم بدعم الذكاء الاصطناعي</li>
            <li>تتبع تقدم الطلاب وتحليل أدائهم</li>
            <li>الوصول إلى مكتبة شاملة من الموارد التعليمية</li>
          </ul>
        </div>

        <!-- Support -->
        <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 25px;">
          <p style="color: #666; font-size: 12px; line-height: 1.6; margin: 0;">
            إذا واجهت أي مشاكل أو كان لديك أسئلة، لا تتردد في التواصل معنا عبر البريد الإلكتروني أو زيارة مركز المساعدة.
          </p>
          <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
            © 2026 Leader Academy. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `مرحباً بك في Leader Academy - ${fullName}`,
    html: htmlContent,
  });
}

/**
 * Send enrollment confirmation email
 */
export async function sendEnrollmentEmail(
  email: string,
  userName: string,
  courseName: string,
  courseUrl: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #1D9E75; padding-bottom: 20px;">
          <h1 style="color: #1D9E75; margin: 0; font-size: 24px;">تم تسجيلك بنجاح</h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
          مرحباً <strong>${userName}</strong>،
        </p>

        <p style="color: #555; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
          تم تسجيلك بنجاح في التكوين: <strong style="color: #1D9E75;">${courseName}</strong>
        </p>

        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${courseUrl}" style="display: inline-block; background-color: #E8590C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ابدأ التعلم الآن
          </a>
        </div>

        <p style="color: #666; font-size: 12px; line-height: 1.6;">
          نتمنى لك تجربة تعليمية ممتعة ومثمرة!
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `تم تسجيلك في التكوين: ${courseName}`,
    html: htmlContent,
  });
}

/**
 * Send message to course participants
 */
export async function sendCourseMessage(
  email: string,
  recipientName: string,
  courseName: string,
  message: string,
  subject: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #1D9E75; padding-bottom: 20px;">
          <h2 style="color: #1D9E75; margin: 0; font-size: 20px;">${courseName}</h2>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
          مرحباً <strong>${recipientName}</strong>،
        </p>

        <div style="background-color: #f9f9f9; border-right: 4px solid #E8590C; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <p style="color: #333; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
            ${message}
          </p>
        </div>

        <p style="color: #666; font-size: 12px; line-height: 1.6;">
          مع أطيب التمنيات،<br/>
          فريق Leader Academy
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: subject,
    html: htmlContent,
  });
}
