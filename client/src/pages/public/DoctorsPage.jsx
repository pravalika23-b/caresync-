import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Stethoscope, Calendar, Clock, DollarSign, Award } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [docRes, deptRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/admin/departments').catch(() => ({ data: { departments: [] } }))
        ]);
        if (docRes.data.success) {
          setDoctors(docRes.data.doctors);
        }
        if (deptRes.data.departments) {
          setDepartments(deptRes.data.departments);
        }
      } catch (err) {
        console.error('Failed to load doctors catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = !selectedDept || String(doc.department_id) === String(selectedDept);
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      doc.name?.toLowerCase().includes(term) ||
      doc.specialization?.toLowerCase().includes(term) ||
      doc.department_name?.toLowerCase().includes(term);
    return matchesDept && matchesSearch;
  });

  const getDayLabel = (d) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d] || '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Specialists & Doctors</h1>
        <p className="text-sm text-slate-600 mt-1">
          Browse certified doctors, view consultation schedules, and book online appointments.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3 font-medium">Loading medical staff...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No doctors match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting another department or clearing search filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-teal-400 hover:shadow-lg transition duration-200"
            >
              <div className="space-y-4">
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {doc.department_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{doc.name}</h3>
                    <p className="text-xs font-semibold text-teal-600">{doc.specialization}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {doc.name.replace('Dr. ', '').charAt(0)}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {doc.qualification}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>{doc.experience_years} Years Exp.</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{doc.consultation_duration} min slots</span>
                  </div>
                </div>

                {/* Available Days */}
                {doc.availableDays && doc.availableDays.length > 0 && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Days: </span>
                    {doc.availableDays.map(getDayLabel).join(', ')}
                  </div>
                )}

              </div>

              {/* Card Footer */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Consultation</span>
                  <p className="text-base font-extrabold text-slate-900">₹{doc.consultation_fee}</p>
                </div>
                <Link
                  to={`/patient/book?doctorId=${doc.id}`}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Book Slot
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
