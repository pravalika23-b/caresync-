import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Heart, 
  Users, 
  Stethoscope, 
  Sparkles 
} from 'lucide-react';

export default function HomePage() {
  const departments = [
    { name: 'Cardiology', desc: 'Advanced heart, cardiac rhythm & vascular care', icon: '❤️' },
    { name: 'Dermatology', desc: 'Comprehensive skin health, allergies & aesthetics', icon: '✨' },
    { name: 'Neurology', desc: 'Brain, spine, peripheral nerves & stroke management', icon: '🧠' },
    { name: 'Orthopedics', desc: 'Joint replacement, trauma care & sports injuries', icon: '🦴' },
    { name: 'Pediatrics', desc: 'Compassionate pediatric healthcare from infancy', icon: '👶' },
    { name: 'General Medicine', desc: 'Holistic primary care, preventive checkups & wellness', icon: '🩺' }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/60 via-slate-50 to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-bold tracking-wide border border-teal-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Next-Gen Patient Appointment & Live Queue System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Smarter Healthcare, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-500">
                Zero Waiting Chaos.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Eliminate crowded hospital waiting rooms with conflict-free appointment booking, 
              real-time queue tracking, and instant digital prescriptions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/patient/book"
                className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/25 hover:shadow-xl hover:-translate-y-0.5 transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/doctors"
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border border-slate-300 shadow-xs hover:-translate-y-0.5 transition duration-200 flex items-center justify-center space-x-2"
              >
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Explore Doctors</span>
              </Link>
            </div>

            {/* Metric Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-200/80">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Conflict-Free Slots</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">Live</p>
                <p className="text-xs text-slate-500 font-medium mt-1">WebSocket Queue</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">&lt; 15 min</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Target Wait Time</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">24/7</p>
                <p className="text-xs text-slate-500 font-medium mt-1">AI Smart Assistant</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold text-teal-600 tracking-wider">Engineered for Reliability</h2>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">Why Hospitals & Patients Choose CareSync</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Dynamic Queue Prediction</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Never wait blindly in hospital lobbies. See real-time serving numbers, your exact queue position, and algorithmic waiting-time calculations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Anti-Double-Booking Engine</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Atomic transactional verification guarantees two patients never collide on the exact same doctor time slot, avoiding appointment overlap completely.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Digital Health & Prescriptions</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Doctors generate structured diagnoses and itemized e-prescriptions with single-click history lookup, eliminating paper files.
            </p>
          </div>

        </div>
      </section>

      {/* Departments Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-xs uppercase font-bold text-teal-600 tracking-wider">Specialized Care</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Explore Clinical Departments</p>
          </div>
          <Link to="/doctors" className="mt-4 sm:mt-0 text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition group">
              <div className="text-3xl mb-3">{dept.icon}</div>
              <h4 className="text-base font-bold text-slate-800 group-hover:text-teal-600 transition">{dept.name}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{dept.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
