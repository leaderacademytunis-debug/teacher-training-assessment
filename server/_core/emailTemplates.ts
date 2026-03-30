/**
 * Professional HTML Email Templates
 * Used by Resend for sending welcome, enrollment, and message emails
 */

export const emailTemplates = {
  /**
   * Welcome Email Template
   * Sent to new users upon account creation
   */
  welcome: (fullName: string, email: string, tempPassword: string, loginUrl: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Almarai', 'Cairo', Arial, sans-serif;
            background-color: #f5f5f5;
            direction: rtl;
            text-align: right;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1D9E75 0%, #15a85a 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
        }
        .logo-subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            color: #1D9E75;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .text {
            font-size: 16px;
            color: #333333;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        .credentials {
            background-color: #f9f9f9;
            border-right: 4px solid #1D9E75;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .credential-item {
            margin-bottom: 15px;
        }
        .credential-label {
            font-size: 12px;
            color: #666666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .credential-value {
            font-size: 16px;
            color: #1D9E75;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        .cta-button {
            display: inline-block;
            background-color: #1D9E75;
            color: #ffffff;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 30px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background-color: #15a85a;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666666;
            text-align: center;
        }
        .footer-item {
            margin: 10px 0;
        }
        .footer-link {
            color: #1D9E75;
            text-decoration: none;
        }
        .whatsapp-link {
            display: inline-block;
            background-color: #25D366;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 10px 0;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🎓 Leader Academy</div>
            <div class="logo-subtitle">منصة التعليم الذكي والمساعد البيداغوجي</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">مرحباً بك في Leader Academy! 👋</div>
            
            <p class="text">
                السلام عليكم ورحمة الله وبركاته <strong>${fullName}</strong>،
            </p>

            <p class="text">
                شكراً لاختيارك منصة Leader Academy! نحن متحمسون لمساعدتك في رحلتك التعليمية. ستجد في المنصة 18 أداة ذكاء اصطناعي متقدمة مصممة خصيصاً لتطوير مهاراتك التربوية والرقمية.
            </p>

            <!-- Credentials -->
            <div class="credentials">
                <div class="credential-item">
                    <div class="credential-label">البريد الإلكتروني</div>
                    <div class="credential-value">${email}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">كلمة المرور المؤقتة</div>
                    <div class="credential-value">${tempPassword}</div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666666;">
                    <strong>ملاحظة:</strong> يُرجى تغيير كلمة المرور عند دخولك للمنصة لأول مرة.
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="${loginUrl}" class="cta-button">ابدأ الآن</a>
            </div>

            <p class="text">
                إذا واجهت أي مشاكل في تسجيل الدخول، يمكنك التواصل معنا عبر الواتساب أو البريد الإلكتروني.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-item">
                <strong>Leader Academy Tunisia</strong>
            </div>
            <div class="divider"></div>
            <div class="footer-item">
                📧 البريد الإلكتروني: <a href="mailto:leaderacademy216@gmail.com" class="footer-link">leaderacademy216@gmail.com</a>
            </div>
            <div class="footer-item">
                📱 واتساب: <a href="https://wa.me/21650000000" class="whatsapp-link">تواصل معنا</a>
            </div>
            <div class="footer-item" style="margin-top: 15px;">
                <a href="#" class="footer-link">إلغاء الاشتراك</a> | 
                <a href="#" class="footer-link">سياسة الخصوصية</a>
            </div>
        </div>
    </div>
</body>
</html>
  `,

  /**
   * Enrollment Confirmation Email Template
   * Sent when user enrolls in a course
   */
  enrollment: (userName: string, courseName: string, courseUrl: string, courseImage?: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Almarai', 'Cairo', Arial, sans-serif;
            background-color: #f5f5f5;
            direction: rtl;
            text-align: right;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #E8590C 0%, #FF6D00 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 22px;
            color: #E8590C;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .text {
            font-size: 16px;
            color: #333333;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        .course-card {
            background-color: #f9f9f9;
            border-radius: 8px;
            overflow: hidden;
            margin: 30px 0;
            border: 2px solid #E8590C;
        }
        .course-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #E8590C, #FF6D00);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 60px;
        }
        .course-info {
            padding: 20px;
        }
        .course-name {
            font-size: 20px;
            font-weight: bold;
            color: #E8590C;
            margin-bottom: 15px;
        }
        .course-detail {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            background-color: #E8590C;
            color: #ffffff;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #d74a08;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666666;
            text-align: center;
        }
        .footer-link {
            color: #E8590C;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🎉 تم التسجيل بنجاح!</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">مرحباً ${userName}! 🎓</div>
            
            <p class="text">
                تهانينا! لقد تم تسجيلك بنجاح في التكوين التالي:
            </p>

            <!-- Course Card -->
            <div class="course-card">
                <div class="course-image">📚</div>
                <div class="course-info">
                    <div class="course-name">${courseName}</div>
                    <div class="course-detail">✅ تم تأكيد التسجيل</div>
                    <div class="course-detail">📅 يمكنك البدء فوراً</div>
                    <div class="course-detail">🎯 حقق أهدافك التعليمية معنا</div>
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="${courseUrl}" class="cta-button">ادخل إلى التكوين</a>
            </div>

            <p class="text">
                ستجد في هذا التكوين محتوى متقدم وأدوات تفاعلية مصممة لتطوير مهاراتك. نتمنى لك رحلة تعليمية ممتعة ومثمرة!
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>© 2026 Leader Academy Tunisia</div>
            <div style="margin-top: 10px;">
                <a href="mailto:leaderacademy216@gmail.com" class="footer-link">تواصل معنا</a>
            </div>
        </div>
    </div>
</body>
</html>
  `,

  /**
   * Admin Message Template
   * Sent by admin to course participants
   */
  adminMessage: (recipientName: string, courseName: string, subject: string, message: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Almarai', 'Cairo', Arial, sans-serif;
            background-color: #f5f5f5;
            direction: rtl;
            text-align: right;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1565C0 0%, #1A237E 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 22px;
            color: #1565C0;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .text {
            font-size: 16px;
            color: #333333;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        .course-badge {
            display: inline-block;
            background-color: #1565C0;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .message-box {
            background-color: #f9f9f9;
            border-right: 4px solid #1565C0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .subject {
            font-size: 18px;
            font-weight: bold;
            color: #1565C0;
            margin-bottom: 15px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666666;
            text-align: center;
        }
        .footer-link {
            color: #1565C0;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">📢 رسالة من فريق Leader Academy</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">السلام عليكم ${recipientName}! 👋</div>
            
            <div class="course-badge">📚 ${courseName}</div>

            <p class="text">
                تلقيت رسالة جديدة من فريق التكوين:
            </p>

            <!-- Message Box -->
            <div class="message-box">
                <div class="subject">الموضوع: ${subject}</div>
                <div style="margin-top: 15px; white-space: pre-wrap;">${message}</div>
            </div>

            <p class="text">
                نشكرك على متابعتك المستمرة لتكويننا. إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>© 2026 Leader Academy Tunisia</div>
            <div style="margin-top: 10px;">
                <a href="mailto:leaderacademy216@gmail.com" class="footer-link">تواصل معنا</a> | 
                <a href="https://wa.me/21650000000" class="footer-link">واتساب</a>
            </div>
        </div>
    </div>
</body>
</html>
  `,
};
