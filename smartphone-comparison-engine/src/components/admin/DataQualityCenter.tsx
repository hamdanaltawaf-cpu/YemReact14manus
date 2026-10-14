import React, { useEffect, useState, useCallback } from 'react';
import { Database, AlertTriangle, Image as ImageIcon, Copy, Clock, Layers, RefreshCw } from 'lucide-react';
import { formatArabicDate } from '../../utils/date';
import { apiFetch } from '../../utils/apiFetch';

function formatTimeAgoArabic(timestamp: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `قبل قليل`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

interface QualityStats {
  totalDevices: number;
  totalBrands: number;
  missingSpecs: number;
  missingImage: number;
  duplicates: number;
  needsReview: number;
  lastUpdate: number;
}

interface DataQualityCenterProps {
  userEmail: string | null;
  onFilterSelect: (filter: string) => void;
  activeFilter: string | null;
}

export default function DataQualityCenter({ userEmail, onFilterSelect, activeFilter }: DataQualityCenterProps) {
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [timeAgo, setTimeAgo] = useState("");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/admin/catalog/quality-stats");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setLastRefreshed(Date.now());
        }
      }
    } catch (err) {
      console.error("Failed to load Data Quality stats", err);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!lastRefreshed) return;
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgoArabic(lastRefreshed));
    }, 60000);
    setTimeAgo(formatTimeAgoArabic(lastRefreshed));
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  if (isLoading && !stats) {
    return (
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500" />
          مركز جودة البيانات (Data Quality Center)
          <span className="text-[10px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">Live</span>
        </h3>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-[10px] text-slate-500 font-bold">
              آخر تحديث للإحصائيات: {timeAgo}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:border-indigo-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="تحديث الإحصائيات"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-indigo-500" : ""} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Devices */}
        <button
          onClick={() => onFilterSelect('all')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            activeFilter === 'all' || !activeFilter
              ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-sm'
              : 'bg-white border-slate-200 hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-700 shadow-xs'
          }`}
        >
          <div className="text-slate-400 dark:text-slate-500 mb-1">
            <Database size={16} />
          </div>
          <div className="text-lg font-black text-slate-800 dark:text-white">{stats.totalDevices}</div>
          <div className="text-[10px] font-bold text-slate-500">إجمالي الأجهزة</div>
        </button>

        {/* Total Brands */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs cursor-default">
          <div className="text-slate-400 dark:text-slate-500 mb-1">
            <Layers size={16} />
          </div>
          <div className="text-lg font-black text-slate-800 dark:text-white">{stats.totalBrands}</div>
          <div className="text-[10px] font-bold text-slate-500">الشركات</div>
        </div>

        {/* Missing Specs */}
        <button
          onClick={() => onFilterSelect('missing_specs')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            activeFilter === 'missing_specs'
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-amber-700 shadow-xs'
          }`}
        >
          <div className="text-amber-500 mb-1">
            <AlertTriangle size={16} />
          </div>
          <div className="text-lg font-black text-slate-800 dark:text-white">{stats.missingSpecs}</div>
          <div className="text-[10px] font-bold text-slate-500">نواقص المواصفات</div>
        </button>

        {/* Missing Image */}
        <button
          onClick={() => onFilterSelect('missing_image')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            activeFilter === 'missing_image'
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 shadow-sm'
              : 'bg-white border-slate-200 hover:border-rose-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-rose-700 shadow-xs'
          }`}
        >
          <div className="text-rose-500 mb-1">
            <ImageIcon size={16} />
          </div>
          <div className="text-lg font-black text-slate-800 dark:text-white">{stats.missingImage}</div>
          <div className="text-[10px] font-bold text-slate-500">بدون صور</div>
        </button>

        {/* Duplicates */}
        <button
          onClick={() => onFilterSelect('duplicates')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            activeFilter === 'duplicates'
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm'
              : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-700 shadow-xs'
          }`}
        >
          <div className="text-blue-500 mb-1">
            <Copy size={16} />
          </div>
          <div className="text-lg font-black text-slate-800 dark:text-white">{stats.duplicates}</div>
          <div className="text-[10px] font-bold text-slate-500">تكرار محتمل</div>
        </button>

        {/* Needs Review */}
        <button
          onClick={() => onFilterSelect('needs_review')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            activeFilter === 'needs_review'
              ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-sm'
              : 'bg-white border-slate-200 hover:border-purple-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-purple-700 shadow-xs'
          }`}
        >
          <div className="text-purple-500 mb-1">
            <AlertTriangle size={16} />
          </div>
          <div className="text-lg font-black text-slate-800 dark:text-white">{stats.needsReview}</div>
          <div className="text-[10px] font-bold text-slate-500">تحتاج مراجعة</div>
        </button>

        {/* Last Update */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-xs cursor-default">
          <div className="text-slate-400 mb-1">
            <Clock size={16} />
          </div>
          <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-1" dir="ltr">
            {stats.lastUpdate ? formatArabicDate(new Date(stats.lastUpdate).toISOString()) : "غير متوفر"}
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-1">آخر تحديث</div>
        </div>
      </div>
    </div>
  );
}
