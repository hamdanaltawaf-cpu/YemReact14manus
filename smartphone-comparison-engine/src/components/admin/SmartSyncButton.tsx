import React from 'react';
import { RefreshCw } from 'lucide-react';

export const SmartSyncButton: React.FC<{ onSync: () => void; loading: boolean }> = ({ onSync, loading }) => {
    return (
        <button 
            onClick={onSync}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
        >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "جاري المزامنة الذكية..." : "🔄 Smart Sync"}
        </button>
    );
};
