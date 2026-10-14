import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface ActiveFilterChipsProps {
  filters: Record<string, string>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

const FILTER_LABELS: Record<string, string> = {
  brand: "الشركة",
  releaseYearFrom: "إصدار من",
  releaseYearTo: "إصدار إلى",
  os: "نظام التشغيل",
  processor: "المعالج",
  ram: "الرام",
  storage: "التخزين",
  batteryMin: "بطارية من",
  batteryMax: "بطارية إلى",
  hasImages: "الصور",
  qualityFilter: "جودة البيانات",
  status: "حالة الجهاز",
};

const VALUE_LABELS: Record<string, string> = {
  ios: "iOS (Apple)",
  android: "Android",
  harmonyos: "HarmonyOS",
  other: "أخرى",
  snapdragon: "Snapdragon",
  bionic: "Apple Bionic",
  dimensity: "Dimensity",
  exynos: "Exynos",
  tensor: "Google Tensor",
  yes: "موجودة",
  no: "غير موجودة",
  missing_specs: "ناقص مواصفات",
  missing_image: "بدون صورة",
  duplicates: "مكرر",
  needs_review: "يحتاج مراجعة",
  published: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

export function ActiveFilterChips({ filters, onRemove, onClearAll }: ActiveFilterChipsProps) {
  const activeFilters = Object.entries(filters).filter(([k, v]) => k !== 'sortBy' && v !== 'all' && v !== '');

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {activeFilters.map(([key, value]) => {
        const label = FILTER_LABELS[key] || key;
        const displayValue = VALUE_LABELS[value] || value;
        return (
          <div key={key} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-indigo-100 dark:border-indigo-800/50">
            <span>{label}: {displayValue}</span>
            <button onClick={() => onRemove(key)} className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors">
              <X size={12} />
            </button>
          </div>
        );
      })}
      
      <button 
        onClick={onClearAll}
        className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-2 py-1 rounded-full transition-colors ml-auto"
      >
        <Trash2 size={12} />
        Clear Filters
      </button>
    </div>
  );
}
