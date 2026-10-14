import { Smartphone } from "../types";
import { ScoringService } from "../services/scoring.service";
import { 
  Tv, 
  Cpu, 
  Camera, 
  Battery, 
  Zap, 
  Database, 
  Coins,
  TableProperties,
  ShieldCheck,
  Wifi,
  Gauge,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

interface SpecificationMatrixProps {
  phoneA: Smartphone;
  phoneB: Smartphone;
}

export default function SpecificationMatrix({ phoneA, phoneB }: SpecificationMatrixProps) {
  // Calculate comprehensive score values for both devices using pure backend algorithms
  const scoresA = ScoringService.calculateSingleCategoryScores(phoneA);
  const scoresB = ScoringService.calculateSingleCategoryScores(phoneB);

  // Specification Category definitions with score keys matching our scoring service model
  const categories = [
    {
      key: "processor" as keyof Smartphone,
      scoreKey: "performance",
      label: "أداء المعالج المركزي CPU",
      icon: Cpu,
      color: "from-indigo-500 to-purple-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "gpu" as keyof Smartphone,
      scoreKey: "gpu",
      label: "أداء معالج الرسومات GPU",
      icon: Layers,
      color: "from-fuchsia-500 to-pink-500 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    },
    {
      key: "antutu" as keyof Smartphone,
      scoreKey: "antutu",
      label: "معيار سرعة Antutu Benchmark",
      icon: Gauge,
      color: "from-red-500 to-orange-500 bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      key: "geekbench" as keyof Smartphone,
      scoreKey: "geekbench",
      label: "معيار اختبار Geekbench للنواة المتعددة",
      icon: Activity,
      color: "from-blue-500 to-indigo-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      key: "screen" as keyof Smartphone,
      scoreKey: "display",
      label: "الشاشة وتجربة العرض",
      icon: Tv,
      color: "from-sky-500 to-blue-500 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      key: "camera" as keyof Smartphone,
      scoreKey: "camera",
      label: "الكاميرات وجودة التصوير",
      icon: Camera,
      color: "from-pink-500 to-rose-500 bg-pink-500/10 text-pink-600 dark:text-pink-400",
    },
    {
      key: "battery" as keyof Smartphone,
      scoreKey: "battery",
      label: "البطارية وسعة الاستعمال",
      icon: Battery,
      color: "from-emerald-500 to-teal-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "charging" as keyof Smartphone,
      scoreKey: "charging",
      label: "سرعة الشحن وإمدادات الطاقة",
      icon: Zap,
      color: "from-amber-500 to-orange-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      key: "waterResistance" as keyof Smartphone,
      scoreKey: "waterResistance",
      label: "مقاومة الماء والغبار",
      icon: ShieldCheck,
      color: "from-teal-500 to-emerald-500 bg-teal-500/10 text-teal-605 dark:text-teal-400",
    },
    {
      key: "supports5G" as keyof Smartphone,
      scoreKey: "supports5G",
      label: "دعم شبكات الاتصال الجيل الخامس 5G",
      icon: Wifi,
      color: "from-cyan-500 to-blue-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    },
  ];

  return (
    <div 
      className="bg-white/85 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 font-sans space-y-5"
      id="unified-specification-matrix-card"
      dir="rtl"
    >
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
            <TableProperties size={18} />
          </div>
          <div className="text-right">
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">مصفوفة توازن المقارنة الذكية ببطاقات تقييم مخصصة</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">تحليل عميق عتادي بريميوم بنسب توازن ذكية</p>
          </div>
        </div>
        
        <span className="text-[10px] sm:text-xs bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-100/10">
          مصفوفة التوازن 📊
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="specification-matrix-cards">
        {categories.map((cat) => {
          const Icon = cat.icon;
          
          // Form safe Arabic strings for displaying specs
          let valA = "غير متوفر";
          let valB = "غير متوفر";

          if (cat.key === "waterResistance") {
            valA = phoneA.waterResistance || phoneA.water_resistance || "غير متوفر";
            valB = phoneB.waterResistance || phoneB.water_resistance || "غير متوفر";
          } else if (cat.key === "supports5G") {
            const hasA = phoneA.supports5G ?? (phoneA.has5g === true || phoneA.has5g === "true");
            const hasB = phoneB.supports5G ?? (phoneB.has5g === true || phoneB.has5g === "true");
            valA = hasA ? "نعم، يدعم شبكات الجيل الخامس 5G فائقة السرعة بالكامل" : "لا، يقتصر على شبكات الجيل الرابع 4G";
            valB = hasB ? "نعم، يدعم شبكات الجيل الخامس 5G فائقة السرعة بالكامل" : "لا، يقتصر على شبكات الجيل الرابع 4G";
          } else if (cat.key === "geekbench") {
            valA = phoneA.geekbench || (phoneA.geekbenchSingle && phoneA.geekbenchMulti ? `Single: ${phoneA.geekbenchSingle} / Multi: ${phoneA.geekbenchMulti}` : "غير متوفر");
            valB = phoneB.geekbench || (phoneB.geekbenchSingle && phoneB.geekbenchMulti ? `Single: ${phoneB.geekbenchSingle} / Multi: ${phoneB.geekbenchMulti}` : "غير متوفر");
          } else {
            valA = (phoneA[cat.key] as string) || "غير متوفر";
            valB = (phoneB[cat.key] as string) || "غير متوفر";
          }

          // Read numeric score out of 100 for visual bars
          const scoreA = scoresA[cat.scoreKey as keyof typeof scoresA] || 0;
          const scoreB = scoresB[cat.scoreKey as keyof typeof scoresB] || 0;

          const isWinnerA = scoreA > scoreB;
          const isWinnerB = scoreB > scoreA;
          const isTie = scoreA === scoreB;

          return (
            <div 
              key={cat.key}
              className="bg-white/90 dark:bg-slate-950/20 border border-slate-205/60 dark:border-white/5 rounded-[22px] p-4.5 shadow-xs flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60 font-sans">
                <span className={`p-1.5 rounded-lg ${cat.color} shrink-0`}>
                  <Icon size={15} />
                </span>
                <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white">{cat.label}</span>
              </div>

              {/* Progress and Data comparisons */}
              <div className="space-y-3 flex-grow font-sans">
                {/* Phone A */}
                <div className="space-y-1 text-right">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className={`font-bold truncate max-w-[70%] ${isWinnerA ? "text-slate-950 dark:text-white font-black" : "text-slate-500 dark:text-slate-450"}`}>
                      {phoneA.name}
                    </span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-250">{scoreA} / 100</span>
                  </div>
                  {/* Progress Bar A */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800/65 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isWinnerA ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-350 dark:bg-slate-600'}`} 
                      style={{ width: `${scoreA}%` }} 
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
                    {valA}
                  </p>
                </div>

                {/* Divider line between phone specs */}
                <div className="h-px bg-slate-50 dark:bg-slate-800/30" />

                {/* Phone B */}
                <div className="space-y-1 text-right">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className={`font-bold truncate max-w-[70%] ${isWinnerB ? "text-slate-950 dark:text-white font-black" : "text-slate-500 dark:text-slate-450"}`}>
                      {phoneB.name}
                    </span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-250">{scoreB} / 100</span>
                  </div>
                  {/* Progress Bar B */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800/65 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isWinnerB ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-350 dark:bg-slate-600'}`} 
                      style={{ width: `${scoreB}%` }} 
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
                    {valB}
                  </p>
                </div>
              </div>

              {/* Bottom Winner badge */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                {isTie ? (
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md leading-none">
                    ⚖️ تعادل الكفتين في هذه الفئة
                  </span>
                ) : (
                  <span className="text-[9.5px] sm:text-[10.5px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400 leading-none">
                    <span>🏆</span>
                    <span>{isWinnerA ? phoneA.name : phoneB.name} أفضل</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ⭐ المواصفات البريميوم Block requested in Part 4 */}
      <div className="mt-8 border-t border-slate-205 dark:border-slate-800 pt-6 space-y-4" id="premium-specs-comparison-section">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 animate-pulse">
            <Sparkles size={18} />
          </div>
          <div className="text-right">
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">⭐ بطاقات المواصفات التقنية الفئوية - المواصفات البريميوم</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">جدول المقارنة العميقة المتكامل للميزات الحصرية وأرقام الأداء الأصيل</p>
          </div>
        </div>

        {/* Dynamic side by side table comparison */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20" id="premium-specs-table-wrapper">
          <table className="w-full text-right border-collapse text-xs sm:text-sm font-semibold text-slate-705 dark:text-slate-300 min-w-[600px]">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <th className="py-3 px-4 text-right font-black w-1/4">المواصفة البريميوم</th>
                <th className="py-3 px-4 text-center font-black w-3/8 text-indigo-600 dark:text-indigo-400">{phoneA.name}</th>
                <th className="py-3 px-4 text-center font-black w-3/8 text-emerald-600 dark:text-emerald-400">{phoneB.name}</th>
              </tr>
            </thead>
            <tbody>
              {/* Release Year */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">سنة الإصدار</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{phoneA.releaseYear || "—"}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{phoneB.releaseYear || "—"}</td>
              </tr>
              {/* GPU */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">GPU (معالج الرسوميات)</td>
                <td className="py-3 px-4 text-center font-sans font-bold text-slate-800 dark:text-slate-200">{phoneA.gpu || "—"}</td>
                <td className="py-3 px-4 text-center font-sans font-bold text-slate-800 dark:text-slate-200">{phoneB.gpu || "—"}</td>
              </tr>
              {/* OS */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">نظام التشغيل</td>
                <td className="py-3 px-4 text-center font-sans text-slate-850 dark:text-slate-200">{phoneA.os || "—"}</td>
                <td className="py-3 px-4 text-center font-sans text-slate-850 dark:text-slate-200">{phoneB.os || "—"}</td>
              </tr>
              {/* Antutu */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">اختبار Antutu</td>
                <td className="py-3 px-4 text-center font-mono font-black text-amber-600 dark:text-amber-500">
                  {phoneA.antutu ? parseInt(phoneA.antutu).toLocaleString() : "—"}
                </td>
                <td className="py-3 px-4 text-center font-mono font-black text-amber-600 dark:text-amber-500">
                  {phoneB.antutu ? parseInt(phoneB.antutu).toLocaleString() : "—"}
                </td>
              </tr>
              {/* Geekbench */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">Geekbench (Single / Multi)</td>
                <td className="py-3 px-4 text-center font-mono">
                  {phoneA.geekbenchSingle && phoneA.geekbenchMulti ? (
                    <span className="flex flex-col items-center justify-center leading-tight">
                      <span className="text-[13px] font-extrabold text-indigo-650 dark:text-indigo-400">نواة مفردة: {phoneA.geekbenchSingle}</span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">نواة متعددة: {phoneA.geekbenchMulti}</span>
                    </span>
                  ) : phoneA.geekbench || "—"}
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {phoneB.geekbenchSingle && phoneB.geekbenchMulti ? (
                    <span className="flex flex-col items-center justify-center leading-tight">
                      <span className="text-[13px] font-extrabold text-indigo-650 dark:text-indigo-400">نواة مفردة: {phoneB.geekbenchSingle}</span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">نواة متعددة: {phoneB.geekbenchMulti}</span>
                    </span>
                  ) : phoneB.geekbench || "—"}
                </td>
              </tr>
              {/* Fingerprint */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">مستشعر البصمة</td>
                <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-305">{phoneA.fingerprint || "—"}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-305">{phoneB.fingerprint || "—"}</td>
              </tr>
              {/* Weight */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">الوزن</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{phoneA.weight || "—"}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{phoneB.weight || "—"}</td>
              </tr>
              {/* Dimensions */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">الأبعاد</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{phoneA.dimensions || "—"}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">{phoneB.dimensions || "—"}</td>
              </tr>
              {/* Water Resistance */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">مقاومة الماء والغبار</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-250">{phoneA.waterResistance || phoneA.water_resistance || "—"}</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-250">{phoneB.waterResistance || phoneB.water_resistance || "—"}</td>
              </tr>
              {/* 5G */}
              <tr className="border-b border-slate-100 dark:border-slate-800/65 hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">يدعم 5G</td>
                <td className="py-3 px-4 text-center font-bold">
                  {(phoneA.supports5G === true || phoneA.has5g === true || phoneA.has5g === "true") ? "🟢 يدعم شبكات الاتصال للجيل الخامس بالكامل" : "🔴 غير متوفر (يقتصر على 4G)"}
                </td>
                <td className="py-3 px-4 text-center font-bold">
                  {(phoneB.supports5G === true || phoneB.has5g === true || phoneB.has5g === "true") ? "🟢 يدعم شبكات الاتصال للجيل الخامس بالكامل" : "🔴 غير متوفر (يقتصر على 4G)"}
                </td>
              </tr>
              {/* Other Specs */}
              <tr className="hover:bg-slate-100/40 dark:hover:bg-slate-900/20">
                <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white bg-slate-100/20 dark:bg-slate-900/10">المميزات الإضافية</td>
                <td className="py-3 px-4 text-center text-[11.5px] leading-relaxed text-slate-550 dark:text-slate-400 font-bold max-w-[280px]">
                  {phoneA.otherSpecs || phoneA.other_specs || "—"}
                </td>
                <td className="py-3 px-4 text-center text-[11.5px] leading-relaxed text-slate-550 dark:text-slate-400 font-bold max-w-[280px]">
                  {phoneB.otherSpecs || phoneB.other_specs || "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
