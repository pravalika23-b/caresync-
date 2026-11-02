const db = require('../config/db');

async function getNextQueueNumber(doctorId, appointmentDate) {
  const res = await db.query(
    'SELECT MAX(queue_number) as max_num FROM appointments WHERE doctor_id = ? AND appointment_date = ?',
    [doctorId, appointmentDate]
  );
  const maxNum = res[0].max_num || 0;
  return Number(maxNum) + 1;
}

async function getAppointmentQueueDetails(appointmentId) {
  const aptRows = await db.query(
    `SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time, 
            a.queue_number, a.status as appointment_status, a.check_in_time,
            u_doc.name as doctor_name, dep.name as department_name, doc.consultation_duration,
            u_pat.name as patient_name, u_pat.phone as patient_phone,
            q.status as queue_status, q.called_at, q.completed_at
     FROM appointments a
     JOIN doctors doc ON a.doctor_id = doc.id
     JOIN users u_doc ON doc.user_id = u_doc.id
     JOIN departments dep ON doc.department_id = dep.id
     JOIN patients pat ON a.patient_id = pat.id
     JOIN users u_pat ON pat.user_id = u_pat.id
     LEFT JOIN queues q ON a.id = q.appointment_id
     WHERE a.id = ?`,
    [appointmentId]
  );

  if (aptRows.length === 0) {
    return null;
  }

  const apt = aptRows[0];
  const doctorId = apt.doctor_id;
  const date = apt.appointment_date;
  const myQueueNum = apt.queue_number;
  const duration = apt.consultation_duration || 15;

  // Find currently serving patient
  const servingRows = await db.query(
    `SELECT q.queue_number, u.name as patient_name, q.status, q.called_at
     FROM queues q
     JOIN appointments a ON q.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE q.doctor_id = ? AND q.queue_date = ? AND q.status IN ('CALLED', 'IN_CONSULTATION')
     ORDER BY q.called_at DESC LIMIT 1`,
    [doctorId, date]
  );
  const currentServing = servingRows.length > 0 ? servingRows[0] : null;

  // Count active patients ahead in WAITING queue
  const aheadRows = await db.query(
    `SELECT COUNT(*) as count_ahead FROM queues 
     WHERE doctor_id = ? AND queue_date = ? AND status = 'WAITING' AND queue_number < ?`,
    [doctorId, date, myQueueNum]
  );
  const patientsAhead = Number(aheadRows[0].count_ahead || 0);

  // If appointment is not checked in yet, calculate based on queue number difference
  let estimatedWaitMins = 0;
  if (apt.queue_status === 'WAITING') {
    // Already in queue
    estimatedWaitMins = patientsAhead * duration + (currentServing ? Math.floor(duration / 2) : 0);
  } else if (apt.appointment_status === 'BOOKED' || apt.appointment_status === 'CONFIRMED') {
    // Not checked in yet
    const estimatedPatientsBefore = Math.max(0, myQueueNum - (currentServing ? currentServing.queue_number : 1));
    estimatedWaitMins = estimatedPatientsBefore * duration;
  }

  return {
    appointmentId: apt.id,
    doctorName: apt.doctor_name,
    departmentName: apt.department_name,
    patientName: apt.patient_name,
    appointmentDate: apt.appointment_date,
    appointmentTime: apt.appointment_time,
    queueNumber: apt.queue_number,
    appointmentStatus: apt.appointment_status,
    queueStatus: apt.queue_status || 'NOT_CHECKED_IN',
    currentlyServingNumber: currentServing ? currentServing.queue_number : null,
    currentlyServingPatient: currentServing ? currentServing.patient_name : null,
    patientsAhead,
    estimatedWaitMinutes: Math.max(0, estimatedWaitMins),
    consultationDuration: duration,
    checkInTime: apt.check_in_time
  };
}

async function getDoctorQueueBoard(doctorId, date) {
  // 1. Fetch current serving
  const activeConsultation = await db.query(
    `SELECT q.id as queue_id, q.queue_number, q.status, q.called_at,
            a.id as appointment_id, a.appointment_time, a.reason,
            u.id as user_id, u.name as patient_name, u.phone as patient_phone,
            p.id as patient_id, p.date_of_birth, p.gender, p.blood_group
     FROM queues q
     JOIN appointments a ON q.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE q.doctor_id = ? AND q.queue_date = ? AND q.status IN ('CALLED', 'IN_CONSULTATION')
     ORDER BY q.called_at DESC LIMIT 1`,
    [doctorId, date]
  );

  // 2. Fetch waiting queue
  const waitingQueue = await db.query(
    `SELECT q.id as queue_id, q.queue_number, q.status,
            a.id as appointment_id, a.appointment_time, a.reason, a.check_in_time,
            u.id as user_id, u.name as patient_name, u.phone as patient_phone,
            p.id as patient_id, p.date_of_birth, p.gender, p.blood_group
     FROM queues q
     JOIN appointments a ON q.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE q.doctor_id = ? AND q.queue_date = ? AND q.status = 'WAITING'
     ORDER BY q.queue_number ASC`,
    [doctorId, date]
  );

  // 3. Fetch completed patients today
  const completedQueue = await db.query(
    `SELECT q.id as queue_id, q.queue_number, q.status, q.completed_at,
            a.id as appointment_id, a.appointment_time,
            u.name as patient_name
     FROM queues q
     JOIN appointments a ON q.appointment_id = a.id
     JOIN patients p ON a.patient_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE q.doctor_id = ? AND q.queue_date = ? AND q.status = 'COMPLETED'
     ORDER BY q.completed_at DESC`,
    [doctorId, date]
  );

  // 4. Counts breakdown
  const statsRows = await db.query(
    `SELECT 
       COUNT(*) as total_appointments,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
       SUM(CASE WHEN status IN ('CHECKED_IN', 'WAITING') THEN 1 ELSE 0 END) as waiting_count,
       SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
       SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_count,
       SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) as booked_count
     FROM appointments
     WHERE doctor_id = ? AND appointment_date = ?`,
    [doctorId, date]
  );

  return {
    date,
    currentPatient: activeConsultation.length > 0 ? activeConsultation[0] : null,
    nextPatient: waitingQueue.length > 0 ? waitingQueue[0] : null,
    waitingList: waitingQueue,
    completedList: completedQueue,
    stats: {
      total: Number(statsRows[0]?.total_appointments || 0),
      completed: Number(statsRows[0]?.completed_count || 0),
      waiting: Number(statsRows[0]?.waiting_count || 0),
      inProgress: Number(statsRows[0]?.in_progress_count || 0),
      cancelled: Number(statsRows[0]?.cancelled_count || 0),
      booked: Number(statsRows[0]?.booked_count || 0)
    }
  };
}

module.exports = {
  getNextQueueNumber,
  getAppointmentQueueDetails,
  getDoctorQueueBoard
};
