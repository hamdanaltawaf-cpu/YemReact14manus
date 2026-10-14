import React from 'react';

export const LastSyncCard: React.FC<{ lastSync: any }> = ({ lastSync }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">آخر عملية استيراد</h3>
            <div className="text-xs font-bold text-slate-500">المصدر: {lastSync?.source || "—"}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <div className="text-xl font-black text-emerald-600">{lastSync?.added || 0}</div>
                    <div className="text-[9px]">Added</div>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-xl font-black text-blue-600">{lastSync?.scanned || 0}</div>
                    <div className="text-[9px]">Scanned</div>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="text-xl font-black text-amber-600">{lastSync?.skipped || 0}</div>
                    <div className="text-[9px]">Skipped</div>
                </div>
            </div>
        </div>
    );
};
