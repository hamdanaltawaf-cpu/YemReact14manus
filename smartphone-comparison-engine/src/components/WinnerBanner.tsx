import React, { useMemo } from "react";
import { Smartphone } from "../types";
import { ComparisonService } from "../services/comparison.service";
import { Trophy, Check, Award, Sparkles, Star } from "lucide-react";
import { MediaService } from "../services/media.service";
import PhoneImage from "./PhoneImage";

interface WinnerBannerProps {
  phoneA: Smartphone;
  phoneB: Smartphone;
}

export default function WinnerBanner({ phoneA, phoneB }: WinnerBannerProps) {
  const results = useMemo(() => {
    return ComparisonService.calculate([phoneA, phoneB]);
  }, [phoneA, phoneB]);

  if (!results || results.length < 2) return null;

  const pA = results.find((r) => r.phone.name === phoneA.name) || results[0];
  const pB = results.find((r) => r.phone.name === phoneB.name) || results[1] || results[0];

  // If score is equal, choose pA
  const winner = pA.overallScore >= pB.overallScore ? pA : pB;
  const media = MediaService.resolvePhoneMedia(winner.phone);

  // Dynamically compute top 3 category strengths based on highest score evaluations
  const topStrengths = useMemo(() => {
    const categories = [
      { key: "camera", name: "تميز الكاميرات والتصوير", desc: "كاميرات فائقة الدقة والوضوح", score: winner.categoryScores.camera, icon: "📸" },
      { key: "battery", name: "استقرار واستمرارية الطاقة", desc: "عمر بطارية ممتد للاستخدام الشاق", score: winner.categoryScores.battery, icon: "🔋" },
      { key: "display", name: "جودة الشاشة ودقة العرض", desc: "ألوان حية وسطوع تحت أشعة الشمس", score: winner.categoryScores.display, icon: "📺" },
      { key: "performance", name: "سرعة المعالج والأداء", desc: "استجابة سريعة جداً للألعاب والمهام", score: winner.categoryScores.performance, icon: "⚡" },
      { key: "value", name: "القيمة الكلية مقابل السعر", desc: "مواصفات ممتازة مقابل استثمار مالي ذكي", score: winner.categoryScores.value, icon: "🪙" },
    ];

    // Sort descending and select top 3
    return [...categories].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [winner]);

  return (
    <div
      className="bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent dark:from-slate-900/95 dark:via-slate-900/40 dark:to-slate-950/20 border-2 border-amber-400 dark:border-amber-500/45 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300 md:hover:shadow-amber-500/5"
      id="winner-hero-card"
    >
      {/* Decorative ambient background blur lights */}
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-16 w-32 h-32 bg-orange-500/15 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Layout: image + details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
        
        {/* Left Column: Stylized Smartphone Display Container (col-span-4) */}
        <div className="md:col-span-4 flex justify-center items-center">
          <div className="relative w-40 h-56 bg-slate-950/40 dark:bg-slate-900 rounded-[2.5rem] border-4 border-amber-400 p-2.5 shadow-2xl flex flex-col justify-between overflow-hidden group select-none transition-transform duration-300 hover:scale-105">
            {/* Glossy screen glare reflection */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
            
            {/* Notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* Simulated background device thumbnail */}
            <div className="absolute inset-0 z-0">
              <PhoneImage phone={winner.phone} type="hero" className="w-full h-full object-cover select-none pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/25 to-transparent pointer-events-none" />
            </div>

            {/* Bottom text overlays inside mockup */}
            <div className="w-full flex-1 flex flex-col justify-end text-center p-1.5 pb-2.5 z-10">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">{winner.phone.brand}</span>
              <h4 className="text-[11px] font-black text-white mt-0.5 leading-tight line-clamp-2 px-1">
                {winner.phone.name}
              </h4>
            </div>

            {/* Top winner mini banner */}
            <div className="absolute top-8 right-2 transform rotate-12 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-md z-20">
              👑 الأفضل لشرائك
            </div>
          </div>
        </div>

        {/* Right Column: Key evaluation data and Strengths list (col-span-8) */}
        <div className="md:col-span-8 text-right space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/10 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-550 to-orange-500 text-white px-3.5 py-1 rounded-full text-[10px] font-black shadow-sm mb-2.5">
                <Trophy size={11} className="animate-bounce" />
                <span>الفائز الفني والعملي بالمواجهة التقنية</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 justify-start mt-0.5">
                <span dangerouslySetInnerHTML={{ __html: media.brandLogoSvg }} className="text-amber-500 w-5 h-5 shrink-0" />
                <span className="tracking-tight">{winner.phone.name}</span>
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                تفوق في إجمالي عدد الفئات والموازنة الهندسية وحلّ في المركز الأول بمعدل كفاءة وتنافسية استثنائي.
              </p>
            </div>

            {/* Giant Score Circle / Badge */}
            <div className="bg-slate-950 text-white p-4 rounded-3xl border border-amber-400 flex flex-col items-center justify-center shadow-lg shadow-amber-500/5 shrink-0 min-w-[110px] h-[110px] self-start sm:self-center">
              <span className="text-[9px] text-amber-400 font-black tracking-widest block uppercase mb-1">التقييم الكلي</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-black font-mono text-amber-400 glow-score">{winner.overallScore}</span>
                <span className="text-xs text-slate-405 font-medium">/ 100</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                {winner.overallScore >= 90 ? "أداء مبهر" : winner.overallScore >= 80 ? "ممتاز جداً" : "أداء كافٍ"}
              </span>
            </div>
          </div>

          {/* Top 3 Strengths visual Bento Blocks */}
          <div className="space-y-3">
            <h5 className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-black block tracking-wider uppercase">
              🚀 أقوى 3 نقاط تميز يتفرد بها الهاتف الفائز:
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topStrengths.map((str, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/90 dark:bg-slate-900/60 border border-amber-400/20 dark:border-white/5 p-3 rounded-2xl flex items-center gap-3 shadow-xs"
                >
                  <span className="text-2xl bg-amber-500/10 p-1.5 rounded-xl shrink-0">{str.icon}</span>
                  <div className="text-right min-w-0">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white block truncate leading-tight">
                      {str.name}
                    </span>
                    <span className="text-[9.5px] text-slate-400 block truncate mt-0.5">
                      {str.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
