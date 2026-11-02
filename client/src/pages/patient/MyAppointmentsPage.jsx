import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  AlertTriangle, 
  CalendarPlus, 
  XCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetApt, setTargetApt] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useNotifications();

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      if (res.data.success) {
        setAppointments({
          upcoming: res.data.upcoming || [],
          past: res.data.past || []
        });
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCheckIn = async (appointmentId) => {
    try {
      const res = await api.post(`/queue/checkin/${appointmentId}`);
      if (res.data.success) {
        showToast('Checked In! ⏱️', res.data.message, 'queue');
        fetchAppointments();
      }
    } catch (err) {
      showToast('Check-In Notice', err.response?.data?.message || 'Could not check in', 'alert');
    }
  };

  const confirmCancel = async () => {
    if (!targetApt) return;
    setCancelling(true);
    try {
      const res = await api.put(`/appointments/${targetApt.id}/cancel`);
      if (res.data.success) {
        showToast('Appointment Cancelled', 'Your time slot has been released.', 'info');
        setCancelModalOpen(false);
        setTargetApt(null);
        fetchAppointments();
      }
    } catch (err) {
      showToast('Cancellation Failed', err.response?.data?.message || 'Error cancelling appointment', 'alert');
    } finally {
      setCancelling(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const list = tab === 'upcoming' ? appointments.upcoming : appointments.past;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your active bookings, check in on visit day, or view past records.</p>
        </div>
        <Link
          to="/patient/book"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition self-start"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setTab('upcoming')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'upcoming'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Upcoming Consultations ({appointments.upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'past'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Past & Cancelled ({appointments.past.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Loading appointments...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No {tab} appointments found</h3>
          <p className="text-xs text-slate-400">Book an appointment online with any of our clinical specialists.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((apt) => {
            const isToday = apt.appointment_date === today;
            const canCancel = apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100 shrink-0">
                      #{apt.queue_number}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">{apt.doctor_name}</h3>
                        <Badge status={apt.status} />
                      </div>
                      <p className="text-xs font-semibold text-teal-600 mt-0.5">{apt.department_name} • {apt.specialization}</p>
                      <p className="text-xs text-slate-400 mt-1">Reason: {apt.reason || 'General Checkup'}</p>
                    </div>
                  </div>

                  {/* Right metadata and buttons */}
                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="text-xs text-slate-600 font-semibold flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{apt.appointment_date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.appointment_time}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      {isToday && apt.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                        >
                          Check In
                        </button>
                      )}

                      <Link
                        to={`/patient/queue?appointmentId=${apt.id}`}
                        className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg border border-teal-200 transition flex items-center space-x-1"
                      >
                        <span>Live Queue</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>

                      {canCancel && (
                        <button
                          onClick={() => {
                            setTargetApt(apt);
                            setCancelModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Consultation"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              Are you sure you want to cancel your appointment with{' '}
              <strong>{targetApt?.doctor_name}</strong> on <strong>{targetApt?.appointment_date} at {targetApt?.appointment_time}</strong>?
            </p>
          </div>
          <p>
            Once cancelled, your slot and queue token will be released immediately for other waiting patients.
          </p>
          <div className="flex justify-end space-x-2 pt-3">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
            >
              Keep Appointment
            </button>
            <button
              onClick={confirmCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
