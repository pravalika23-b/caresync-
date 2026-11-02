import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import Badge from '../../components/common/Badge';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Activity, 
  ArrowRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleRefresh = () => {
      fetchStats();
    };

    socket.on('admin:stats_refresh', handleRefresh);
    socket.on('queue:update', handleRefresh);

    return () => {
      socket.off('admin:stats_refresh', handleRefresh);
      socket.off('queue:update', handleRefresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Aggregating hospital metrics...</p>
      </div>
    );
  }

  const stats = statsData?.stats || {};
  const depts = statsData?.departmentDistribution || [];
  const recents = statsData?.recentAppointments || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hospital Operational Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time centralized dashboard for patient intake, doctor queues, and department load.</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Total Patients</span>
            <p className="text-2xl font-black text-slate-900">{stats.totalPatients || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Active Doctors</span>
            <p className="text-2xl font-black text-slate-900">{stats.totalDoctors || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Departments</span>
            <p className="text-2xl font-black text-slate-900">{stats.totalDepartments || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400">Today's Visits</span>
            <p className="text-2xl font-black text-slate-900">{stats.todayTotal || 0}</p>
          </div>
        </div>

      </div>

      {/* Today's Queue Status Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Today's Clinical Intake Breakdown
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800">Completed Consultations</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.todayCompleted || 0}</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-xs font-bold text-amber-800">In Active Waiting Queue</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{stats.todayWaiting || 0}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800">Booked (Not Checked In)</p>
            <p className="text-3xl font-black text-blue-600 mt-1">{stats.todayBooked || 0}</p>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <p className="text-xs font-bold text-rose-800">Cancelled Today</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{stats.todayCancelled || 0}</p>
          </div>
        </div>
      </div>

      {/* Department Distribution & Recent Appointments */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Department Volume */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Department Load</h3>
            <Link to="/admin/departments" className="text-xs font-bold text-teal-600 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {depts.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-700">{d.name}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-full">
                  {d.appointment_count} visits
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Recent Appointments Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Recent Hospital Activity</h3>
            <Link to="/admin/appointments" className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recents.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{a.patient_name}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-teal-700">{a.doctor_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {a.department_name} • Token #{a.queue_number} • {a.appointment_date} ({a.appointment_time})
                  </p>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
