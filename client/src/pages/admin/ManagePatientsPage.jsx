import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Phone, Mail, Calendar, Heart } from 'lucide-react';

export default function ManagePatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await api.get('/admin/patients');
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.includes(term) ||
      p.blood_group?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Verified patient roster, emergency contacts, and historical visit counts.</p>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, phone, blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Loading patient directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No patients match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Demographics</th>
                  <th className="p-4">Address / Emergency</th>
                  <th className="p-4 text-right">Consultations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-400">Registered: {new Date(p.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 text-slate-600">
                      <p>{p.email}</p>
                      <p className="text-[11px] text-slate-400">{p.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4 text-slate-700">
                      <p>{p.gender || 'Not specified'}</p>
                      <p className="text-[11px] font-bold text-teal-700">
                        Blood Group: {p.blood_group || 'N/A'}
                      </p>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">
                      <p>{p.address || 'Address not listed'}</p>
                      {p.emergency_contact && (
                        <p className="text-[10px] text-rose-600 font-medium">ICE: {p.emergency_contact}</p>
                      )}
                    </td>
                    <td className="p-4 text-right font-black text-slate-800">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">
                        {p.total_appointments || 0} visits
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
