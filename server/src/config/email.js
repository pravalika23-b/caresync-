const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Generate test Ethereal account if no credentials supplied
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Nodemailer using ethereal test credentials:', testAccount.user);
    } catch (err) {
      console.warn('⚠️ Could not create Ethereal account. Using mock email logger.');
      transporter = {
        sendMail: async (options) => {
          console.log(`📨 [MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
          return { messageId: 'mock-' + Date.now() };
        }
      };
    }
  }

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"CareSync Hospital" <noreply@caresync.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html
    });

    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📨 Email Preview URL: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    // Don't throw error to prevent breaking user workflow
    return null;
  }
}

module.exports = {
  sendEmail
};
