import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, UserCheck, Stethoscope, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Auto submit with fresh values
    setError('');
    setLoading(true);
    login(demoEmail, demoPassword)
      .then((user) => {
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      })
      .catch((err) => {
        setError(err.message || 'Demo login failed');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 items-center justify-center text-white shadow-md shadow-teal-500/20 mb-3">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to CareSync</h2>
        <p className="text-xs text-slate-500 mt-1">Smart Hospital, Appointment & Live Queue Portal</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Demo Fast Login Pills */}
        <div className="mb-4 bg-teal-50/80 border border-teal-200 rounded-2xl p-3.5">
          <p className="text-xs font-bold text-teal-900 mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-teal-600 mr-2 animate-ping"></span>
            Instant Demo Logins (Click to Enter):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('rahul.verma@example.com', 'patient123')}
              className="px-2.5 py-2 bg-white hover:bg-teal-600 hover:text-white border border-teal-200 rounded-xl text-[11px] font-bold text-teal-800 transition flex flex-col items-center shadow-xs"
            >
              <UserCheck className="w-4 h-4 mb-1" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('priya.sharma@hospital.com', 'doctor123')}
              className="px-2.5 py-2 bg-white hover:bg-teal-600 hover:text-white border border-teal-200 rounded-xl text-[11px] font-bold text-teal-800 transition flex flex-col items-center shadow-xs"
            >
              <Stethoscope className="w-4 h-4 mb-1" />
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@hospital.com', 'admin123')}
              className="px-2.5 py-2 bg-white hover:bg-teal-600 hover:text-white border border-teal-200 rounded-xl text-[11px] font-bold text-teal-800 transition flex flex-col items-center shadow-xs"
            >
              <Shield className="w-4 h-4 mb-1" />
              Admin
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a patient account?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700 hover:underline">
              Register now
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
