import React from 'react';

export const DatabaseStatusTopBar: React.FC<{ phonesCount: number, brandsCount: number }> = ({ phonesCount, brandsCount }) => {
    return (
        <div className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>📱 Phones: {phonesCount}</span>
            <span>🏢 Brands: {brandsCount}</span>
            <span className="text-emerald-500">🟢 Last Sync Success</span>
        </div>
    );
};
