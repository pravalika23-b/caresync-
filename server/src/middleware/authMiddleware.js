const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }

    // Fetch user from database
    const users = await db.query(
      'SELECT id, name, email, role, phone FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];

    // If role is patient, attach patient_id
    if (user.role === 'patient') {
      const patient = await db.query('SELECT id, blood_group FROM patients WHERE user_id = ?', [user.id]);
      if (patient.length > 0) {
        user.patientId = patient[0].id;
        user.bloodGroup = patient[0].blood_group;
      }
    } else if (user.role === 'doctor') {
      const doctor = await db.query(
        'SELECT id, department_id, specialization, consultation_fee, consultation_duration FROM doctors WHERE user_id = ?',
        [user.id]
      );
      if (doctor.length > 0) {
        user.doctorId = doctor[0].id;
        user.departmentId = doctor[0].department_id;
        user.consultationFee = doctor[0].consultation_fee;
        user.consultationDuration = doctor[0].consultation_duration;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
}

module.exports = authMiddleware;
