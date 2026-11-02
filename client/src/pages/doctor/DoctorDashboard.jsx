import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { socket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  Stethoscope, 
  FileText, 
  Plus, 
  Trash2, 
  History 
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);

  // Consultation Modal State
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [consultationData, setConsultationData] = useState({
    symptoms: '',
    diagnosis: '',
    notes: '',
    followUpDate: '',
    prescriptions: [{ medicineName: '', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days', instructions: 'After meals' }]
  });
  const [savingConsultation, setSavingConsultation] = useState(false);

  // Patient History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchBoard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/queue/doctor/board?date=${today}`);
      if (res.data.success) {
        setBoard(res.data.board);
      }
    } catch (err) {
      console.error('Failed to load doctor queue board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();

    const handleQueueChange = () => {
      fetchBoard();
    };

    socket.on('queue:update', handleQueueChange);
    return () => {
      socket.off('queue:update', handleQueueChange);
    };
  }, []);

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await api.post('/queue/doctor/call-next');
      if (res.data.success) {
        showToast('Called Next Patient 🔔', res.data.message, 'queue');
        fetchBoard();
      }
    } catch (err) {
      showToast('Queue Notice', err.response?.data?.message || 'No patients waiting', 'info');
    } finally {
      setCallingNext(false);
    }
  };

  const openConsultation = () => {
    setConsultationData({
      symptoms: '',
      diagnosis: '',
      notes: '',
      followUpDate: '',
      prescriptions: [{ medicineName: '', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days', instructions: 'After meals' }]
    });
    setConsultationModalOpen(true);
  };

  const handleAddPrescriptionLine = () => {
    setConsultationData((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medicineName: '', dosage: '1 tablet', frequency: 'Once daily', duration: '5 days', instructions: 'After meals' }
      ]
    }));
  };

  const handleRemovePrescriptionLine = (index) => {
    setConsultationData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    setConsultationData((prev) => {
      const updated = [...prev.prescriptions];
      updated[index][field] = value;
      return { ...prev, prescriptions: updated };
    });
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!consultationData.diagnosis.trim()) {
      return showToast('Validation', 'Please enter a diagnosis', 'alert');
    }
    if (!board?.currentPatient) return;

    setSavingConsultation(true);
    try {
      const res = await api.post('/medical-records', {
        patientId: board.currentPatient.patient_id,
        appointmentId: board.currentPatient.appointment_id,
        symptoms: consultationData.symptoms,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        followUpDate: consultationData.followUpDate,
        prescriptions: consultationData.prescriptions
      });

      if (res.data.success) {
        showToast('Consultation Completed ✅', 'Medical record and prescriptions uploaded.', 'queue');
        setConsultationModalOpen(false);
        fetchBoard();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to save consultation', 'alert');
    } finally {
      setSavingConsultation(false);
    }
  };

  const viewPatientHistory = async (patientId) => {
    setLoadingHistory(true);
    setHistoryModalOpen(true);
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`);
      if (res.data.success) {
        setPatientHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch patient history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading clinical workspace...</p>
      </div>
    );
  }

  const stats = board?.stats || {};
  const current = board?.currentPatient;
  const waitingList = board?.waitingList || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Clinical Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.name} • {user?.departmentName || 'Specialist'} (Today: {board?.date})
          </p>
        </div>

        <button
          onClick={handleCallNext}
          disabled={callingNext || waitingList.length === 0}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 self-start"
        >
          <Bell className="w-4 h-4" />
          <span>{callingNext ? 'Calling...' : `Call Next Patient (${waitingList.length} Waiting)`}</span>
        </button>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Today's Total</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-teal-600 uppercase">In Queue / Waiting</p>
          <p className="text-2xl font-black text-teal-600 mt-1">{waitingList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 uppercase">Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-rose-500 uppercase">Cancelled</p>
          <p className="text-2xl font-black text-rose-500 mt-1">{stats.cancelled || 0}</p>
        </div>
      </div>

      {/* Current Patient in Room Card */}
      <div className="bg-white rounded-3xl border-2 border-teal-500/80 p-6 shadow-md shadow-teal-500/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Patient in Consultation Room
            </h3>
          </div>
          {current && <Badge status={current.status} />}
        </div>

        {current ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  #{current.queue_number}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{current.patient_name}</h2>
                  <p className="text-xs text-slate-500">
                    Gender: {current.gender} • Blood Group: {current.blood_group || 'N/A'} • Phone: {current.patient_phone || 'N/A'}
                  </p>
                  <p className="text-xs font-semibold text-teal-700 mt-1">
                    Scheduled: {current.appointment_time} • Reason: {current.reason || 'General Consultation'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => viewPatientHistory(current.patient_id)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Medical History</span>
                </button>
                <button
                  onClick={openConsultation}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Complete Consultation</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 space-y-2">
            <p>No active patient inside room. Click <strong>"Call Next Patient"</strong> to admit the next waiting person.</p>
          </div>
        )}
      </div>

      {/* Waiting Queue List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Waiting Queue Outside ({waitingList.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Sorted by Arrival & Token</span>
        </div>

        {waitingList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No checked-in patients currently in the waiting lobby.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {waitingList.map((p) => (
              <div key={p.queue_id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    #{p.queue_number}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{p.patient_name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Time: {p.appointment_time} • {p.gender} • {p.reason || 'Routine Visit'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge status={p.status} />
                  <button
                    onClick={() => viewPatientHistory(p.patient_id)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                    title="View Patient Medical History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultation & Prescription Modal */}
      <Modal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        title="Consultation & E-Prescription"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveConsultation} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Symptoms / Chief Complaints</label>
            <input
              type="text"
              value={consultationData.symptoms}
              onChange={(e) => setConsultationData({ ...consultationData, symptoms: e.target.value })}
              placeholder="e.g. Mild headache, fever for 3 days, dry cough"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={consultationData.diagnosis}
              onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
              placeholder="e.g. Acute Upper Respiratory Tract Infection"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Doctor Notes & Dietary Recommendations</label>
            <textarea
              rows={2}
              value={consultationData.notes}
              onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
              placeholder="Advised warm fluids, adequate rest, monitor temperature twice daily."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          {/* Prescription Lines */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase text-[10px]">Prescription Medicines (Rx)</span>
              <button
                type="button"
                onClick={handleAddPrescriptionLine}
                className="text-teal-600 hover:text-teal-700 font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {consultationData.prescriptions.map((p, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={p.medicineName}
                    onChange={(e) => handlePrescriptionChange(idx, 'medicineName', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage (500mg)"
                    value={p.dosage}
                    onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={p.frequency}
                    onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={p.instructions}
                    onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-1 text-right">
                  {consultationData.prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrescriptionLine(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recommended Follow-up Date</label>
            <input
              type="date"
              value={consultationData.followUpDate}
              onChange={(e) => setConsultationData({ ...consultationData, followUpDate: e.target.value })}
              className="w-full sm:w-52 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConsultationModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingConsultation}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs disabled:opacity-50"
            >
              {savingConsultation ? 'Saving...' : 'Complete & Issue Prescription'}
            </button>
          </div>

        </form>
      </Modal>

      {/* Patient History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Patient Previous Medical History"
        maxWidth="max-w-2xl"
      >
        {loadingHistory ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading records...</div>
        ) : !patientHistory || patientHistory.records?.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No previous medical visits recorded for this patient.</div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto text-xs">
            {patientHistory.records.map((rec) => (
              <div key={rec.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{rec.doctor_name} ({rec.department_name})</span>
                  <span className="text-slate-400">{new Date(rec.created_at).toLocaleDateString()}</span>
                </div>
                <p><strong>Diagnosis:</strong> {rec.diagnosis}</p>
                {rec.symptoms && <p className="text-slate-600"><strong>Symptoms:</strong> {rec.symptoms}</p>}
                {rec.notes && <p className="text-slate-600"><strong>Notes:</strong> {rec.notes}</p>}
                {rec.prescriptions && rec.prescriptions.length > 0 && (
                  <div className="pt-1">
                    <p className="font-semibold text-slate-700">Prescriptions:</p>
                    <ul className="list-disc list-inside text-slate-600 pl-2">
                      {rec.prescriptions.map((p, i) => (
                        <li key={i}>{p.medicine_name} ({p.dosage}) - {p.frequency}, {p.duration}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

    </div>
  );
}
