import React, { useState } from 'react';
import { Filter, X, Search, Battery, Cpu, Smartphone, Calendar, Layers, Database, Image as ImageIcon } from 'lucide-react';

export interface FilterOptions {
  brand?: string;
  releaseYearFrom?: string;
  releaseYearTo?: string;
  os?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  batteryMin?: string;
  batteryMax?: string;
  status?: string;
  hasImages?: string;
  qualityFilter?: string;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  brands: { name: string }[];
  qualityFilter: string | null;
}

export function AdvancedFilters({ isOpen, onClose, filters, onFilterChange, brands, qualityFilter }: AdvancedFiltersProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 left-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 w-[320px] sm:w-[480px] max-h-[70vh] overflow-y-auto text-right text-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-sm">
          <Filter size={16} className="text-indigo-500" />
          تصفية متقدمة (Advanced Filters)
        </h4>
        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Brand */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Layers size={14} /> الشركة المصنعة</label>
          <select 
            value={filters.brand || "all"} 
            onChange={(e) => onFilterChange("brand", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل (All)</option>
            {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
          </select>
        </div>

        {/* OS */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Smartphone size={14} /> نظام التشغيل</label>
          <select 
            value={filters.os || "all"} 
            onChange={(e) => onFilterChange("os", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل</option>
            <option value="ios">iOS (Apple)</option>
            <option value="android">Android</option>
            <option value="harmonyos">HarmonyOS</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        {/* Release Year */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Calendar size={14} /> سنة الإصدار</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="من (From)" 
              value={filters.releaseYearFrom || ""}
              onChange={(e) => onFilterChange("releaseYearFrom", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
            />
            <input 
              type="number" 
              placeholder="إلى (To)" 
              value={filters.releaseYearTo || ""}
              onChange={(e) => onFilterChange("releaseYearTo", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Processor */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Cpu size={14} /> المعالج</label>
          <select 
            value={filters.processor || "all"} 
            onChange={(e) => onFilterChange("processor", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل</option>
            <option value="snapdragon">Snapdragon</option>
            <option value="bionic">Apple Bionic</option>
            <option value="dimensity">MediaTek Dimensity</option>
            <option value="exynos">Exynos</option>
            <option value="tensor">Google Tensor</option>
          </select>
        </div>

        {/* RAM */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Database size={14} /> الذاكرة العشوائية (RAM)</label>
          <select 
            value={filters.ram || "all"} 
            onChange={(e) => onFilterChange("ram", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل</option>
            <option value="4GB">4GB+</option>
            <option value="6GB">6GB+</option>
            <option value="8GB">8GB+</option>
            <option value="12GB">12GB+</option>
            <option value="16GB">16GB+</option>
          </select>
        </div>

        {/* Storage */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Database size={14} /> سعة التخزين</label>
          <select 
            value={filters.storage || "all"} 
            onChange={(e) => onFilterChange("storage", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل</option>
            <option value="64">64GB</option>
            <option value="128">128GB</option>
            <option value="256">256GB</option>
            <option value="512">512GB</option>
            <option value="1TB">1TB</option>
          </select>
        </div>

        {/* Images */}
        <div className="space-y-1.5">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><ImageIcon size={14} /> الصور</label>
          <select 
            value={filters.hasImages || "all"} 
            onChange={(e) => onFilterChange("hasImages", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل</option>
            <option value="yes">يحتوي على صور</option>
            <option value="no">بدون صور</option>
          </select>
        </div>

        {/* Battery */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Battery size={14} /> سعة البطارية (mAh)</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="من (Min)" 
              value={filters.batteryMin || ""}
              onChange={(e) => onFilterChange("batteryMin", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
            />
            <input 
              type="number" 
              placeholder="إلى (Max)" 
              value={filters.batteryMax || ""}
              onChange={(e) => onFilterChange("batteryMax", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-500 font-bold flex items-center gap-1.5"><Filter size={14} /> حالة الجهاز</label>
          <select 
            value={filters.status || "all"} 
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">الكل</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="needs_review">يحتاج مراجعة</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>

      </div>
    </div>
  );
}
