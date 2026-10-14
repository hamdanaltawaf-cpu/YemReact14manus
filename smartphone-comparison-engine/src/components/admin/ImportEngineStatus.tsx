import React from 'react';
import { Wifi, WifiOff, Cpu, Globe, Database, HelpCircle } from 'lucide-react';

interface SourceStatus {
  name: string;
  type: "API" | "Scraper" | "Database";
  online: boolean;
  latency: number | null;
  lastChecked: string;
  error: string | null;
  itemsRetrieved: number;
  lastRun: string | null;
  lastError: string | null;
}

interface ImportEngineStatusProps {
  statuses: SourceStatus[];
}

export const ImportEngineStatus: React.FC<ImportEngineStatusProps> = ({ statuses }) => {
  const safeStatuses = Array.isArray(statuses) ? statuses : [];

  const getIcon = (type: string) => {
    switch (type) {
      case "API":
        return <Cpu size={14} className="text-blue-500" />;
      case "Scraper":
        return <Globe size={14} className="text-purple-500" />;
      case "Database":
        return <Database size={14} className="text-amber-500" />;
      default:
        return <HelpCircle size={14} className="text-slate-400" />;
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">🚀 لوحة الفحص والتشخيص المتقدمة (Diagnostic Dashboard)</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">تفاصيل ومؤشرات كفاءة مصادر استيراد الكتالوج الفيدرالي الفعالة والاحتياطية</p>
        </div>
        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          مستقر وبدون معالجات وهمية
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 pb-2 font-bold pointer-events-none">
              <th className="pb-3 pr-2">المصدر</th>
              <th className="pb-3">النوع</th>
              <th className="pb-3">الحالة</th>
              <th className="pb-3">الأجهزة المستردة</th>
              <th className="pb-3">زمن الاستجابة</th>
              <th className="pb-3">آخر تشغيل</th>
              <th className="pb-3 pl-2 text-left">آخر خطأ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
            {safeStatuses.map((s, i) => {
              const isOnline = s.online === true;
              const errorText = s.lastError || s.error;

              return (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150">
                  {/* Name */}
                  <td className="py-3.5 pr-2 font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {getIcon(s.type)}
                    <span>{s.name}</span>
                  </td>
                  
                  {/* Type */}
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400">
                      {s.type === "API" ? "API مباشر" : s.type === "Scraper" ? "زاحف ويب HTML" : "قاعدة بيانات"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isOnline 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}>
                      {isOnline ? <Wifi size={10} className="animate-pulse" /> : <WifiOff size={10} />}
                      {isOnline ? "نشط ومتاح" : "غير متاح"}
                    </span>
                  </td>

                  {/* Items Retrieved */}
                  <td className="py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {s.itemsRetrieved} أجهزة
                  </td>

                  {/* Latency */}
                  <td className="py-3.5 font-mono text-slate-500 dark:text-slate-450">
                    {s.latency !== null ? `${s.latency}ms` : "--"}
                  </td>

                  {/* Last Run */}
                  <td className="py-3.5 font-mono text-slate-500 dark:text-slate-455">
                    {formatTime(s.lastRun)}
                  </td>

                  {/* Last Error */}
                  <td className="py-3.5 pl-2 text-left">
                    {errorText ? (
                      <span className="text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-sm inline-block max-w-[150px] truncate" title={errorText}>
                        {errorText}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold">✓ لا يوجد أخطاء</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
