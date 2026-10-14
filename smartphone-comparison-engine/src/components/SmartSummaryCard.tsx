import React, { useMemo } from "react";
import { Smartphone } from "../types";
import { ComparisonService } from "../services/comparison.service";
import { Sparkles, CheckCircle, Award } from "lucide-react";

interface SmartSummaryCardProps {
  phones: Smartphone[];
  title?: string;
}

export default function SmartSummaryCard({ phones }: SmartSummaryCardProps) {
  const processed = useMemo(() => {
    if (!phones || phones.length < 2) return null;
    return ComparisonService.calculate(phones);
  }, [phones]);

  if (!processed || processed.length < 2) return null;

  const rA = processed[0];
  const rB = processed[1];

  const bestPerf = rA.categoryScores.performance >= rB.categoryScores.performance ? rA : rB;
  const bestCam = rA.categoryScores.camera >= rB.categoryScores.camera ? rA : rB;
  const bestBat = rA.categoryScores.battery >= rB.categoryScores.battery ? rA : rB;
  const bestSys = rA.categoryScores.software >= rB.categoryScores.software ? rA : rB;
  const finalRec = rA.overallScore >= rB.overallScore ? rA : rB;

  return (
    <div className="bg-slate-50 dark:bg-slate-950/45 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 sm:p-5 font-sans shadow-sm" id="smart-compact-summary-card" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <span>📝</span>
          <span>الخلاصة الذكية المختصرة</span>
        </h4>
        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles size={10} />
          <span>مقارنة فورية خبيرة</span>
        </span>
      </div>

      <div className="space-y-2.5 text-right">
        {/* Row 1: Best Performance */}
        <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
          <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500">✅</span>
            <span>أفضل أداء:</span>
          </span>
          <span className="font-black text-slate-905 dark:text-white font-sans">{bestPerf.phone.name}</span>
        </div>

        {/* Row 2: Best Camera */}
        <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
          <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500">✅</span>
            <span>أفضل كاميرا:</span>
          </span>
          <span className="font-black text-slate-905 dark:text-white font-sans">{bestCam.phone.name}</span>
        </div>

        {/* Row 3: Best Battery */}
        <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-900">
          <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500">✅</span>
            <span>أفضل بطارية:</span>
          </span>
          <span className="font-black text-slate-905 dark:text-white font-sans">{bestBat.phone.name}</span>
        </div>

        {/* Row 4: Best Software stability */}
        <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-slate-150 dark:border-slate-900 pb-2">
          <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500">✅</span>
            <span>أفضل نظام واستقرار:</span>
          </span>
          <span className="font-black text-slate-905 dark:text-white font-sans">{bestSys.phone.name}</span>
        </div>

        {/* Row 5: Final Recommendation */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-1.5 font-black text-indigo-700 dark:text-indigo-400">
          <span className="flex items-center gap-1.5">
            <span className="text-indigo-600 dark:text-indigo-400">🎯</span>
            <span>التوصية النهائية:</span>
          </span>
          <span className="text-sm sm:text-base font-black text-indigo-755 dark:text-indigo-300">{finalRec.phone.name}</span>
        </div>
      </div>
    </div>
  );
}
