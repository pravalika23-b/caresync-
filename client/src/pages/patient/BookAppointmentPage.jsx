import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft 
} from 'lucide-react';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today or tomorrow
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState('');

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Load initial departments and doctors
  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/admin/departments').catch(() => ({ data: { departments: [] } })),
          api.get('/doctors')
        ]);
        if (deptRes.data.departments) setDepartments(deptRes.data.departments);
        if (docRes.data.success) {
          setDoctors(docRes.data.doctors);
          if (initialDoctorId) {
            const matchedDoc = docRes.data.doctors.find(d => String(d.id) === String(initialDoctorId));
            if (matchedDoc) {
              setSelectedDept(String(matchedDoc.department_id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadData();
  }, [initialDoctorId]);

  // Load dynamic slots whenever doctor or date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDoctorId || !selectedDate) {
        setSlotsData(null);
        setSelectedSlot('');
        return;
      }
      setLoadingSlots(true);
      setError('');
      try {
        const res = await api.get(`/availability/slots?doctorId=${selectedDoctorId}&date=${selectedDate}`);
        setSlotsData(res.data);
        setSelectedSlot('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctor slots.');
        setSlotsData(null);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const filteredDoctors = doctors.filter((doc) => {
    if (!selectedDept) return true;
    return String(doc.department_id) === String(selectedDept);
  });

  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      return setError('Please select a doctor, date, and available time slot.');
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await api.post('/appointments', {
        doctorId: Number(selectedDoctorId),
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason: reason || 'General Consultation'
      });

      if (res.data.success) {
        setBookingResult(res.data.appointment);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('Appointment Confirmed! 🎉', `Assigned Queue #${res.data.appointment.queueNumber}`, 'queue');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete appointment booking.';
      setError(msg);
      // If 409 conflict, reload slots so user sees updated status
      if (err.response?.status === 409) {
        const refresh = await api.get(`/availability/slots?doctorId=${selectedDoctorId}&date=${selectedDate}`);
        setSlotsData(refresh.data);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Book a Consultation</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your specialist, date, and conflict-free time slot. Receive an instant queue token.
        </p>
      </div>

      {bookingResult ? (
        /* Success Confirmation Card */
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Appointment Booked Successfully!</h2>
            <p className="text-xs text-slate-500">
              Your appointment has been registered with our live clinical queue system.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Appointment ID:</span>
              <span className="text-xs font-mono font-bold text-slate-800">APT-{bookingResult.id}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Doctor:</span>
              <span className="text-xs font-bold text-slate-800">{bookingResult.doctorName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Department:</span>
              <span className="text-xs font-bold text-teal-700">{bookingResult.departmentName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Date & Time:</span>
              <span className="text-xs font-bold text-slate-800">
                {bookingResult.appointmentDate} at {bookingResult.appointmentTime}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-500 font-medium">Assigned Queue Number:</span>
              <span className="text-xl font-black text-teal-600">#{bookingResult.queueNumber}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/patient/queue?appointmentId=${bookingResult.id}`)}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Track Live Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setBookingResult(null);
                setSelectedSlot('');
                setReason('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        /* Booking Wizard */
        <form onSubmit={handleBooking} className="space-y-6">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1 & 2: Department and Doctor Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-black">1</span>
              <span>Select Department & Specialist</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedDoctorId('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                >
                  <option value="">-- All Clinical Departments --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor *</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                >
                  <option value="">-- Choose Attending Doctor --</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.department_name} • ₹{doc.consultation_fee})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {selectedDoctor && (
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-teal-900">{selectedDoctor.name}</p>
                  <p className="text-[11px] text-teal-700">{selectedDoctor.specialization} • {selectedDoctor.qualification}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-teal-900">₹{selectedDoctor.consultation_fee}</p>
                  <p className="text-[10px] text-teal-600 font-medium">{selectedDoctor.consultation_duration} min per patient</p>
                </div>
              </div>
            )}

          </div>

          {/* Step 3 & 4: Date & Slot Generator */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-black">2</span>
              <span>Select Date & Dynamic Slot</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            {/* Time Slot Picker */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Available Time Slots *</label>

              {loadingSlots ? (
                <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculating real-time doctor availability...</span>
                </div>
              ) : !selectedDoctorId ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  Please select a doctor to load consultation slots.
                </div>
              ) : slotsData?.isBlocked ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
                  {slotsData.message}
                </div>
              ) : !slotsData || slotsData.slots.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  {slotsData?.message || 'No slots available for this doctor on the selected date.'}
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Slots Legend */}
                  <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Available</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                      <span>Booked / Past</span>
                    </span>
                  </div>

                  {/* Slots Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                    {slotsData.slots.map((s, index) => {
                      const isSelected = selectedSlot === s.time;
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!s.isAvailable}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-105'
                              : s.isAvailable
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:border-teal-500 hover:bg-teal-50'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-70'
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSlot && (
                    <p className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 inline-block">
                      Selected Slot: {selectedSlot} ({selectedDate})
                    </p>
                  )}

                </div>
              )}
            </div>

          </div>

          {/* Step 5: Symptoms / Reason */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-black">3</span>
              <span>Reason for Consultation</span>
            </h3>

            <div>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for visiting (optional)..."
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading || !selectedSlot || !selectedDoctorId}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{bookingLoading ? 'Securing Your Slot...' : 'Confirm Appointment Booking'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
