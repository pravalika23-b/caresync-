import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Calendar, Search, Filter, ClipboardList } from 'lucide-react';

export default function AllAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/admin/appointments?';
      if (selectedDate) url += `date=${selectedDate}&`;
      if (selectedDept) url += `departmentId=${selectedDept}&`;
      if (selectedStatus) url += `status=${selectedStatus}&`;

      const [aptRes, deptRes] = await Promise.all([
        api.get(url),
        api.get('/admin/departments')
      ]);

      if (aptRes.data.success) setAppointments(aptRes.data.appointments);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedDept, selectedStatus]);

  const filtered = appointments.filter((a) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      a.patient_name?.toLowerCase().includes(term) ||
      a.doctor_name?.toLowerCase().includes(term) ||
      a.department_name?.toLowerCase().includes(term) ||
      a.patient_phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hospital Master Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">Cross-departmental schedule oversight and intake queue monitoring.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="WAITING">Waiting</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Aggregating hospital schedules...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No appointments match current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Queue</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Attending Doctor</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-black text-teal-700">#{a.queue_number}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{a.patient_name}</p>
                      <p className="text-[11px] text-slate-400">{a.patient_email}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{a.doctor_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                        {a.department_name}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {a.appointment_date} <br />
                      <span className="text-slate-400 text-[11px]">{a.appointment_time}</span>
                    </td>
                    <td className="p-4">
                      <Badge status={a.status} />
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
