const db = require('../config/db');

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(mins) {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generateIntervals(startStr, endStr, intervalMinutes) {
  if (!startStr || !endStr) return [];
  const startMins = timeToMinutes(startStr);
  const endMins = timeToMinutes(endStr);
  const intervals = [];

  for (let current = startMins; current + intervalMinutes <= endMins; current += intervalMinutes) {
    intervals.push(minutesToTime(current));
  }
  return intervals;
}

async function getDoctorSlots(doctorId, dateString) {
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }

  const today = new Date().toISOString().split('T')[0];
  if (dateString < today) {
    return {
      success: false,
      isBlocked: false,
      message: 'Cannot view or book slots for dates in the past.',
      slots: []
    };
  }

  // 1. Check if doctor is blocked/on leave on this date
  const blockedRows = await db.query(
    'SELECT reason FROM doctor_blocked_dates WHERE doctor_id = ? AND blocked_date = ?',
    [doctorId, dateString]
  );
  if (blockedRows.length > 0) {
    return {
      success: true,
      isBlocked: true,
      message: `Doctor is unavailable on this date: ${blockedRows[0].reason || 'On Leave'}`,
      slots: []
    };
  }

  // 2. Determine day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Note: parsing Date('YYYY-MM-DD') in local time:
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  // 3. Fetch doctor's availability configuration
  const availRows = await db.query(
    'SELECT morning_start, morning_end, evening_start, evening_end, slot_duration FROM doctor_availability WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1',
    [doctorId, dayOfWeek]
  );

  if (availRows.length === 0) {
    return {
      success: true,
      isBlocked: false,
      message: 'Doctor does not have consultation hours on this day.',
      slots: []
    };
  }

  const avail = availRows[0];
  const slotDuration = avail.slot_duration || 15;

  // 4. Generate candidate slots
  const morningSlots = generateIntervals(avail.morning_start, avail.morning_end, slotDuration);
  const eveningSlots = generateIntervals(avail.evening_start, avail.evening_end, slotDuration);
  const allSlots = [...morningSlots, ...eveningSlots];

  // 5. Fetch already booked appointments on this date
  const bookedRows = await db.query(
    `SELECT appointment_time FROM appointments 
     WHERE doctor_id = ? AND appointment_date = ? AND status != 'CANCELLED'`,
    [doctorId, dateString]
  );
  const bookedSet = new Set(bookedRows.map(r => r.appointment_time));

  // 6. Current time check if date is today
  const now = new Date();
  const isToday = dateString === today;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 7. Assemble slot objects
  const slots = allSlots.map((time) => {
    const isBooked = bookedSet.has(time);
    const slotMins = timeToMinutes(time);
    const isPast = isToday && slotMins <= currentMinutes;

    let status = 'AVAILABLE';
    if (isBooked) status = 'BOOKED';
    else if (isPast) status = 'PAST';

    return {
      time,
      isAvailable: !isBooked && !isPast,
      status,
      session: timeToMinutes(time) < 720 ? 'Morning' : 'Evening'
    };
  });

  return {
    success: true,
    isBlocked: false,
    date: dateString,
    slotDuration,
    totalSlots: slots.length,
    availableCount: slots.filter(s => s.isAvailable).length,
    slots
  };
}

module.exports = {
  getDoctorSlots,
  timeToMinutes,
  minutesToTime
};
