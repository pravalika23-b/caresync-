const db = require('../config/db');

async function getAllDoctors(req, res) {
  try {
    const { departmentId, search } = req.query;

    let sql = `
      SELECT d.id, d.user_id, d.specialization, d.qualification, d.experience_years, 
             d.consultation_fee, d.consultation_duration, d.is_active,
             u.name, u.email, u.phone,
             dep.id as department_id, dep.name as department_name, dep.icon as department_icon
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE d.is_active = 1
    `;
    const params = [];

    if (departmentId) {
      sql += ' AND d.department_id = ?';
      params.push(departmentId);
    }

    if (search && search.trim()) {
      sql += ' AND (u.name LIKE ? OR d.specialization LIKE ? OR dep.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY u.name ASC';

    const doctors = await db.query(sql, params);

    // Attach availability summary for each doctor
    for (const doc of doctors) {
      const days = await db.query(
        'SELECT day_of_week FROM doctor_availability WHERE doctor_id = ? AND is_active = 1 ORDER BY day_of_week ASC',
        [doc.id]
      );
      doc.availableDays = days.map(d => d.day_of_week);
    }

    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
  }
}

async function getDoctorById(req, res) {
  try {
    const doctorId = req.params.id;

    const docs = await db.query(
      `SELECT d.id, d.user_id, d.specialization, d.qualification, d.experience_years, 
              d.consultation_fee, d.consultation_duration, d.is_active,
              u.name, u.email, u.phone,
              dep.id as department_id, dep.name as department_name, dep.icon as department_icon, dep.description as department_desc
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN departments dep ON d.department_id = dep.id
       WHERE d.id = ?`,
      [doctorId]
    );

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const doctor = docs[0];

    // Fetch availability schedule
    const schedules = await db.query(
      `SELECT day_of_week, morning_start, morning_end, evening_start, evening_end, slot_duration, is_active
       FROM doctor_availability
       WHERE doctor_id = ?
       ORDER BY day_of_week ASC`,
      [doctorId]
    );

    // Fetch blocked leave dates
    const today = new Date().toISOString().split('T')[0];
    const blockedDates = await db.query(
      'SELECT blocked_date, reason FROM doctor_blocked_dates WHERE doctor_id = ? AND blocked_date >= ? ORDER BY blocked_date ASC',
      [doctorId, today]
    );

    res.json({
      success: true,
      doctor: {
        ...doctor,
        schedules,
        blockedDates
      }
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor details.' });
  }
}

async function updateDoctorProfile(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const { specialization, qualification, experienceYears, consultationFee, consultationDuration } = req.body;

    await db.query(
      `UPDATE doctors
       SET specialization = COALESCE(?, specialization),
           qualification = COALESCE(?, qualification),
           experience_years = COALESCE(?, experience_years),
           consultation_fee = COALESCE(?, consultation_fee),
           consultation_duration = COALESCE(?, consultation_duration)
       WHERE id = ?`,
      [specialization, qualification, experienceYears, consultationFee, consultationDuration, doctorId]
    );

    res.json({ success: true, message: 'Doctor professional profile updated successfully!' });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update doctor profile.' });
  }
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile
};
