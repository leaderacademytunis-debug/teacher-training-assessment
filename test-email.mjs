import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('[TEST] Starting email test...');
    console.log('[TEST] API Key:', process.env.RESEND_API_KEY?.substring(0, 20) + '...');
    
    const result = await resend.emails.send({
      from: 'Leader Academy <noreply@leaderacademy.school>',
      to: 'leaderacademytunis@gmail.com',
      subject: 'اختبار - رسالة ترحيب من Leader Academy',
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #1D9E75; text-align: center;">مرحباً بك في Leader Academy</h1>
            <p>السلام عليكم ورحمة الله وبركاته معلم تجريبي،</p>
            <p>هذا بريد اختبار للتحقق من تفعيل نظام البريد الإلكتروني.</p>
            <div style="background-color: #f9f9f9; border-right: 4px solid #1D9E75; padding: 15px; margin: 20px 0;">
              <p><strong>البريد:</strong> leaderacademytunis@gmail.com</p>
              <p><strong>كلمة المرور المؤقتة:</strong> Test1234</p>
            </div>
            <p style="text-align: center;">
              <a href="https://leaderacademy.school" style="display: inline-block; background-color: #1D9E75; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ابدأ الآن</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log('[TEST] Response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('[ERROR] Email sending failed:', result.error);
      process.exit(1);
    } else {
      console.log('[SUCCESS] Email sent! ID:', result.data?.id);
      process.exit(0);
    }
  } catch (error) {
    console.error('[ERROR] Exception:', error);
    process.exit(1);
  }
}

testEmail();
