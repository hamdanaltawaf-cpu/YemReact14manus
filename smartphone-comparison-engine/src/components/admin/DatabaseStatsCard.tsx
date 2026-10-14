import React from 'react';
import { Smartphone, Building2, Clock, AlertTriangle } from 'lucide-react';

interface DatabaseStatsCardProps {
  stats: any;
}

export const DatabaseStatsCard: React.FC<DatabaseStatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
          <Smartphone size={14} /> 📱 عدد الهواتف
        </div>
        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats?.totalPhones || 0}</div>
      </div>
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
          <Building2 size={14} /> 🏢 عدد الشركات
        </div>
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats?.totalBrands || 0}</div>
      </div>
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-2">
        <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
          <Clock size={14} /> 🕒 آخر تحديث
        </div>
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{stats?.lastSync || "لم يسبق"}</div>
      </div>
    </div>
  );
};
