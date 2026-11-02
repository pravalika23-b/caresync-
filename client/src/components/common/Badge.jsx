import React from 'react';

export default function Badge({ status, text }) {
  const displayStatus = text || status;

  const getStyle = () => {
    switch (status?.toUpperCase()) {
      case 'BOOKED':
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_IN':
      case 'WAITING':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'CALLED':
      case 'IN_PROGRESS':
      case 'IN_CONSULTATION':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NO_SHOW':
      case 'SKIPPED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {displayStatus}
    </span>
  );
}
