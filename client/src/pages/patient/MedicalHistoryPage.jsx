import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { 
  FileText, 
  Calendar, 
  User, 
  Pill, 
  Printer, 
  Activity, 
  CheckCircle2, 
  Stethoscope 
} from 'lucide-react';

export default function MedicalHistoryPage() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/medical-records/my-history');
        if (res.data.success) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error('Failed to load patient medical history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading clinical records...</p>
      </div>
    );
  }

  const records = history?.records || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Patient Medical History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review verified diagnoses, clinical notes, and digital prescriptions issued by attending doctors.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No medical history on file</h3>
          <p className="text-xs text-slate-400">
            Once you complete a consultation with a doctor, your verified clinical notes and prescriptions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition space-y-5"
            >
              
              {/* Record Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{rec.doctor_name}</h3>
                    <p className="text-xs font-semibold text-teal-600">{rec.department_name} • {rec.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                  </span>
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Prescription View</span>
                  </button>
                </div>
              </div>

              {/* Diagnosis and Notes */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Clinical Diagnosis</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{rec.diagnosis}</p>
                  {rec.symptoms && (
                    <p className="text-xs text-slate-600 mt-2">
                      <span className="font-semibold">Symptoms: </span>
                      {rec.symptoms}
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Doctor's Advice & Notes</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line">
                    {rec.notes || 'Routine consultation completed. Follow healthy lifestyle practices.'}
                  </p>
                  {rec.follow_up_date && (
                    <p className="text-xs font-bold text-teal-700 mt-3 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>Recommended Follow-up: {rec.follow_up_date}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Prescriptions */}
              {rec.prescriptions && rec.prescriptions.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">Prescribed Medication</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rec.prescriptions.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{p.medicine_name}</td>
                            <td className="p-3 text-slate-600">{p.dosage}</td>
                            <td className="p-3 text-slate-600">{p.frequency}</td>
                            <td className="p-3 text-slate-600">{p.duration}</td>
                            <td className="p-3 text-slate-600">{p.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Printable Digital Prescription Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="Digital Medical Prescription"
          maxWidth="max-w-2xl"
        >
          <div className="p-4 space-y-6 print:p-0">
            {/* Prescription Header */}
            <div className="flex justify-between items-center pb-4 border-b-2 border-teal-600">
              <div>
                <h2 className="text-xl font-black text-teal-800">CareSync Hospital</h2>
                <p className="text-xs text-slate-500">Official Clinical Consultation Record</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-bold">{selectedRecord.doctor_name}</p>
                <p>{selectedRecord.department_name}</p>
                <p>{new Date(selectedRecord.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Patient & Diagnosis Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Patient</p>
                <p className="font-bold text-slate-800 text-sm">{history?.patient?.name}</p>
                <p className="text-slate-500 mt-0.5">
                  Gender: {history?.patient?.gender} • Blood: {history?.patient?.blood_group || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Primary Diagnosis</p>
                <p className="font-bold text-teal-800 text-sm">{selectedRecord.diagnosis}</p>
                {selectedRecord.follow_up_date && (
                  <p className="text-slate-500 mt-0.5">Follow-up: {selectedRecord.follow_up_date}</p>
                )}
              </div>
            </div>

            {/* Prescriptions */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Rx Medication</span>
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5">Medicine</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedRecord.prescriptions?.map((p, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-bold text-slate-800">{p.medicine_name}</td>
                      <td className="p-2.5 text-slate-600">{p.dosage}</td>
                      <td className="p-2.5 text-slate-600">{p.frequency}</td>
                      <td className="p-2.5 text-slate-600">{p.duration}</td>
                      <td className="p-2.5 text-slate-600">{p.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {selectedRecord.notes && (
              <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-1">Doctor Advice:</p>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedRecord.notes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}
