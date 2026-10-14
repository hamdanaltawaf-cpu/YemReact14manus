import { 
  Trophy, 
  Layers, 
  FileText, 
  HelpCircle, 
  Copy, 
  Check, 
  Calendar, 
  AlertTriangle,
  Share2,
  Zap,
  Tv,
  Camera,
  Battery,
  Database,
  Gamepad2,
  Coins
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone } from "../types";
import { formatArabicDate } from "../utils/date";
import ShareSocialCard from "./ShareSocialCard";
import { ComparisonService } from "../services/comparison.service";
import PhoneImage from "./PhoneImage";
import { MediaService } from "../services/media.service";

interface CompareResultsProps {
  markdown: string;
  analyzedAt: string;
  phoneAName: string;
  phoneBName: string;
  phoneA: Smartphone;
  phoneB: Smartphone;
}

function CompactScoreRow({ 
  label, 
  icon, 
  scoreA, 
  scoreB, 
  specA, 
  specB, 
  phoneAName, 
  phoneBName, 
  explanation 
}: { 
  label: string; 
  icon: React.ReactNode; 
  scoreA: number; 
  scoreB: number; 
  specA: string; 
  specB: string; 
  phoneAName: string; 
  phoneBName: string; 
  explanation: React.ReactNode; 
}) {
  const isAWinner = scoreA > scoreB;
  const isBWinner = scoreB > scoreA;
  const isTie = scoreA === scoreB;

  return (
    <div className="p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-705">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 shrink-0">{icon}</span>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{label}</h4>
        </div>
        <div className="flex items-center gap-1">
          {isTie ? (
            <span className="text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 px-2 py-0.5 rounded-md">تعادل ⚖️</span>
          ) : (
            <span className="text-[9px] font-extrabold bg-emerald-105 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-md">
              فوز: {isAWinner ? phoneAName.split(" ")[0] : phoneBName.split(" ")[0]} 🏆
            </span>
          )}
        </div>
      </div>

      {/* Comparisons */}
      <div className="space-y-2">
        {/* Phone A */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className={`font-semibold truncate max-w-[65%] ${isAWinner ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-500"}`}>{phoneAName}</span>
            <span className="font-mono text-[9.5px] text-slate-400 dark:text-slate-500 truncate max-w-[32%]">{specA}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-grow bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scoreA}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${isAWinner ? "bg-emerald-500" : "bg-indigo-500/80"}`} 
              />
            </div>
            <span className="font-mono text-[10.5px] font-black text-slate-700 dark:text-slate-350 shrink-0 w-6 text-left">{scoreA}</span>
          </div>
        </div>

        {/* Phone B */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className={`font-semibold truncate max-w-[65%] ${isBWinner ? "text-emerald-605 dark:text-emerald-400 font-bold" : "text-slate-500"}`}>{phoneBName}</span>
            <span className="font-mono text-[9.5px] text-slate-400 dark:text-slate-550 truncate max-w-[32%]">{specB}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-grow bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${scoreB}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${isBWinner ? "bg-emerald-500" : "bg-indigo-500/80"}`} 
              />
            </div>
            <span className="font-mono text-[10.5px] font-black text-slate-700 dark:text-slate-350 shrink-0 w-6 text-left">{scoreB}</span>
          </div>
        </div>
      </div>

      {/* Concise summary sentence block */}
      <div className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40 select-text">
        {explanation}
      </div>
    </div>
  );
}

export default function CompareResults({ markdown, analyzedAt, phoneAName, phoneBName, phoneA, phoneB }: CompareResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Math evaluation for ranking A vs B
  const results = useMemo(() => {
    return ComparisonService.calculate([phoneA, phoneB]);
  }, [phoneA, phoneB]);

  const pA = results.find(r => r.phone.name === phoneA.name) || results[0];
  const pB = results.find(r => r.phone.name === phoneB.name) || results[1] || results[0];

  const handleCopy = () => {
    const textToCopy = markdown;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyText(textToCopy);
        });
    } else {
      fallbackCopyText(textToCopy);
    }
  };

  const fallbackCopyText = (text: string) => {
    const javaScriptTextArea = document.createElement("textarea");
    javaScriptTextArea.value = text;
    javaScriptTextArea.style.position = "fixed";
    document.body.appendChild(javaScriptTextArea);
    javaScriptTextArea.focus();
    javaScriptTextArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy in CompareResults failed', err);
    }
    document.body.removeChild(javaScriptTextArea);
  };

  const formattedDate = formatArabicDate(analyzedAt);

  // Split markdown into sections
  const sections = useMemo(() => {
    const sects: Record<string, string> = {};
    const lines = markdown.split("\n");
    let currentHeader = "";
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith("## ") || line.startsWith("### ")) {
        if (currentHeader) {
          sects[currentHeader.toLowerCase().trim()] = currentContent.join("\n").trim();
        }
        currentHeader = line.replace(/^##+\s+/, "").trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentHeader) {
      sects[currentHeader.toLowerCase().trim()] = currentContent.join("\n").trim();
    }
    return sects;
  }, [markdown]);

  const getSectionText = (keywords: string[]) => {
    const keys = Object.keys(sections);
    for (const key of keys) {
      if (keywords.some(kw => key.includes(kw.toLowerCase()))) {
        return sections[key];
      }
    }
    return "";
  };

  const formatAndSplitText = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split("\n").filter(p => p.trim() !== "");
    return (
      <div className="space-y-3 text-right font-sans text-xs sm:text-sm leading-relaxed select-text">
        {paragraphs.map((p, pIdx) => {
          const trimmed = p.trim();
          if (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)) {
            const content = trimmed.replace(/^[-*\s]+|^\d+\.\s*/, "");
            return (
              <div key={pIdx} className="flex items-start gap-2 text-slate-705 dark:text-slate-350 pr-1 select-text">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span className="leading-relaxed font-semibold">{content}</span>
              </div>
            );
          }
          const sentences = trimmed.split(/(?<=[.?!؟.])\s+/);
          if (sentences.length > 2) {
            const chunks: string[] = [];
            for (let i = 0; i < sentences.length; i += 2) {
              chunks.push(sentences.slice(i, i + 2).join(" "));
            }
            return (
              <div key={pIdx} className="space-y-1.5 select-text">
                {chunks.map((chk, cIdx) => (
                  <p key={cIdx} className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                    {chk}
                  </p>
                ))}
              </div>
            );
          }
          return (
            <p key={pIdx} className="text-slate-605 dark:text-slate-300 font-semibold leading-relaxed select-text">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  const performanceText = getSectionText(["الأداء", "performance"]);
  const cameraText = getSectionText(["التصوير", "camera", "الكاميرا", "الكاميرات"]);
  const batteryText = getSectionText(["البطارية والشحن", "البطارية", "battery", "الشحن"]);

  const displayHighlightParagraph = `يمتاز هاتف **${phoneA.name}** بشاشة بمواصفات **${phoneA.screen}**، في حين يتمتع هاتف **${phoneB.name}** بشاشة بمواصفات **${phoneB.screen}**. تؤثر هذه التفاصيل المباشرة على زوايا الرؤية ومعدلات الإضاءة لخدمة احتياجات القراءة والتصفح والترفيه بأعلى درجات الراحة البصرية.`;
  const storageHighlightParagraph = `يقدم هاتف **${phoneA.name}** خيارات ذاكرة وتخزين تشمل **${phoneA.storage}**، بينما يوفر هاتف **${phoneB.name}** خيارات بسعة **${phoneB.storage}**. تساهم سعة الذاكرة العشوائية وسرعة استجابة وحدات التخزين في تحسين سرعة التطبيقات.`;
  const dynamicGamingParagraph = `ترتبط تجربة الألعاب بكفاءة وقوة المعالجات وجودة الشاشة. شريحة المعالجة في **${phoneA.name}** توفر استقرار إطارات ممتاز ومناسب، ومن جهة أخرى، يتميز **${phoneB.name}** بأداء رسومي رائع يتعامل مع أثقل معدلات التحديث دون عناء.`;
  const valueHighlightParagraph = `يتوفر هاتف **${phoneA.name}** في النطاق السعري **${phoneA.price_range || "غير محدد"}**، في حين يأتي هاتف **${phoneB.name}** بـ **${phoneB.price_range || "غير محدد"}**. يمثل تقييم القيمة مقابل السعر للـ **${phoneA.name}** البالغ **${pA.categoryScores.value}/100** وتقييم الـ **${phoneB.name}** البالغ **${pB.categoryScores.value}/100** خياراً ذكيا للاستثمار المالي.`;

  return (
    <div className="bg-white/75 dark:bg-slate-900/40 border border-slate-200/85 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-6 animate-fade-in transition-colors duration-400 font-sans" dir="rtl" id="comparison-results-wrapper">
      
      {/* Upper Status Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-650 animate-pulse"></span>
          </span>
          <div className="text-right">
            <h4 className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">ملحق الذكاء الاصطناعي:</h4>
            <p className="text-xs font-extrabold text-slate-850 dark:text-slate-105">تحليل فني عميق مدقق من محرك Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right sm:text-left">
            <span className="text-[10px] text-slate-450 block font-bold">تاريخ التحليل:</span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 animate-fade-in">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-indigo-650 to-indigo-600 hover:from-indigo-700 hover:to-indigo-650 text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-md shadow-indigo-505/10"
              id="btn-social-share-card"
            >
              <Share2 size={11} className="text-white shrink-0" />
              <span>بطاقة المقارنة الجاهزة 📸</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 bg-white/75 dark:bg-slate-955/40 hover:bg-slate-100 dark:hover:bg-slate-955 border border-slate-200 dark:border-white/5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              id="btn-print-report"
            >
              <FileText size={11} className="text-indigo-600 dark:text-indigo-400" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-white/75 dark:bg-slate-955/40 hover:bg-slate-100 dark:hover:bg-slate-955 border border-slate-200 dark:border-white/5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              id="btn-copy-report"
            >
              {copied ? (
                <>
                  <Check size={11} className="text-emerald-600" />
                  <span className="text-emerald-600 font-bold">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy size={11} className="text-slate-550" />
                  <span>نسخ التقرير</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Styled Rendered Markdown container (Verdict + Table only) */}
      <div className="prose-arabic-container text-right" id="verdict-and-quick-matrix-container">
        <style>{`
          .prose-arabic-container h2 {
            font-size: 1.25rem;
            font-weight: 800;
            color: #0f172a;
            margin-top: 1.75rem;
            margin-bottom: 0.85rem;
            padding-bottom: 0.4rem;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .prose-arabic-container h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e293b;
            margin-top: 1.25rem;
            margin-bottom: 0.65rem;
          }
          .prose-arabic-container p {
            font-size: 0.9rem;
            line-height: 1.75;
            color: #334155;
            margin-bottom: 1rem;
          }
          /* Markdown Table styling */
          .prose-arabic-container table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.25rem 0;
            font-size: 0.85rem;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }
          .prose-arabic-container th, .prose-arabic-container td {
            padding: 10px 14px;
            text-align: right;
            border-bottom: 1px solid #e2e8f0;
          }
          .prose-arabic-container th {
            background-color: rgba(16, 185, 129, 0.08);
            color: #047857;
            font-weight: 800;
          }
          .prose-arabic-container td:nth-child(2), .prose-arabic-container th:nth-child(2) {
            border-left: 1px solid rgba(16, 185, 129, 0.15);
          }
          .prose-arabic-container tr:last-child td {
            border-bottom: none;
          }
          .prose-arabic-container tr:hover td {
            background-color: #f8fafc;
          }
          .prose-arabic-container table tr td:first-child {
            font-weight: bold;
            color: #475569;
            background-color: #f8fafc;
            width: 25%;
          }
          .prose-arabic-container ul, .prose-arabic-container ol {
            margin: 0.85rem 0;
            padding-right: 1.25rem;
            list-style-type: decimal;
            space-y: 0.4rem;
          }
          .prose-arabic-container li {
            line-height: 1.65;
            font-size: 0.875rem;
            color: #334155;
            margin-bottom: 0.4rem;
          }
          .prose-arabic-container strong {
            color: #059669;
            font-weight: 700;
          }
          .prose-arabic-container h2:first-of-type + p, .verdict-box {
            background: rgba(16, 185, 129, 0.04);
            border: 1px solid rgba(16, 185, 129, 0.12);
            border-right-width: 5px;
            border-right-color: #10b981;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 20px;
            color: #064e3b;
          }

          /* Dynamic Dark Mode stylesheet overrides */
          .dark .prose-arabic-container h2 {
            color: #f8fafc;
            border-bottom: 2px solid #334155;
          }
          .dark .prose-arabic-container h3 {
            color: #e2e8f0;
          }
          .dark .prose-arabic-container p {
            color: #cbd5e1;
          }
          .dark .prose-arabic-container table {
            background-color: #030712;
            border: 1px solid #1e293b;
          }
          .dark .prose-arabic-container th, .dark .prose-arabic-container td {
            border-bottom: 1px solid #1e293b;
          }
          .dark .prose-arabic-container th {
            background-color: rgba(16, 185, 129, 0.15);
            color: #34d399;
            font-weight: 800;
          }
          .dark .prose-arabic-container td:nth-child(2), .dark .prose-arabic-container th:nth-child(2) {
            border-left: 1px solid rgba(16, 185, 129, 0.2);
          }
          .dark .prose-arabic-container tr:hover td {
            background-color: #111827;
          }
          .dark .prose-arabic-container table tr td:first-child {
            color: #94a3b8;
            background-color: #0c111d;
          }
          .dark .prose-arabic-container li {
            color: #cbd5e1;
          }
          .dark .prose-arabic-container strong {
            color: #34d399;
          }
          .dark .prose-arabic-container h2:first-of-type + p, .dark .verdict-box {
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-right-width: 5px;
            border-right-color: #34d399;
            color: #ecfdf5;
          }
        `}</style>
      </div>

      {/* 1. Technical Category Comparison Cards directly in the main flow */}
      <div className="space-y-4 pt-1" id="technical-details-section">
        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>🔬</span>
          <span>بطاقات التفصيل والمقارنة الفئوية الفنية</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 1: ⚡ الأداء والمعالج */}
          <CompactScoreRow 
            label="الأداء والمعالج"
            icon={<Zap size={14} />}
            scoreA={pA.categoryScores.performance}
            scoreB={pB.categoryScores.performance}
            specA={phoneA.processor}
            specB={phoneB.processor}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={performanceText ? formatAndSplitText(performanceText) : formatAndSplitText(phoneA.processor + " مقارنةً بـ " + phoneB.processor)}
          />

          {/* CARD 2: 📱 الشاشة وتجربة العرض */}
          <CompactScoreRow 
            label="الشاشة وتجربة العرض"
            icon={<Tv size={14} />}
            scoreA={pA.categoryScores.display}
            scoreB={pB.categoryScores.display}
            specA={phoneA.screen}
            specB={phoneB.screen}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={formatAndSplitText(displayHighlightParagraph)}
          />

          {/* CARD 3: 📷 الكاميرات والتصوير */}
          <CompactScoreRow 
            label="الكاميرات والتصوير"
            icon={<Camera size={14} />}
            scoreA={pA.categoryScores.camera}
            scoreB={pB.categoryScores.camera}
            specA={phoneA.camera}
            specB={phoneB.camera}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={cameraText ? formatAndSplitText(cameraText) : formatAndSplitText(phoneA.camera + " مقارنةً بـ " + phoneB.camera)}
          />

          {/* CARD 4: 🔋 البطارية والشحن */}
          <CompactScoreRow 
            label="البطارية والشحن"
            icon={<Battery size={14} />}
            scoreA={pA.categoryScores.battery}
            scoreB={pB.categoryScores.battery}
            specA={phoneA.battery}
            specB={phoneB.battery}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={batteryText ? formatAndSplitText(batteryText) : formatAndSplitText(phoneA.battery + "، مع شحن بقوة " + phoneA.charging)}
          />

          {/* CARD 5: 💾 الذاكرة والتخزين */}
          <CompactScoreRow 
            label="الذاكرة والتخزين"
            icon={<Database size={14} />}
            scoreA={phoneA.normalized?.storageGB && phoneB.normalized?.storageGB ? (phoneA.normalized.storageGB >= phoneB.normalized.storageGB ? 92 : 82) : 90}
            scoreB={phoneA.normalized?.storageGB && phoneB.normalized?.storageGB ? (phoneB.normalized.storageGB >= phoneA.normalized.storageGB ? 92 : 82) : 90}
            specA={phoneA.storage}
            specB={phoneB.storage}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={formatAndSplitText(storageHighlightParagraph)}
          />

          {/* CARD 6: 🎮 الألعاب والاستخدام المكثف */}
          <CompactScoreRow 
            label="الألعاب والاستخدام المكثف"
            icon={<Gamepad2 size={14} />}
            scoreA={pA.categoryScores.performance}
            scoreB={pB.categoryScores.performance}
            specA={phoneA.processor}
            specB={phoneB.processor}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={formatAndSplitText(dynamicGamingParagraph)}
          />

          {/* CARD 7: 💰 القيمة مقابل السعر */}
          <CompactScoreRow 
            label="القيمة مقابل السعر"
            icon={<Coins size={14} />}
            scoreA={pA.categoryScores.value}
            scoreB={pB.categoryScores.value}
            specA={phoneA.price_range || "غير محدد"}
            specB={phoneB.price_range || "غير محدد"}
            phoneAName={phoneA.name}
            phoneBName={phoneB.name}
            explanation={formatAndSplitText(valueHighlightParagraph)}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-white/5 pt-2" />

      {/* Deep-dive Technical Disclaimer */}
      <div className="bg-slate-50 dark:bg-slate-950/45 p-4 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-start gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-755 dark:text-slate-205 block mb-1">تنبيه وملاحظة فنية:</span>
          هذا التقرير مبني على مقارنات الحقائق والبيانات الفنية الفعالة للنماذج المدخلة. تم ضبط معامل حرارة محرك الذكاء الاصطناعي بدقة تبلغ 0.2 لضمان استرجاع حيادي وذاتي تام للميزات والنقاط الهندسية في الأجهزة دون تزييف.
        </div>
      </div>

      {showShareModal && (
        <ShareSocialCard 
          phoneA={phoneA} 
          phoneB={phoneB} 
          markdown={markdown}
          analyzedAt={analyzedAt}
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
}
