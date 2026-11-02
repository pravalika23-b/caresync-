import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  CalendarPlus, 
  Stethoscope 
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

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
      console.error('Failed to fetch patient appointments:', err);
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

  const nextAppointment = appointments.upcoming[0];
  const today = new Date().toISOString().split('T')[0];
  const isToday = nextAppointment && nextAppointment.appointment_date === today;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-700/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            <span>CareSync Patient Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
            Track your appointments, check your live queue position in real time, and access your verified digital health records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/patient/book"
            className="px-5 py-2.5 bg-white text-teal-700 hover:bg-teal-50 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
          <Link
            to="/patient/queue"
            className="px-5 py-2.5 bg-teal-800/60 hover:bg-teal-800 text-white rounded-xl font-bold text-xs border border-white/20 transition flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Live Queue</span>
          </Link>
        </div>
      </div>

      {/* Hero Active Appointment Card */}
      {nextAppointment ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-teal-300 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-teal-500 animate-ping"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Next Upcoming Consultation
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <Badge status={nextAppointment.status} />
              <span className="text-xs text-slate-500 font-semibold">
                ID: APT-{nextAppointment.id}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 py-6">
            
            <div className="md:col-span-2 flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl border border-teal-100">
                {nextAppointment.doctor_name.replace('Dr. ', '').charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{nextAppointment.doctor_name}</h3>
                <p className="text-xs font-semibold text-teal-600">{nextAppointment.department_name}</p>
                <p className="text-xs text-slate-500 mt-1">{nextAppointment.specialization}</p>
                <p className="text-xs text-slate-400 mt-0.5">Reason: {nextAppointment.reason || 'General Consultation'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Scheduled Time</span>
              <p className="text-sm font-extrabold text-slate-800 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{nextAppointment.appointment_date}</span>
              </p>
              <p className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{nextAppointment.appointment_time}</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Queue</span>
              <p className="text-3xl font-black text-teal-600 tracking-tight">#{nextAppointment.queue_number}</p>
              <span className="text-[10px] text-slate-500 font-medium">Daily Token</span>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {isToday ? (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your consultation is scheduled for today!</span>
                </span>
              ) : (
                <span>Scheduled for {nextAppointment.appointment_date}</span>
              )}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {isToday && nextAppointment.status === 'BOOKED' && (
                <button
                  onClick={() => handleCheckIn(nextAppointment.id)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Check-In Now
                </button>
              )}
              <Link
                to={`/patient/queue?appointmentId=${nextAppointment.id}`}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
              >
                <span>Track Live Queue</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No upcoming appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book an appointment with any of our certified specialists to receive a conflict-free slot and real-time queue tracker.
          </p>
          <Link
            to="/patient/book"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-700 transition"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
        </div>
      )}

      {/* Quick Services Grid */}
      <div className="grid sm:grid-cols-3 gap-6">
        
        <Link
          to="/patient/appointments"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition">My Appointments</h4>
          <p className="text-xs text-slate-500 mt-1">Review upcoming consultations, past visits, or reschedule slots.</p>
        </Link>

        <Link
          to="/patient/history"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition">Medical Records</h4>
          <p className="text-xs text-slate-500 mt-1">Access verified doctor notes, clinical diagnoses, and prescriptions.</p>
        </Link>

        <Link
          to="/doctors"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition">Doctor Directory</h4>
          <p className="text-xs text-slate-500 mt-1">Browse hospital staff across Cardiology, Dermatology, Orthopedics, etc.</p>
        </Link>

      </div>

    </div>
  );
}
