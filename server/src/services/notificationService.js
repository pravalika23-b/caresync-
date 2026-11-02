const db = require('../config/db');
const { sendEmail } = require('../config/email');
const { emitPatientAlert } = require('./socketService');

async function createNotification({ userId, title, message, type = 'system', emailData = null }) {
  try {
    // 1. Insert in-app notification row
    const res = await db.query(
      'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)',
      [userId, title, message, type]
    );

    const notification = {
      id: res.insertId,
      user_id: userId,
      title,
      message,
      type,
      is_read: 0,
      created_at: new Date().toISOString()
    };

    // 2. Real-time push to patient's socket room
    emitPatientAlert(userId, 'notification:new', notification);

    // 3. Email dispatch (if recipient email is known)
    if (emailData && emailData.to) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0d9488; color: white; padding: 15px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0;">CareSync Hospital</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px;">Smart Appointment & Queue Care</p>
          </div>
          <div style="padding: 20px 0;">
            <h3 style="color: #0f172a; margin-top: 0;">${title}</h3>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">${message}</p>
            ${emailData.extraHtml || ''}
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            CareSync Hospital Management System • Please do not reply directly to this automated email.
          </p>
        </div>
      `;

      sendEmail({
        to: emailData.to,
        subject: `CareSync Notification: ${title}`,
        html: emailHtml
      }).catch(err => console.error('Error in background email send:', err));
    }

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error);
    return null;
  }
}

module.exports = {
  createNotification
};
