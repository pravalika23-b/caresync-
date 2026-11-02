const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { emitAdminRefresh } = require('../services/socketService');

async function getDashboardStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Counts
    const totalPatientsRes = await db.query('SELECT COUNT(*) as count FROM patients');
    const totalDoctorsRes = await db.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = 1');
    const totalDeptsRes = await db.query('SELECT COUNT(*) as count FROM departments');

    // Today's appointment counts
    const todayAptsRes = await db.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status IN ('CHECKED_IN', 'WAITING', 'IN_PROGRESS') THEN 1 ELSE 0 END) as waiting,
         SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
         SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) as booked,
         SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show
       FROM appointments 
       WHERE appointment_date = ?`,
      [today]
    );

    // Department-wise appointment distribution
    const deptStats = await db.query(
      `SELECT dep.name, COUNT(a.id) as appointment_count
       FROM departments dep
       LEFT JOIN doctors d ON dep.id = d.department_id
       LEFT JOIN appointments a ON d.id = a.doctor_id
       GROUP BY dep.id, dep.name
       ORDER BY appointment_count DESC`
    );

    // Recent 6 appointments
    const recentAppointments = await db.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.queue_number, a.status,
              u_pat.name as patient_name, u_doc.name as doctor_name, dep.name as department_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u_pat ON p.user_id = u_pat.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doc ON d.user_id = u_doc.id
       JOIN departments dep ON d.department_id = dep.id
       ORDER BY a.id DESC LIMIT 6`
    );

    const todayStats = todayAptsRes[0] || {};

    res.json({
      success: true,
      stats: {
        totalPatients: Number(totalPatientsRes[0]?.count || 0),
        totalDoctors: Number(totalDoctorsRes[0]?.count || 0),
        totalDepartments: Number(totalDeptsRes[0]?.count || 0),
        todayTotal: Number(todayStats.total || 0),
        todayCompleted: Number(todayStats.completed || 0),
        todayWaiting: Number(todayStats.waiting || 0),
        todayCancelled: Number(todayStats.cancelled || 0),
        todayBooked: Number(todayStats.booked || 0),
        todayNoShow: Number(todayStats.no_show || 0)
      },
      departmentDistribution: deptStats,
      recentAppointments
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
}

async function getAdminDoctors(req, res) {
  try {
    const doctors = await db.query(
      `SELECT d.id, d.user_id, d.specialization, d.qualification, d.experience_years, 
              d.consultation_fee, d.consultation_duration, d.is_active,
              u.name, u.email, u.phone,
              dep.id as department_id, dep.name as department_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN departments dep ON d.department_id = dep.id
       ORDER BY d.id DESC`
    );
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Get admin doctors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
  }
}

async function createDoctor(req, res) {
  try {
    const { name, email, password, phone, departmentId, specialization, qualification, experienceYears, consultationFee, consultationDuration } = req.body;

    if (!name || !email || !password || !departmentId || !specialization) {
      return res.status(400).json({ success: false, message: 'Name, email, password, department, and specialization are required.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.transaction(async (tx) => {
      const uRes = await tx.query(
        'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), passwordHash, 'doctor', phone || null]
      );
      const userId = uRes.insertId;

      const dRes = await tx.query(
        `INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, consultation_fee, consultation_duration, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [userId, departmentId, specialization, qualification || '', experienceYears || 0, consultationFee || 500, consultationDuration || 15]
      );
      const doctorId = dRes.insertId;

      // Seed standard Mon-Fri availability
      for (let day = 1; day <= 5; day++) {
        await tx.query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, morning_start, morning_end, evening_start, evening_end, slot_duration, is_active)
           VALUES (?, ?, '09:00', '13:00', '16:00', '19:00', ?, 1)`,
          [doctorId, day, consultationDuration || 15]
        );
      }

      return { userId, doctorId };
    });

    emitAdminRefresh({ action: 'doctor_created' });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully with standard Monday-Friday consultation hours!',
      doctor: result
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ success: false, message: 'Failed to create doctor.' });
  }
}

async function toggleDoctorStatus(req, res) {
  try {
    const doctorId = req.params.id;
    const { isActive } = req.body;

    await db.query('UPDATE doctors SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, doctorId]);
    emitAdminRefresh({ action: 'doctor_status_changed' });

    res.json({ success: true, message: `Doctor ${isActive ? 'activated' : 'deactivated'} successfully.` });
  } catch (error) {
    console.error('Toggle doctor status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update doctor status.' });
  }
}

async function getAdminPatients(req, res) {
  try {
    const patients = await db.query(
      `SELECT p.id, p.date_of_birth, p.gender, p.blood_group, p.address, p.emergency_contact,
              u.id as user_id, u.name, u.email, u.phone, u.created_at,
              COUNT(a.id) as total_appointments
       FROM patients p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN appointments a ON p.id = a.patient_id
       GROUP BY p.id, u.id
       ORDER BY p.id DESC`
    );
    res.json({ success: true, count: patients.length, patients });
  } catch (error) {
    console.error('Get admin patients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patients.' });
  }
}

// Department CRUD
async function getDepartments(req, res) {
  try {
    const departments = await db.query(
      `SELECT dep.*, COUNT(d.id) as doctor_count
       FROM departments dep
       LEFT JOIN doctors d ON dep.id = d.department_id AND d.is_active = 1
       GROUP BY dep.id
       ORDER BY dep.name ASC`
    );
    res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
}

async function createDepartment(req, res) {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required.' });
    }

    const result = await db.query(
      'INSERT INTO departments (name, description, icon) VALUES (?, ?, ?)',
      [name.trim(), description || '', icon || 'Activity']
    );

    res.status(201).json({
      success: true,
      message: 'Department added successfully!',
      departmentId: result.insertId
    });
  } catch (error) {
    console.error('Create department error:', error);
    if (error.message.includes('UNIQUE') || error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A department with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
}

async function updateDepartment(req, res) {
  try {
    const deptId = req.params.id;
    const { name, description, icon } = req.body;

    await db.query(
      `UPDATE departments 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           icon = COALESCE(?, icon)
       WHERE id = ?`,
      [name ? name.trim() : null, description, icon, deptId]
    );

    res.json({ success: true, message: 'Department updated successfully.' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
}

async function deleteDepartment(req, res) {
  try {
    const deptId = req.params.id;

    // Check if any doctors belong to this department
    const docs = await db.query('SELECT id FROM doctors WHERE department_id = ?', [deptId]);
    if (docs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with active assigned doctors. Please reassign or deactivate doctors first.'
      });
    }

    await db.query('DELETE FROM departments WHERE id = ?', [deptId]);
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
}

async function getAllAppointments(req, res) {
  try {
    const { date, status, departmentId } = req.query;

    let sql = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.queue_number, a.status, a.reason, a.created_at,
             u_pat.name as patient_name, u_pat.email as patient_email, u_pat.phone as patient_phone,
             u_doc.name as doctor_name, dep.name as department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_pat ON p.user_id = u_pat.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u_doc ON d.user_id = u_doc.id
      JOIN departments dep ON d.department_id = dep.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (departmentId) {
      sql += ' AND dep.id = ?';
      params.push(departmentId);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 200';

    const appointments = await db.query(sql, params);
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
}

module.exports = {
  getDashboardStats,
  getAdminDoctors,
  createDoctor,
  toggleDoctorStatus,
  getAdminPatients,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllAppointments
};
