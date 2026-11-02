import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import { 
  Clock, 
  Users, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Wifi, 
  ArrowLeft, 
  CalendarPlus 
} from 'lucide-react';

export default function LiveQueuePage() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [queueData, setQueueData] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(appointmentId || '');
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  const { showToast } = useNotifications();

  // Load patient's upcoming appointments to allow selecting which queue to track
  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await api.get('/appointments/my');
        if (res.data.success) {
          const up = res.data.upcoming || [];
          setAllAppointments(up);
          if (!selectedId && up.length > 0) {
            setSelectedId(up[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, [appointmentId]);

  // Fetch queue details whenever selectedId changes
  const fetchQueue = async () => {
    if (!selectedId) return;
    try {
      const res = await api.get(`/queue/patient/${selectedId}`);
      if (res.data.success) {
        setQueueData(res.data.queue);
      }
    } catch (err) {
      console.error('Failed to fetch live queue data:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedId]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleQueueUpdate = () => {
      // Re-fetch queue on any update from doctor
      fetchQueue();
    };

    const handleCalled = (data) => {
      showToast('Doctor Calling! 🔔', data.message, 'alert');
      fetchQueue();
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('queue:update', handleQueueUpdate);
    socket.on('queue:called', handleCalled);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('queue:update', handleQueueUpdate);
      socket.off('queue:called', handleCalled);
    };
  }, [selectedId]);

  const handleCheckIn = async () => {
    if (!selectedId) return;
    try {
      const res = await api.post(`/queue/checkin/${selectedId}`);
      if (res.data.success) {
        showToast('Checked In! ⏱️', res.data.message, 'queue');
        fetchQueue();
      }
    } catch (err) {
      showToast('Check-In Error', err.response?.data?.message || 'Failed to check in', 'alert');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Connecting to queue engine...</p>
      </div>
    );
  }

  if (allAppointments.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
        <Clock className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">No active queue tokens</h2>
        <p className="text-xs text-slate-500">
          You do not have any upcoming appointments to track in the live queue.
        </p>
        <Link
          to="/patient/book"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-700 transition"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book an Appointment</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Selector & Socket Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Live Queue Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time WebSocket synchronized hospital queue monitor</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Socket Indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`}></span>
            <span>{socketConnected ? 'Live Connection Active' : 'Connecting...'}</span>
          </div>

          {/* Appointment Switcher */}
          {allAppointments.length > 1 && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              {allAppointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.doctor_name} ({a.appointment_date})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {queueData && (
        <div className="space-y-6">
          
          {/* Doctor Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{queueData.doctorName}</h2>
                <p className="text-xs font-semibold text-teal-600">{queueData.departmentName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Slot: {queueData.appointmentDate} at {queueData.appointmentTime}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge status={queueData.queueStatus !== 'NOT_CHECKED_IN' ? queueData.queueStatus : queueData.appointmentStatus} />
              {queueData.queueStatus === 'NOT_CHECKED_IN' && (
                <button
                  onClick={handleCheckIn}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Check In Now
                </button>
              )}
            </div>
          </div>

          {/* Big Live Metrics Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            
            {/* Your Queue Number */}
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-600/20 text-center flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100">Your Token Number</span>
              <div className="py-4">
                <span className="text-6xl font-black tracking-tight">#{queueData.queueNumber}</span>
              </div>
              <span className="text-[11px] text-teal-100 font-medium">Assigned Daily Sequence</span>
            </div>

            {/* Currently Serving */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center flex flex-col justify-between shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Serving</span>
              <div className="py-4">
                <span className="text-5xl font-black text-slate-800 tracking-tight">
                  {queueData.currentlyServingNumber ? `#${queueData.currentlyServingNumber}` : '—'}
                </span>
                {queueData.currentlyServingPatient && (
                  <p className="text-xs font-semibold text-teal-600 mt-1 truncate">
                    Patient: {queueData.currentlyServingPatient}
                  </p>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Inside Consultation Room</span>
            </div>

            {/* Patients Ahead */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center flex flex-col justify-between shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patients Ahead</span>
              <div className="py-4">
                <span className="text-5xl font-black text-amber-500 tracking-tight">
                  {queueData.patientsAhead}
                </span>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  ~{queueData.estimatedWaitMinutes} min est. wait
                </p>
              </div>
              <span className="text-[10px] text-slate-400">
                Formula: {queueData.patientsAhead} × {queueData.consultationDuration} mins
              </span>
            </div>

          </div>

          {/* Workflow Progress Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Queue Flow Status</h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              
              {/* Step 1: Booked */}
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-800 font-bold border border-teal-200">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                <span>1. Booked</span>
              </div>

              {/* Step 2: Checked In */}
              <div className={`p-3 rounded-2xl font-bold border transition ${
                queueData.checkInTime
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <Activity className="w-5 h-5 mx-auto mb-1" />
                <span>2. Checked In</span>
              </div>

              {/* Step 3: Waiting / Called */}
              <div className={`p-3 rounded-2xl font-bold border transition ${
                queueData.queueStatus === 'WAITING' || queueData.queueStatus === 'CALLED' || queueData.queueStatus === 'IN_CONSULTATION' || queueData.queueStatus === 'COMPLETED'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <span>3. In Queue</span>
              </div>

              {/* Step 4: Completed */}
              <div className={`p-3 rounded-2xl font-bold border transition ${
                queueData.appointmentStatus === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
                <span>4. Completed</span>
              </div>

            </div>

            {/* Calling alert if currently called */}
            {queueData.queueStatus === 'CALLED' && (
              <div className="p-4 bg-purple-100 border-2 border-purple-300 rounded-2xl text-purple-900 font-bold text-center animate-bounce">
                🔔 Doctor is calling your queue number (#{queueData.queueNumber}) right now! Please enter the consultation room.
              </div>
            )}

            {/* Waiting guidance */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-500 leading-relaxed">
              <p>
                💡 <strong>How queue estimation works:</strong> The estimated wait time is calculated dynamically as patients ahead of you multiplied by the doctor's average consultation duration ({queueData.consultationDuration} mins). Times may vary slightly depending on case complexity.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
