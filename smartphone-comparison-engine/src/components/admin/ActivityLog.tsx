import React from 'react';

interface ActivityLogProps {
  logs: any[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
      <h3 className="text-sm font-black text-slate-800 dark:text-white">سجل النشاط (آخر 20)</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {safeLogs.slice(0, 20).map((log, i) => (
          <div key={i} className="text-[10px] font-bold p-2 bg-slate-50 dark:bg-slate-700 rounded-lg flex justify-between">
            <span>{log.action}</span>
            <span className="text-slate-400">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
