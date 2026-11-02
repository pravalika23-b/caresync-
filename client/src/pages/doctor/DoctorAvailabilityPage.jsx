import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, Clock, Save, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function DoctorAvailabilityPage() {
  const [schedules, setSchedules] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [blockedReason, setBlockedReason] = useState('');
  const [savingDay, setSavingDay] = useState(null);

  const { showToast } = useNotifications();

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/availability/my');
      if (res.data.success) {
        // Map 0-6 days
        const existingMap = {};
        res.data.schedules.forEach(s => {
          existingMap[s.day_of_week] = s;
        });

        const fullWeek = [0, 1, 2, 3, 4, 5, 6].map(day => {
          if (existingMap[day]) {
            return existingMap[day];
          }
          return {
            day_of_week: day,
            morning_start: '09:00',
            morning_end: '13:00',
            evening_start: '16:00',
            evening_end: '19:00',
            slot_duration: 15,
            is_active: day >= 1 && day <= 5 ? 1 : 0
          };
        });

        setSchedules(fullWeek);
        setBlockedDates(res.data.blockedDates || []);
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleDayChange = (dayIndex, field, value) => {
    setSchedules(prev => {
      const updated = [...prev];
      updated[dayIndex][field] = value;
      return updated;
    });
  };

  const saveDaySchedule = async (daySchedule) => {
    setSavingDay(daySchedule.day_of_week);
    try {
      const res = await api.post('/availability/schedule', {
        dayOfWeek: daySchedule.day_of_week,
        morningStart: daySchedule.morning_start,
        morningEnd: daySchedule.morning_end,
        eveningStart: daySchedule.evening_start,
        eveningEnd: daySchedule.evening_end,
        slotDuration: Number(daySchedule.slot_duration || 15),
        isActive: !!daySchedule.is_active
      });

      if (res.data.success) {
        showToast('Schedule Saved', `${daysOfWeek[daySchedule.day_of_week]} consultation hours updated.`, 'info');
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update schedule', 'alert');
    } finally {
      setSavingDay(null);
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    try {
      const res = await api.post('/availability/blocked-dates', {
        blockedDate: newBlockedDate,
        reason: blockedReason || 'On Leave'
      });
      if (res.data.success) {
        showToast('Date Blocked 🛑', `${newBlockedDate} marked as unavailable.`, 'info');
        setNewBlockedDate('');
        setBlockedReason('');
        fetchAvailability();
      }
    } catch (err) {
      showToast('Notice', err.response?.data?.message || 'Could not block date', 'alert');
    }
  };

  const handleRemoveBlockedDate = async (id) => {
    try {
      const res = await api.delete(`/availability/blocked-dates/${id}`);
      if (res.data.success) {
        showToast('Date Unblocked', 'Availability restored for this date.', 'info');
        fetchAvailability();
      }
    } catch (err) {
      showToast('Error', 'Failed to remove blocked date', 'alert');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading schedule settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Consultation Availability</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure weekly clinic consultation shifts, slot durations, and manage planned leave dates.
        </p>
      </div>

      {/* 7-Day Weekly Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Weekly Recurring Schedule</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {schedules.map((s, idx) => (
            <div key={s.day_of_week} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              
              <div className="w-36 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`day-${s.day_of_week}`}
                  checked={!!s.is_active}
                  onChange={(e) => handleDayChange(idx, 'is_active', e.target.checked ? 1 : 0)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor={`day-${s.day_of_week}`} className={`font-bold ${s.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                  {daysOfWeek[s.day_of_week]}
                </label>
              </div>

              {s.is_active ? (
                <div className="flex-1 grid sm:grid-cols-3 gap-3 items-center">
                  
                  {/* Morning Shift */}
                  <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 w-14">Morning:</span>
                    <input
                      type="time"
                      value={s.morning_start}
                      onChange={(e) => handleDayChange(idx, 'morning_start', e.target.value)}
                      className="bg-white px-2 py-1 rounded border border-slate-200 text-xs"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={s.morning_end}
                      onChange={(e) => handleDayChange(idx, 'morning_end', e.target.value)}
                      className="bg-white px-2 py-1 rounded border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Evening Shift */}
                  <div className="flex items-center space-x-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 w-14">Evening:</span>
                    <input
                      type="time"
                      value={s.evening_start}
                      onChange={(e) => handleDayChange(idx, 'evening_start', e.target.value)}
                      className="bg-white px-2 py-1 rounded border border-slate-200 text-xs"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={s.evening_end}
                      onChange={(e) => handleDayChange(idx, 'evening_end', e.target.value)}
                      className="bg-white px-2 py-1 rounded border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Slot Duration */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Duration:</span>
                    <select
                      value={s.slot_duration}
                      onChange={(e) => handleDayChange(idx, 'slot_duration', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value={10}>10 mins</option>
                      <option value={15}>15 mins</option>
                      <option value={20}>20 mins</option>
                      <option value={30}>30 mins</option>
                    </select>
                  </div>

                </div>
              ) : (
                <div className="flex-1 text-slate-400 italic text-xs">
                  Clinic closed on this day.
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => saveDaySchedule(s)}
                  disabled={savingDay === s.day_of_week}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
                >
                  {savingDay === s.day_of_week ? 'Saving...' : 'Save'}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Blocked Leave Dates */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>Planned Leave & Blocked Vacation Dates</span>
        </h2>
        <p className="text-xs text-slate-500">
          Patients cannot book appointment slots on blocked dates.
        </p>

        {/* Add Date Form */}
        <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-3 pt-2 text-xs">
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <input
            type="text"
            placeholder="Reason (e.g. Annual Medical Conference, Personal Leave)"
            value={blockedReason}
            onChange={(e) => setBlockedReason(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Block Date</span>
          </button>
        </form>

        {/* Blocked List */}
        <div className="pt-2">
          {blockedDates.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No upcoming blocked dates recorded.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {blockedDates.map((b) => (
                <div key={b.id} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-rose-900">{b.blocked_date}</span>
                    <p className="text-[11px] text-rose-700">{b.reason || 'On Leave'}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(b.id)}
                    className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition"
                    title="Unblock date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
