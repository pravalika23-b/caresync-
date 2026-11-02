import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HospitalChatbot from './components/ai/HospitalChatbot';

// Public Pages
import HomePage from './pages/public/HomePage';
import DoctorsPage from './pages/public/DoctorsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import LiveQueuePage from './pages/patient/LiveQueuePage';
import MedicalHistoryPage from './pages/patient/MedicalHistoryPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorAvailabilityPage from './pages/doctor/DoctorAvailabilityPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctorsPage from './pages/admin/ManageDoctorsPage';
import ManageDepartmentsPage from './pages/admin/ManageDepartmentsPage';
import ManagePatientsPage from './pages/admin/ManagePatientsPage';
import AllAppointmentsPage from './pages/admin/AllAppointmentsPage';

// Portal Layout with Sidebar
function PortalLayout() {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Public Layout
function PublicLayout() {
  return (
    <main className="flex-1">
      <Outlet />
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Patient Portal */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/patient" element={<PortalLayout />}>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="book" element={<BookAppointmentPage />} />
            <Route path="appointments" element={<MyAppointmentsPage />} />
            <Route path="queue" element={<LiveQueuePage />} />
            <Route path="history" element={<MedicalHistoryPage />} />
            <Route path="profile" element={<PatientProfilePage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Doctor Portal */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/doctor" element={<PortalLayout />}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="queue" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="availability" element={<DoctorAvailabilityPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Admin Portal */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<PortalLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<ManageDoctorsPage />} />
            <Route path="departments" element={<ManageDepartmentsPage />} />
            <Route path="patients" element={<ManagePatientsPage />} />
            <Route path="appointments" element={<AllAppointmentsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating AI Assistant */}
      <HospitalChatbot />
    </div>
  );
}
