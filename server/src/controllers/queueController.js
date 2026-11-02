const db = require('../config/db');
const { getAppointmentQueueDetails, getDoctorQueueBoard } = require('../services/queueService');
const { emitQueueUpdate, emitPatientAlert, emitAdminRefresh } = require('../services/socketService');
const { createNotification } = require('../services/notificationService');

async function checkIn(req, res) {
  try {
    const appointmentId = req.params.id;

    // Fetch appointment
    const aptRows = await db.query(
      `SELECT a.*, p.user_id as patient_user_id, u.name as patient_name, doc.id as doctor_id, u_doc.name as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       JOIN doctors doc ON a.doctor_id = doc.id
       JOIN users u_doc ON doc.user_id = u_doc.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (aptRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const apt = aptRows[0];

    // Authorization
    if (req.user.role === 'patient' && apt.patient_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Date check (allow check-in on appointment day)
    const today = new Date().toISOString().split('T')[0];
    if (apt.appointment_date !== today) {
      return res.status(400).json({
        success: false,
        message: `Check-in is only allowed on the appointment day (${apt.appointment_date}). Today is ${today}.`
      });
    }

    if (apt.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot check in for a cancelled appointment.' });
    }

    if (apt.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Appointment already completed.' });
    }

    // Check if already in active queue
    const existingQueue = await db.query('SELECT id, status FROM queues WHERE appointment_id = ?', [appointmentId]);

    if (existingQueue.length > 0) {
      return res.json({
        success: true,
        message: 'Already checked in.',
        queueStatus: existingQueue[0].status
      });
    }

    // Insert into queues table and update appointment
    await db.transaction(async (tx) => {
      await tx.query(
        "UPDATE appointments SET status = 'WAITING', check_in_time = CURRENT_TIMESTAMP WHERE id = ?",
        [appointmentId]
      );
      await tx.query(
        `INSERT INTO queues (appointment_id, doctor_id, queue_date, queue_number, status)
         VALUES (?, ?, ?, ?, 'WAITING')`,
        [appointmentId, apt.doctor_id, today, apt.queue_number]
      );
    });

    // Notify patient
    createNotification({
      userId: apt.patient_user_id,
      title: 'Checked In Successfully ⏱️',
      message: `You are checked in with ${apt.doctor_name}. Your Queue Number is #${apt.queue_number}. Please keep an eye on your live queue tracker.`,
      type: 'queue'
    });

    // Broadcast live WebSocket update
    emitQueueUpdate(apt.doctor_id, { action: 'patient_checked_in', appointmentId, queueNumber: apt.queue_number });
    emitAdminRefresh({ action: 'queue_update' });

    res.json({
      success: true,
      message: 'Check-in confirmed! You are now in the live waiting queue.',
      queueNumber: apt.queue_number
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ success: false, message: 'Failed to process check-in.' });
  }
}

async function getPatientQueue(req, res) {
  try {
    const appointmentId = req.params.id;
    const details = await getAppointmentQueueDetails(appointmentId);

    if (!details) {
      return res.status(404).json({ success: false, message: 'Appointment queue details not found.' });
    }

    res.json({ success: true, queue: details });
  } catch (error) {
    console.error('Get patient queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve queue status.' });
  }
}

async function getDoctorQueue(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const board = await getDoctorQueueBoard(doctorId, date);
    res.json({ success: true, board });
  } catch (error) {
    console.error('Get doctor queue error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve doctor queue board.' });
  }
}

async function callNextPatient(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const today = new Date().toISOString().split('T')[0];

    // 1. Find next waiting patient in queue
    const nextPatients = await db.query(
      `SELECT q.id as queue_id, q.appointment_id, q.queue_number,
              a.patient_id, p.user_id as patient_user_id, u.name as patient_name
       FROM queues q
       JOIN appointments a ON q.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE q.doctor_id = ? AND q.queue_date = ? AND q.status = 'WAITING'
       ORDER BY q.queue_number ASC LIMIT 1`,
      [doctorId, today]
    );

    if (nextPatients.length === 0) {
      return res.status(404).json({ success: false, message: 'No more waiting patients in today’s queue.' });
    }

    const next = nextPatients[0];

    // 2. If there's an existing patient marked CALLED, complete them automatically or prompt
    await db.query(
      `UPDATE queues SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP 
       WHERE doctor_id = ? AND queue_date = ? AND status = 'CALLED'`,
      [doctorId, today]
    );

    // 3. Mark next patient as CALLED and update appointment
    await db.transaction(async (tx) => {
      await tx.query(
        "UPDATE queues SET status = 'CALLED', called_at = CURRENT_TIMESTAMP WHERE id = ?",
        [next.queue_id]
      );
      await tx.query(
        "UPDATE appointments SET status = 'IN_PROGRESS' WHERE id = ?",
        [next.appointment_id]
      );
    });

    // 4. Alert patient via in-app & WebSocket
    createNotification({
      userId: next.patient_user_id,
      title: 'Doctor is Ready For You! 🔔',
      message: `Queue #${next.queue_number}: The doctor has called your number. Please proceed to the consultation room.`,
      type: 'queue'
    });

    emitPatientAlert(next.patient_user_id, 'queue:called', {
      queueNumber: next.queue_number,
      message: 'Your turn has arrived! Please step into the doctor room.'
    });

    // 5. Broadcast to doctor room and admin
    emitQueueUpdate(doctorId, { action: 'patient_called', currentQueueNumber: next.queue_number });
    emitAdminRefresh({ action: 'queue_update' });

    res.json({
      success: true,
      message: `Now calling Queue #${next.queue_number} (${next.patient_name})`,
      patient: next
    });
  } catch (error) {
    console.error('Call next patient error:', error);
    res.status(500).json({ success: false, message: 'Failed to call next patient.' });
  }
}

async function updateQueueStatus(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const { queueId, status } = req.body; // status: 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED'

    const validStatuses = ['IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'WAITING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid queue status.' });
    }

    const queueRow = await db.query('SELECT * FROM queues WHERE id = ? AND doctor_id = ?', [queueId, doctorId]);
    if (queueRow.length === 0) {
      return res.status(404).json({ success: false, message: 'Queue record not found.' });
    }

    const q = queueRow[0];

    await db.transaction(async (tx) => {
      const now = new Date().toISOString();
      if (status === 'COMPLETED') {
        await tx.query("UPDATE queues SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?", [queueId]);
        await tx.query("UPDATE appointments SET status = 'COMPLETED' WHERE id = ?", [q.appointment_id]);
      } else if (status === 'IN_CONSULTATION') {
        await tx.query("UPDATE queues SET status = 'IN_CONSULTATION' WHERE id = ?", [queueId]);
        await tx.query("UPDATE appointments SET status = 'IN_PROGRESS' WHERE id = ?", [q.appointment_id]);
      } else if (status === 'SKIPPED') {
        await tx.query("UPDATE queues SET status = 'SKIPPED' WHERE id = ?", [queueId]);
        await tx.query("UPDATE appointments SET status = 'NO_SHOW' WHERE id = ?", [q.appointment_id]);
      }
    });

    emitQueueUpdate(doctorId, { action: 'status_changed', queueId, status });
    emitAdminRefresh({ action: 'queue_update' });

    res.json({ success: true, message: `Queue status updated to ${status}.` });
  } catch (error) {
    console.error('Update queue status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update queue status.' });
  }
}

module.exports = {
  checkIn,
  getPatientQueue,
  getDoctorQueue,
  callNextPatient,
  updateQueueStatus
};
