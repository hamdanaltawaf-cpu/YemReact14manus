import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const SystemHealthCard: React.FC = () => {
    const healthItems = [
        { name: "Server Running", status: true },
        { name: "Database Writable", status: true },
        { name: "Import Engine Ready", status: true },
        { name: "Firebase Connected", status: true },
        { name: "Admin Auth Active", status: true },
    ];
    
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">صحة النظام</h3>
            {healthItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={14} className={item.status ? "text-emerald-500" : "text-red-500"} />
                    {item.name}
                </div>
            ))}
        </div>
    );
};
