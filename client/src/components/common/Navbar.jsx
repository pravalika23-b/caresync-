import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Activity, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Calendar, 
  Clock, 
  Shield, 
  Stethoscope 
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Care<span className="text-teal-600">Sync</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                Smart Hospital
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-teal-600 transition">Home</Link>
            <Link to="/doctors" className="hover:text-teal-600 transition">Find Doctors</Link>
            {isAuthenticated && (
              <Link to={getDashboardPath()} className="text-teal-600 font-semibold hover:text-teal-700 transition">
                My Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAllAsRead => markAllAsRead()}
                            className="text-xs text-teal-600 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={`p-3 text-xs cursor-pointer transition ${
                                n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/40 hover:bg-teal-50/70'
                              }`}
                            >
                              <div className="font-semibold text-slate-800 flex items-center justify-between">
                                <span>{n.title}</span>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                )}
                              </div>
                              <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Pill */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifs(false);
                    }}
                    className="flex items-center space-x-2.5 p-1.5 pl-3 pr-2 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                        {user?.name}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-teal-600">
                        {role}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <Calendar className="w-4 h-4 mr-2.5 text-teal-600" />
                        Dashboard
                      </Link>

                      {role === 'patient' && (
                        <Link
                          to="/patient/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <User className="w-4 h-4 mr-2.5 text-teal-600" />
                          My Profile
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/20 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
