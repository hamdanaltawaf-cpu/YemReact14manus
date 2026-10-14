import React, { useMemo } from "react";
import { Smartphone } from "../types";
import { ComparisonService } from "../services/comparison.service";
import { ThumbsUp, ArrowLeftRight } from "lucide-react";

interface QuickVerdictProps {
  phoneA: Smartphone;
  phoneB: Smartphone;
}

export default function QuickVerdict({ phoneA, phoneB }: QuickVerdictProps) {
  const results = useMemo(() => {
    return ComparisonService.calculate([phoneA, phoneB]);
  }, [phoneA, phoneB]);

  if (!results || results.length < 2) return null;

  const pA = results.find((r) => r.phone.name === phoneA.name) || results[0];
  const pB = results.find((r) => r.phone.name === phoneB.name) || results[1] || results[0];

  // Dynamically compute custom bullet points based on category values
  const bulletsA = useMemo(() => {
    const list: string[] = [];
    
    // Performance comparison
    if (pA.categoryScores.performance >= pB.categoryScores.performance) {
      list.push(`🚀 قوة معالجة أسرع وأداء ألعاب متميز بشريحة ${phoneA.processor.split(/[(\x22]/)[0].trim()}`);
    } else {
      list.push(`⚡ استجابة وسرعة معالجة متزنة مع كفاءة طاقة جيدة`);
    }

    // Camera / Display comparison
    if (pA.categoryScores.camera >= pB.categoryScores.camera) {
      list.push(`📸 تصوير احترافي ودقة وضوح ممتازة بـ ${phoneA.camera.split(",")[0].trim()}`);
    } else if (pA.categoryScores.display >= pB.categoryScores.display) {
      list.push(`📺 سطوع شاشة وتجربة بصرية أفضل تبلغ ${phoneA.screen.split(",")[0].trim()}`);
    } else {
      list.push(`📱 شاشة مريحة للقراءة والتصفح وتحديث ديناميكي`);
    }

    // Battery / Charge / Value comparison
    if (pA.categoryScores.battery >= pB.categoryScores.battery) {
      list.push(`🔋 استمرارية ممتازة بسعة بطارية تبلغ ${phoneA.battery.split(/[(\x22]/)[0].trim()}`);
    } else if (pA.categoryScores.value >= pB.categoryScores.value) {
      list.push(`🪙 قيمة موازنة ممتازة مقابل السعر وميزات كافية`);
    } else {
      list.push(`🔌 سرعة شحن ملائمة للاستخدام اليومي بقدرة ${phoneA.charging}`);
    }

    return list.slice(0, 3);
  }, [phoneA, pA, pB]);

  const bulletsB = useMemo(() => {
    const list: string[] = [];

    // Performance comparison
    if (pB.categoryScores.performance >= pA.categoryScores.performance) {
      list.push(`🚀 أداء معالجة أقوى بفضل شريحة الرائد ${phoneB.processor.split(/[(\x22]/)[0].trim()}`);
    } else {
      list.push(`⚡ أداء كافٍ وتوفير ممتاز للطاقة في المهام اليومية`);
    }

    // Camera / Display comparison
    if (pB.categoryScores.camera >= pA.categoryScores.camera) {
      list.push(`📸 قدرات تصوير وتأثيرات أعمق بـ ${phoneB.camera.split(",")[0].trim()}`);
    } else if (pB.categoryScores.display >= pA.categoryScores.display) {
      list.push(`📺 جودة عرض وسطوع ممتاز للشاشة بـ ${phoneB.screen.split(",")[0].trim()}`);
    } else {
      list.push(`📱 تباين لوني زاهٍ وتحديث شاشة سلس ومريح للبصر`);
    }

    // Battery / Charge / Value comparison
    if (pB.categoryScores.battery >= pA.categoryScores.battery) {
      list.push(`🔋 شريحة طاقة وعمر بطارية أطول بسعة ${phoneB.battery.split(/[(\x22]/)[0].trim()}`);
    } else if (pB.categoryScores.value >= pA.categoryScores.value) {
      list.push(`🪙 خيار ذكي بمعدل كلفة مقابل الأداء ممتاز`);
    } else {
      list.push(`🔌 قدرة شحن رائدة تبلغ ${phoneB.charging} لملء الخزان سريعاً`);
    }

    return list.slice(0, 3);
  }, [phoneB, pA, pB]);

  return (
    <div 
      className="bg-white/60 dark:bg-slate-900/40 border border-slate-205 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-4"
      id="quick-selection-verdict-card"
    >
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-2.5">
        <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0" />
        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
          الخلاصة الفورية: لماذا تختار أياً منهما؟
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200/50 dark:divide-white/5 rtl">
        
        {/* Why choose Phone A */}
        <div className="space-y-2 text-right">
          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 block pb-1">
            لماذا تختار {phoneA.name}؟
          </span>
          <ul className="space-y-1.5 text-[11px] sm:text-xs">
            {bulletsA.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why choose Phone B */}
        <div className="space-y-2 text-right pt-3.5 md:pt-0 md:pr-4">
          <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block pb-1">
            لماذا تختار {phoneB.name}؟
          </span>
          <ul className="space-y-1.5 text-[11px] sm:text-xs">
            {bulletsB.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="text-amber-505 mt-0.5 shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
