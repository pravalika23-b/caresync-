const db = require('../config/db');
const { createNotification } = require('../services/notificationService');
const { emitQueueUpdate, emitAdminRefresh } = require('../services/socketService');

async function createMedicalRecord(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const { patientId, appointmentId, symptoms, diagnosis, notes, followUpDate, prescriptions } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient ID and Diagnosis are required.' });
    }

    // Verify patient exists
    const patRows = await db.query(
      `SELECT p.id, p.user_id, u.name as patient_name, u.email as patient_email 
       FROM patients p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [patientId]
    );

    if (patRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    const patient = patRows[0];

    // Atomically create medical record and prescriptions
    const recordId = await db.transaction(async (tx) => {
      const recRes = await tx.query(
        `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, symptoms, diagnosis, notes, follow_up_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [patientId, doctorId, appointmentId || null, symptoms || '', diagnosis, notes || '', followUpDate || null]
      );
      const newRecId = recRes.insertId;

      // Insert prescription lines if provided
      if (Array.isArray(prescriptions) && prescriptions.length > 0) {
        for (const item of prescriptions) {
          if (item.medicineName && item.medicineName.trim()) {
            await tx.query(
              `INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, frequency, duration, instructions)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                newRecId,
                item.medicineName.trim(),
                item.dosage || 'As prescribed',
                item.frequency || 'Once daily',
                item.duration || '5 days',
                item.instructions || 'Take after meals'
              ]
            );
          }
        }
      }

      // Mark appointment and queue as COMPLETED
      if (appointmentId) {
        await tx.query("UPDATE appointments SET status = 'COMPLETED' WHERE id = ?", [appointmentId]);
        await tx.query("UPDATE queues SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE appointment_id = ?", [appointmentId]);
      }

      return newRecId;
    });

    // Notify patient
    createNotification({
      userId: patient.user_id,
      title: 'Medical Consultation Completed 📋',
      message: `Your consultation is completed. Diagnosis: "${diagnosis}". You can view and download your full prescription in your Medical History tab.`,
      type: 'appointment',
      emailData: {
        to: patient.patient_email,
        extraHtml: `
          <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 12px; margin-top: 10px;">
            <p><strong>Diagnosis:</strong> ${diagnosis}</p>
            ${followUpDate ? `<p><strong>Recommended Follow-up:</strong> ${followUpDate}</p>` : ''}
            <p>Log in to your CareSync portal to view your complete digital prescription.</p>
          </div>
        `
      }
    });

    emitQueueUpdate(doctorId, { action: 'consultation_completed', appointmentId });
    emitAdminRefresh({ action: 'appointment_completed' });

    res.status(201).json({
      success: true,
      message: 'Medical record and prescriptions saved successfully!',
      recordId
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to save medical record.' });
  }
}

async function getPatientHistory(req, res) {
  try {
    let targetPatientId = req.params.patientId;

    // If patient, restrict to their own records
    if (req.user.role === 'patient') {
      targetPatientId = req.user.patientId;
    }

    if (!targetPatientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    // Fetch patient info
    const patInfo = await db.query(
      `SELECT p.id, p.date_of_birth, p.gender, p.blood_group, u.name, u.email, u.phone 
       FROM patients p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [targetPatientId]
    );

    if (patInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    // Fetch medical records
    const records = await db.query(
      `SELECT mr.id, mr.appointment_id, mr.symptoms, mr.diagnosis, mr.notes, mr.follow_up_date, mr.created_at,
              u_doc.name as doctor_name, dep.name as department_name, doc.specialization
       FROM medical_records mr
       JOIN doctors doc ON mr.doctor_id = doc.id
       JOIN users u_doc ON doc.user_id = u_doc.id
       JOIN departments dep ON doc.department_id = dep.id
       WHERE mr.patient_id = ?
       ORDER BY mr.created_at DESC`,
      [targetPatientId]
    );

    // Fetch prescriptions for each record
    for (const rec of records) {
      rec.prescriptions = await db.query(
        'SELECT id, medicine_name, dosage, frequency, duration, instructions FROM prescriptions WHERE medical_record_id = ?',
        [rec.id]
      );
    }

    res.json({
      success: true,
      patient: patInfo[0],
      totalRecords: records.length,
      records
    });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve patient history.' });
  }
}

async function getRecordById(req, res) {
  try {
    const recordId = req.params.id;

    const rows = await db.query(
      `SELECT mr.*, 
              u_pat.name as patient_name, u_pat.phone as patient_phone, pat.date_of_birth, pat.gender, pat.blood_group,
              u_doc.name as doctor_name, dep.name as department_name, doc.qualification, doc.specialization
       FROM medical_records mr
       JOIN patients pat ON mr.patient_id = pat.id
       JOIN users u_pat ON pat.user_id = u_pat.id
       JOIN doctors doc ON mr.doctor_id = doc.id
       JOIN users u_doc ON doc.user_id = u_doc.id
       JOIN departments dep ON doc.department_id = dep.id
       WHERE mr.id = ?`,
      [recordId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    const record = rows[0];

    // Authorization: only the patient, the doctor, or admin
    if (req.user.role === 'patient' && record.patient_id !== req.user.patientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this record.' });
    }

    record.prescriptions = await db.query(
      'SELECT id, medicine_name, dosage, frequency, duration, instructions FROM prescriptions WHERE medical_record_id = ?',
      [recordId]
    );

    res.json({ success: true, record });
  } catch (error) {
    console.error('Get record by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical record.' });
  }
}

module.exports = {
  createMedicalRecord,
  getPatientHistory,
  getRecordById
};
