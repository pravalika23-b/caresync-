const db = require('../config/db');
const { getDoctorSlots } = require('../services/slotService');

async function getAvailableSlots(req, res) {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date query parameters are required.' });
    }

    const slotData = await getDoctorSlots(Number(doctorId), date);
    res.json(slotData);
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate appointment slots.' });
  }
}

async function getMyAvailability(req, res) {
  try {
    const doctorId = req.user.doctorId;

    const schedules = await db.query(
      `SELECT id, day_of_week, morning_start, morning_end, evening_start, evening_end, slot_duration, is_active
       FROM doctor_availability
       WHERE doctor_id = ?
       ORDER BY day_of_week ASC`,
      [doctorId]
    );

    const today = new Date().toISOString().split('T')[0];
    const blockedDates = await db.query(
      'SELECT id, blocked_date, reason FROM doctor_blocked_dates WHERE doctor_id = ? AND blocked_date >= ? ORDER BY blocked_date ASC',
      [doctorId, today]
    );

    res.json({ success: true, schedules, blockedDates });
  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor schedule.' });
  }
}

async function updateDayAvailability(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const { dayOfWeek, morningStart, morningEnd, eveningStart, eveningEnd, slotDuration, isActive } = req.body;

    if (dayOfWeek === undefined || dayOfWeek === null) {
      return res.status(400).json({ success: false, message: 'dayOfWeek is required (0-6).' });
    }

    // Upsert into doctor_availability
    const existing = await db.query(
      'SELECT id FROM doctor_availability WHERE doctor_id = ? AND day_of_week = ?',
      [doctorId, dayOfWeek]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE doctor_availability
         SET morning_start = ?, morning_end = ?, evening_start = ?, evening_end = ?, slot_duration = ?, is_active = ?
         WHERE doctor_id = ? AND day_of_week = ?`,
        [morningStart, morningEnd, eveningStart, eveningEnd, slotDuration, isActive ? 1 : 0, doctorId, dayOfWeek]
      );
    } else {
      await db.query(
        `INSERT INTO doctor_availability (doctor_id, day_of_week, morning_start, morning_end, evening_start, evening_end, slot_duration, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [doctorId, dayOfWeek, morningStart, morningEnd, eveningStart, eveningEnd, slotDuration, isActive ? 1 : 0]
      );
    }

    res.json({ success: true, message: 'Schedule updated successfully!' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule.' });
  }
}

async function addBlockedDate(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const { blockedDate, reason } = req.body;

    if (!blockedDate) {
      return res.status(400).json({ success: false, message: 'blockedDate is required (YYYY-MM-DD).' });
    }

    await db.query(
      'INSERT INTO doctor_blocked_dates (doctor_id, blocked_date, reason) VALUES (?, ?, ?)',
      [doctorId, blockedDate, reason || 'Unavailable']
    );

    res.status(201).json({ success: true, message: 'Date marked as unavailable / on leave.' });
  } catch (error) {
    console.error('Add blocked date error:', error);
    if (error.message.includes('UNIQUE') || error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This date is already marked as blocked.' });
    }
    res.status(500).json({ success: false, message: 'Failed to block date.' });
  }
}

async function removeBlockedDate(req, res) {
  try {
    const doctorId = req.user.doctorId;
    const blockedId = req.params.id;

    await db.query('DELETE FROM doctor_blocked_dates WHERE id = ? AND doctor_id = ?', [blockedId, doctorId]);
    res.json({ success: true, message: 'Blocked date removed successfully.' });
  } catch (error) {
    console.error('Remove blocked date error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove blocked date.' });
  }
}

module.exports = {
  getAvailableSlots,
  getMyAvailability,
  updateDayAvailability,
  addBlockedDate,
  removeBlockedDate
};
