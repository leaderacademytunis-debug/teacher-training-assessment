import { Resend } from "resend";
import { emailTemplates } from "./emailTemplates";

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
  const htmlContent = emailTemplates.welcome(fullName, email, tempPassword, loginUrl);

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
  const htmlContent = emailTemplates.enrollment(userName, courseName, courseUrl);

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
  const htmlContent = emailTemplates.adminMessage(recipientName, courseName, subject, message);

  return sendEmail({
    to: email,
    subject: subject,
    html: htmlContent,
  });
}
