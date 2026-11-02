const db = require('../config/db');
const { getNextQueueNumber } = require('../services/queueService');
const { createNotification } = require('../services/notificationService');
const { emitQueueUpdate, emitPatientAlert, emitAdminRefresh } = require('../services/socketService');

async function bookAppointment(req, res) {
  try {
    const patientId = req.user.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, message: 'Only registered patients can book appointments.' });
    }

    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Doctor, appointment date, and time slot are required.' });
    }

    // Date validation
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments in the past.' });
    }

    // Check doctor active
    const docCheck = await db.query(
      `SELECT d.id, u.name as doctor_name, u.email as doctor_email, dep.name as department_name 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       JOIN departments dep ON d.department_id = dep.id
       WHERE d.id = ? AND d.is_active = 1`,
      [doctorId]
    );

    if (docCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found or currently inactive.' });
    }
    const doctor = docCheck[0];

    // ATOMIC TRANSACTION WITH CONFLICT CHECK
    const result = await db.transaction(async (tx) => {
      // 1. Verify slot is still open
      const existing = await tx.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'CANCELLED'`,
        [doctorId, appointmentDate, appointmentTime]
      );

      if (existing.length > 0) {
        const error = new Error('This time slot was just booked by another patient. Please select a different slot.');
        error.statusCode = 409;
        throw error;
      }

      // 2. Compute next sequential queue number for doctor on that date
      const qRes = await tx.query(
        'SELECT MAX(queue_number) as max_q FROM appointments WHERE doctor_id = ? AND appointment_date = ?',
        [doctorId, appointmentDate]
      );
      const queueNumber = Number(qRes[0]?.max_q || 0) + 1;

      // 3. Insert appointment
      const insRes = await tx.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, queue_number, status, reason)
         VALUES (?, ?, ?, ?, ?, 'BOOKED', ?)`,
        [patientId, doctorId, appointmentDate, appointmentTime, queueNumber, reason || 'General Consultation']
      );

      return {
        appointmentId: insRes.insertId,
        queueNumber
      };
    });

    // 4. Send Confirmation Notification & Email
    const appointmentInfo = {
      id: result.appointmentId,
      queueNumber: result.queueNumber,
      doctorName: doctor.doctor_name,
      departmentName: doctor.department_name,
      appointmentDate,
      appointmentTime
    };

    createNotification({
      userId: req.user.id,
      title: 'Appointment Confirmed! 🏥',
      message: `Your appointment with ${doctor.doctor_name} (${doctor.department_name}) is confirmed for ${appointmentDate} at ${appointmentTime}. Assigned Queue #${result.queueNumber}.`,
      type: 'appointment',
      emailData: {
        to: req.user.email,
        extraHtml: `
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <p><strong>Doctor:</strong> ${doctor.doctor_name}</p>
            <p><strong>Department:</strong> ${doctor.department_name}</p>
            <p><strong>Date & Time:</strong> ${appointmentDate} at ${appointmentTime}</p>
            <p><strong>Queue Number:</strong> #${result.queueNumber}</p>
            <p><strong>Appointment ID:</strong> APT-${result.appointmentId}</p>
          </div>
        `
      }
    });

    // Emit live WebSocket update
    emitQueueUpdate(doctorId, { action: 'new_booking', appointment: appointmentInfo });
    emitAdminRefresh({ action: 'appointment_created' });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: appointmentInfo
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    if (error.statusCode === 409 || error.message.includes('booked by another patient')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to book appointment.' });
  }
}

async function getMyPatientAppointments(req, res) {
  try {
    const patientId = req.user.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, message: 'Patient profile not found.' });
    }

    const appointments = await db.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.queue_number, a.status, a.reason, a.check_in_time, a.created_at,
              u.name as doctor_name, u.phone as doctor_phone,
              d.id as doctor_id, d.specialization, d.consultation_fee,
              dep.name as department_name, dep.icon as department_icon,
              q.status as queue_status
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       JOIN departments dep ON d.department_id = dep.id
       LEFT JOIN queues q ON a.id = q.appointment_id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );

    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter(a => a.appointment_date >= today && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
    const past = appointments.filter(a => a.appointment_date < today || a.status === 'CANCELLED' || a.status === 'COMPLETED');

    res.json({
      success: true,
      total: appointments.length,
      upcoming,
      past
    });
  } catch (error) {
    console.error('Get my patient appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
}

async function getDoctorAppointments(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const { date, status } = req.query;

    let sql = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.queue_number, a.status, a.reason, a.check_in_time,
             u.name as patient_name, u.email as patient_email, u.phone as patient_phone,
             p.id as patient_id, p.date_of_birth, p.gender, p.blood_group,
             q.status as queue_status, q.called_at, q.completed_at
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN queues q ON a.id = q.appointment_id
      WHERE a.doctor_id = ?
    `;
    const params = [doctorId];

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

    const appointments = await db.query(sql, params);
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
}

async function cancelAppointment(req, res) {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;

    // Fetch appointment
    const aptRows = await db.query(
      `SELECT a.*, d.id as doctor_id, u_doc.name as doctor_name, u_pat.id as patient_user_id, u_pat.name as patient_name
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doc ON d.user_id = u_doc.id
       JOIN patients p ON a.patient_id = p.id
       JOIN users u_pat ON p.user_id = u_pat.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (aptRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const apt = aptRows[0];

    // Authorization check: patient who booked, the doctor, or admin
    const isOwner = req.user.role === 'patient' && apt.patient_user_id === userId;
    const isAssignedDoctor = req.user.role === 'doctor' && req.user.doctorId === apt.doctor_id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment.' });
    }

    if (apt.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed consultation.' });
    }

    // Cancel appointment and remove from queue
    await db.transaction(async (tx) => {
      await tx.query("UPDATE appointments SET status = 'CANCELLED' WHERE id = ?", [appointmentId]);
      await tx.query("DELETE FROM queues WHERE appointment_id = ?", [appointmentId]);
    });

    // Notify patient
    createNotification({
      userId: apt.patient_user_id,
      title: 'Appointment Cancelled',
      message: `Your appointment with ${apt.doctor_name} on ${apt.appointment_date} at ${apt.appointment_time} has been cancelled. Slot is now released.`,
      type: 'appointment'
    });

    emitQueueUpdate(apt.doctor_id, { action: 'appointment_cancelled', appointmentId });
    emitAdminRefresh({ action: 'appointment_cancelled' });

    res.json({ success: true, message: 'Appointment cancelled successfully. Slot has been freed.' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
}

module.exports = {
  bookAppointment,
  getMyPatientAppointments,
  getDoctorAppointments,
  cancelAppointment
};
