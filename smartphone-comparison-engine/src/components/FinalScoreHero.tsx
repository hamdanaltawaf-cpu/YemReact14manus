import { useMemo } from "react";
import { Smartphone } from "../types";
import { ComparisonService } from "../services/comparison.service";
import { Trophy, Award } from "lucide-react";
import { motion } from "motion/react";

interface FinalScoreHeroProps {
  phoneA: Smartphone;
  phoneB: Smartphone;
}

export default function FinalScoreHero({ phoneA, phoneB }: FinalScoreHeroProps) {
  const results = useMemo(() => {
    return ComparisonService.calculate([phoneA, phoneB]);
  }, [phoneA, phoneB]);

  if (!results || results.length < 2) return null;

  const pA = results.find((r) => r.phone.name === phoneA.name) || results[0];
  const pB = results.find((r) => r.phone.name === phoneB.name) || results[1] || results[0];

  const scoreDiff = Math.abs(pA.overallScore - pB.overallScore);
  const isAWinner = pA.overallScore > pB.overallScore;
  const isBWinner = pB.overallScore > pA.overallScore;
  const isTie = pA.overallScore === pB.overallScore;
  
  const winner = isAWinner ? pA : pB;
  const runnerUp = isAWinner ? pB : pA;

  return (
    <div 
      className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-md space-y-5 animate-fade-in font-sans relative overflow-hidden"
      dir="rtl"
      id="final-score-hero"
    >
      {/* Decorative colored visual edge representing the winner status */}
      <div className={`absolute top-0 right-0 left-0 h-1.5 ${isTie ? 'bg-amber-500' : 'bg-emerald-500'}`} />

      {/* Score Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3 text-right w-full sm:w-auto">
          <div className={`p-2.5 rounded-2xl ${isTie ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'} shrink-0`}>
            {isTie ? <Award className="w-5.5 h-5.5" /> : <Trophy className="w-5.5 h-5.5 animate-bounce" />}
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-black text-amber-500 tracking-wider uppercase flex items-center gap-1">
              <span>{isTie ? "⚖️ أداء متكافئ بالمقارنة" : "🏆 الفائز بالتقييم النهائي"}</span>
            </span>
            <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">
              {isTie ? "تعادل الكفتين في الأداء العام" : winner.phone.name}
            </h3>
            {!isTie && (
              <p className="text-[10px] sm:text-xs text-slate-450 dark:text-slate-500 font-bold mt-1">
                يتفوق بفارق <span className="font-mono text-emerald-650 dark:text-emerald-450">{scoreDiff}</span> نقطة على {runnerUp.phone.name}
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-950 text-white px-4 py-2.5 rounded-2xl border border-amber-500/30 flex items-center gap-1.5 shadow-lg shrink-0 w-full sm:w-auto justify-center">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-extrabold block leading-none">مجموع النقاط للفائز</span>
            <span className="text-3xl font-black font-mono text-amber-400 glow-score leading-none block mt-1">
              {winner.overallScore}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium self-end mb-0.5">/ 100</span>
        </div>
      </div>

      {/* Comparative Progress Bars */}
      <div className="space-y-4">
        {/* Phone A Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className={`font-bold truncate max-w-[80%] flex items-center gap-1.5 ${isAWinner ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-indigo-600 dark:text-indigo-400"}`}>
              {isAWinner && <span className="text-emerald-500 shrink-0">●</span>}
              {!isAWinner && !isTie && <span className="text-indigo-500 shrink-0">○</span>}
              <span>{phoneA.name}</span>
            </span>
            <span className="font-mono font-black text-slate-800 dark:text-slate-200 shrink-0">{pA.overallScore} / 100</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pA.overallScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isAWinner 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : (isTie ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-indigo-650")
              }`}
            />
          </div>
        </div>

        {/* Phone B Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className={`font-bold truncate max-w-[80%] flex items-center gap-1.5 ${isBWinner ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-indigo-600 dark:text-indigo-400"}`}>
              {isBWinner && <span className="text-emerald-500 shrink-0">●</span>}
              {!isBWinner && !isTie && <span className="text-indigo-500 shrink-0">○</span>}
              <span>{phoneB.name}</span>
            </span>
            <span className="font-mono font-black text-slate-805 dark:text-slate-200 shrink-0">{pB.overallScore} / 100</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pB.overallScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isBWinner 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : (isTie ? "bg-amber-500" : "bg-gradient-to-r from-indigo-500 to-indigo-650")
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
