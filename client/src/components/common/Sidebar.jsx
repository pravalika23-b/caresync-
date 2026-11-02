import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  Clock,
  FileText,
  User,
  Stethoscope,
  Users,
  Building2,
  CalendarRange,
  ClipboardList
} from 'lucide-react';

export default function Sidebar() {
  const { role } = useAuth();

  const patientLinks = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
    { name: 'My Appointments', path: '/patient/appointments', icon: CalendarCheck },
    { name: 'Live Queue Tracker', path: '/patient/queue', icon: Clock },
    { name: 'Medical History', path: '/patient/history', icon: FileText },
    { name: 'My Profile', path: '/patient/profile', icon: User }
  ];

  const doctorLinks = [
    { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Live Queue Console', path: '/doctor/queue', icon: Clock },
    { name: 'My Appointments', path: '/doctor/appointments', icon: CalendarCheck },
    { name: 'Consultation Hours', path: '/doctor/availability', icon: CalendarRange }
  ];

  const adminLinks = [
    { name: 'Admin Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Manage Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Patient Directory', path: '/admin/patients', icon: Users },
    { name: 'All Appointments', path: '/admin/appointments', icon: ClipboardList }
  ];

  const links = role === 'admin' ? adminLinks : role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="text-[11px] uppercase font-bold text-slate-400 px-3 pb-2 tracking-wider">
        {role === 'admin' ? 'Hospital Administration' : role === 'doctor' ? 'Clinical Workspace' : 'Patient Services'}
      </div>

      <nav className="space-y-1 mt-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold border-r-2 border-teal-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
