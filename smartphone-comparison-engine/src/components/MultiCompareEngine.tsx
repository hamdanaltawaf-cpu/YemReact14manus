import React, { useState, useMemo, useRef } from "react";
import { useCompareStore } from "../store/compare.store";
import { extendedPhones } from "../data/defaultPhones";
import { SearchService } from "../services/search.service";
import { ComparisonService } from "../services/comparison.service";
import { 
  comparisonTemplates, 
  SmartphoneCalculatedResult 
} from "../utils/compareEngine";
import { 
  scoreSpecificationConfidence, 
  standardizePhoneName, 
  arePhonesDuplicated, 
  normalizePhoneSpecs 
} from "../utils/normalizationPipeline";

function getBrandColor(brand: string): string {
  const name = brand.toLowerCase();
  if (name.includes("apple")) return "bg-zinc-805 dark:bg-zinc-750 text-white border-zinc-500/30";
  if (name.includes("samsung")) return "bg-blue-600 dark:bg-blue-700 text-white border-blue-500/30";
  if (name.includes("google")) return "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-500/30";
  if (name.includes("xiaomi") || name.includes("poco")) return "bg-orange-500 dark:bg-orange-650 text-white border-orange-500/30";
  if (name.includes("oneplus")) return "bg-red-500 dark:bg-red-600 text-white border-red-500/30";
  return "bg-slate-500 dark:bg-slate-600 text-white border-slate-500/30";
}

function getBrandLogoLetter(brand: string): string {
  const name = brand.toLowerCase();
  if (name.includes("apple")) return "";
  if (name.includes("samsung")) return "S";
  if (name.includes("google")) return "G";
  if (name.includes("xiaomi")) return "X";
  if (name.includes("poco")) return "P";
  if (name.includes("oneplus")) return "1+";
  return brand.charAt(0).toUpperCase();
}

function MiniPhoneThumbnail({ brand }: { brand: string }) {
  const name = brand.toLowerCase();
  let glowColor = "border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xs";
  if (name.includes("apple")) glowColor = "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shadow-[0_0_6px_rgba(255,255,255,0.05)]";
  else if (name.includes("samsung")) glowColor = "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/45 shadow-[0_0_6px_rgba(59,130,246,0.1)]";
  else if (name.includes("google")) glowColor = "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/45 shadow-[0_0_6px_rgba(16,185,129,0.1)]";
  else if (name.includes("xiaomi") || name.includes("poco")) glowColor = "border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/45 shadow-[0_0_6px_rgba(249,115,22,0.1)]";
  else if (name.includes("oneplus")) glowColor = "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/45 shadow-[0_0_6px_rgba(239,68,68,0.1)]";

  return (
    <div className={`w-8 h-10 rounded-md border flex flex-col items-center justify-between p-0.5 shrink-0 relative overflow-hidden ${glowColor}`}>
      {/* Mini camera notch */}
      <div className="w-4 h-[2px] bg-slate-400 dark:bg-slate-700 rounded-full z-10" />
      
      {/* Shine overlay */}
      <div className="absolute inset-x-0 -top-full bottom-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 transform rotate-12 pointer-events-none" />
      
      {/* Mini internal screen structure */}
      <div className="w-full flex-grow rounded-[2px] bg-white/20 dark:bg-black/35 mt-0.5 flex items-center justify-center">
        <span className="text-[6.5px] font-black text-slate-400 dark:text-slate-505 scale-75 select-none font-mono">SPEC</span>
      </div>
    </div>
  );
}
import { 
  Trophy, 
  Trash2, 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  Cpu, 
  Smartphone as PhoneIcon, 
  Zap, 
  Battery, 
  Video, 
  Eye, 
  Info, 
  TrendingUp, 
  Share2, 
  Settings, 
  Layers, 
  ChevronRight, 
  Bookmark, 
  Star 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SmartSummaryCard from "./SmartSummaryCard";

export default function MultiCompareEngine() {
  const { 
    comparisonList, 
    addPhoneToCompare, 
    removePhoneFromCompare, 
    updatePhoneInCompare,
    setComparisonList 
  } = useCompareStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDataAudit, setShowDataAudit] = useState(false);

  const dataAuditResults = useMemo(() => {
    let missingCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    let inconsistentNameCount = 0;
    const itemsWithIssues: {
      phoneName: string;
      brand: string;
      issues: string[];
    }[] = [];

    // Audit each phone
    const seenNames = new Set<string>();
    
    extendedPhones.forEach((phone) => {
      const issues: string[] = [];
      
      const confidence = scoreSpecificationConfidence(phone);
      if (confidence.missingFields.length > 0) {
        issues.push(`حقول مفقودة: ${confidence.missingFields.join(", ")}`);
        missingCount += confidence.missingFields.length;
      }
      
      const norm = normalizePhoneSpecs(phone);
      if (norm.ramGB <= 0 || norm.storageGB <= 0) {
        issues.push("ذاكرة أو مساحة تخزين غير صالحة");
        invalidCount++;
      }
      if (norm.batteryCapacity <= 0 || norm.batteryCapacity < 1500) {
        issues.push("بطارية منخفضة أو غير مدخلة");
        invalidCount++;
      }
      if (norm.priceUSD <= 0) {
        issues.push("سعر الجهاز غير صالح");
        invalidCount++;
      }

      const name = phone.name;
      if (name !== name.trim() || name.includes("  ") || /[^a-zA-Z0-9\s.\-+()]/g.test(name.replace(/[\u0600-\u06FF]/g, ""))) {
        issues.push("رموز أو تباعد في التسمية");
        inconsistentNameCount++;
      }

      extendedPhones.forEach((other) => {
        if (other.name !== phone.name && !seenNames.has(other.name)) {
          if (arePhonesDuplicated(phone.name, other.name)) {
            issues.push(`تكرار محتمل مع: ${other.name}`);
            duplicateCount++;
          }
        }
      });

      seenNames.add(phone.name);

      if (issues.length > 0) {
        itemsWithIssues.push({
          phoneName: phone.name,
          brand: phone.brand,
          issues
        });
      }
    });

    return {
      totalAudited: extendedPhones.length,
      missingCount,
      duplicateCount: Math.round(duplicateCount / 2),
      invalidCount,
      inconsistentNameCount,
      itemsWithIssues
    };
  }, []);
  
  // Track currently edited specifications cell
  const [editingCell, setEditingCell] = useState<{
    phoneIdx: number;
    field: "screen" | "processor" | "camera" | "battery" | "charging" | "storage" | "price_range" | "other_specs";
  } | null>(null);
  
  const [editValue, setEditValue] = useState("");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Compute normalized scores and rankings dynamically via compareEngine
  const processedComparisons = useMemo(() => {
    return ComparisonService.calculate(comparisonList);
  }, [comparisonList]);

  // Filter list of additions to prevent duplicates
  const availablePhonesToAdd = useMemo(() => {
    return extendedPhones.filter(
      ep => !comparisonList.some(
        cl => cl.name.toLowerCase().trim() === ep.name.toLowerCase().trim()
      )
    );
  }, [comparisonList]);

  // Filter phones based on search query in the quick switcher drop-down using our robust Search Service
  const filteredAvailablePhones = useMemo(() => {
    if (!searchQuery) return availablePhonesToAdd;
    
    // Leverage the static Fuzzy search service with modern typo tolerance indexing
    const results = SearchService.searchPhones(searchQuery, {
      limit: 15,
      popularPrioritization: true
    });
    
    // Cross-reference search results with phones that are actually available to add (not already compared)
    return results
      .map(r => r.phone)
      .filter(p => availablePhonesToAdd.some(
        a => a.name.toLowerCase().trim() === p.name.toLowerCase().trim()
      ));
  }, [availablePhonesToAdd, searchQuery]);

  // Apply templates to compare array safely
  const handleApplyTemplate = (templateId: string) => {
    const template = comparisonTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Find full smartphone records matching names from template
    const templatePhones = template.phoneNames.map(name => {
      return extendedPhones.find(ep => ep.name === name) || {
        name,
        brand: name.split(" ")[0] || "غير معروف",
        screen: "شاشة لمس ممتازة",
        processor: "معالج قوي للأداء",
        camera: "كاميرا فائقة الدقة",
        battery: "5000 مللي أمبير",
        charging: "33 واط شحن سريع",
        storage: "128 جيجابايت / 8 جيجابايت رام",
        price_range: "$500",
        other_specs: "تقرير متكامل"
      };
    });

    setComparisonList(templatePhones);
    setSearchQuery("");
    setShowAddSelector(false);
  };

  const handleCopyClipboard = () => {
    const formatted = ComparisonService.formatForExport(processedComparisons);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formatted)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyToClipboard(formatted);
        });
    } else {
      fallbackCopyToClipboard(formatted);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleStartEditing = (phoneIdx: number, field: any, currentVal: string) => {
    // Manual editing is disabled, specifications must come only from the database, AI, or cached records.
    return;
  };

  const handleSaveEditing = () => {
    if (editingCell) {
      updatePhoneInCompare(editingCell.phoneIdx, editingCell.field, editValue);
      setEditingCell(null);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl space-y-8 animate-fade-in transition-all duration-400" id="multi-phone-compare-engine">
      
      {/* Engine Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/60 dark:border-white/5" id="engine-branding-element">
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Layers size={18} className="animate-pulse" />
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">ميزة هندسية جديدة</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            محرك المقارنة متعدد الأجهزة (2 - 6 هواتف)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            قارن عتاد ومقاييس الأداء مع ترتيب المراكز وتظليل ذكي لمكامن القوة فورياً وبنقاط دقيقة.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-205 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-sm border border-slate-205 dark:border-white/5"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span className="text-emerald-500">تم نسخ التقرير!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-slate-500" />
                <span>نسخ خلاصة المقارنة 📋</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <span>طباعة وتصدير PDF 🖨️</span>
          </button>
        </div>
      </div>

      {/* Preset Strategy Comparison Templates */}
      <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-250/20 dark:border-white/5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-200">
          <Bookmark size={13} className="text-indigo-600 dark:text-indigo-400" />
          <span>قوالب مقارنة سريعة جاهزة:</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {comparisonTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template.id)}
              className="p-3 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl transition-all cursor-pointer group shadow-xs hover:shadow-md"
            >
              <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                <span className="text-[10px] scale-90">⚔️</span>
                {template.title}
              </h5>
              <p className="text-[10px] text-slate-400 dark:text-slate-450 mt-1 line-clamp-2">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Data Quality Audit Validator Portal */}
      <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 space-y-3" dir="rtl">
        <button
          onClick={() => setShowDataAudit(!showDataAudit)}
          className="w-full flex items-center justify-between text-right cursor-pointer group"
          type="button"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Check size={14} />
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                لوحة تدقيق وجودة البيانات الفنية للكتالوج 📊
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 text-[9.5px] font-black px-2 py-0.5 rounded-full">
                  التقرير الفني جاهز 🟢
                </span>
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                اضغط لاستعراض وفحص معايير جودة المدخلات، الحقول المفقودة، التكرار المحتوم والرموز التعبيرية للأجهزة.
              </p>
            </div>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold group-hover:underline">
            {showDataAudit ? "إخفاء التقرير ▲" : "عرض التقرير تفصيلياً ▼"}
          </span>
        </button>

        {showDataAudit && (
          <div className="pt-3 border-t border-slate-200/45 dark:border-white/5 space-y-4 animate-fade-in font-sans">
            {/* Statistics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-black block">إجمالي الهواتف بالكتالوج</span>
                <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{dataAuditResults.totalAudited}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-black block">الحقول المفقودة</span>
                <span className={`text-sm font-black font-mono ${dataAuditResults.missingCount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                  {dataAuditResults.missingCount}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                <span className="text-[9.5px] text-slate-400 dark:text-slate-505 font-black block">التكرار المحتمل</span>
                <span className={`text-sm font-black font-mono ${dataAuditResults.duplicateCount > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                  {dataAuditResults.duplicateCount}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-black block">قيم غير صالحة</span>
                <span className={`text-sm font-black font-mono ${dataAuditResults.invalidCount > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                  {dataAuditResults.invalidCount}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-3 rounded-xl text-center space-y-0.5">
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-black block">عدم تناسق التسمية</span>
                <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{dataAuditResults.inconsistentNameCount}</span>
              </div>
            </div>

            {/* In-depth reports table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto text-right">
              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10.5px] font-black text-slate-700 dark:text-slate-300">
                <span>الجهاز المتأثر</span>
                <span>المشكلات المكتشفة بالتدقيق</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {dataAuditResults.itemsWithIssues.map((item, idx) => (
                  <div key={idx} className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none">{item.phoneName}</span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded leading-none">{item.brand}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {item.issues.map((issue, issueIdx) => (
                        <span key={issueIdx} className="text-[9.5px] font-bold text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-100/50 dark:border-amber-900/30">
                          ⚠️ {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {dataAuditResults.itemsWithIssues.length === 0 && (
                  <div className="text-center text-xs text-emerald-500 font-extrabold py-6">
                    🏆 تهانينا! الكتالوج نظيف بالكامل بنسبة 100% ولا توجد أي مشاكل معايير أو جودة مدخلات مفقودة.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Devices Controller Panel (Adds/Removes up to 6 devices) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Dynamic slots metadata */}
        <div className="bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-250 border border-slate-200/50 dark:border-white/5 flex items-center gap-2">
          <span>عدد الأجهزة النشطة:</span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-black">
            {comparisonList.length} / 6
          </span>
        </div>

        {/* Selected mini device bubbles */}
        <div className="flex flex-wrap items-center gap-2 flex-grow">
          {processedComparisons.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs shadow-xs"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="font-extrabold text-slate-800 dark:text-slate-300">{item.phone.name}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({item.phone.brand})</span>
              {comparisonList.length > 2 && (
                <button
                  onClick={() => removePhoneFromCompare(idx)}
                  className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="إزالة الهاتف"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}

          {/* Add Device Trigger Button */}
          {comparisonList.length < 6 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowAddSelector(!showAddSelector);
                  setSearchQuery("");
                }}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-400 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-indigo-200/40 dark:border-indigo-900/50 shadow-xs"
              >
                <Plus size={14} />
                <span>إضافة هاتف آخر 📱</span>
              </button>

              {showAddSelector && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 space-y-3 font-sans">
                  <div className="text-right text-[11px] font-bold text-slate-400">
                    حدد جهازاً لإضافته للمقارنة:
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الشركة..."
                    className="w-full text-right bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredAvailablePhones.length > 0 ? (
                      filteredAvailablePhones.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addPhoneToCompare(p);
                            setShowAddSelector(false);
                          }}
                          className="w-full text-right px-3 py-2 rounded-xl text-xs transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer text-slate-700 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-indigo-950/30"
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Phone thumbnail & brand badge */}
                            <div className="relative shrink-0">
                              <MiniPhoneThumbnail brand={p.brand} />
                              <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[7px] font-black shadow-xs ${getBrandColor(p.brand)}`}>
                                {getBrandLogoLetter(p.brand)}
                              </div>
                            </div>

                            <div className="flex flex-col items-start text-right">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</span>
                              <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">الشركة: {p.brand}</span>
                            </div>
                          </div>
                          
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 px-2 py-0.5 rounded-lg font-black font-mono">
                            {p.price_range || "$999"}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-[10px] py-4">
                        لا توجد هواتف أخرى مطابقة للمواصفات
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Smart Summary Card component */}
      {comparisonList.length >= 2 && (
        <div className="mb-6">
          <SmartSummaryCard phones={comparisonList} title="خلاصة المقارنة المتعددة للأجهزة 🏆" />
        </div>
      )}

      {/* Dynamic Multi-column Comparison Dashboard with Sticky Header */}
      <div 
        ref={tableContainerRef}
        className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/20 shadow-xs relative"
        id="scrollable-comparison-table-wrapper"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <table className="w-full border-collapse text-right min-w-[700px] md:min-w-[900px] lg:min-w-none">
          
          {/* Table Header: Sticky top row with Scoring visual updates */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 transition-colors backdrop-blur-md">
              
              {/* Category label column header */}
              <th className="p-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 w-44 sticky right-0 bg-slate-50 dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                المعيار / الجانب التقني
              </th>

              {/* Dynamic device columns */}
              {processedComparisons.map((item, idx) => (
                <th key={idx} className="p-5 text-center min-w-[140px] border-r border-slate-100 dark:border-slate-850 vertical-align-top">
                  <div className="space-y-4 font-sans relative">
                    
                    {/* Rank Ribbon */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 text-[10px] font-extrabold">
                      {item.rank === 1 ? (
                        <span className="text-amber-500">🥇 المركز الأول</span>
                      ) : item.rank === 2 ? (
                        <span className="text-slate-400">🥈 المركز الثاني</span>
                      ) : (
                        <span className="text-amber-700">🥉 المركز {item.rank}</span>
                      )}
                    </div>

                    {/* Device core name details */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{item.phone.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold mt-0.5">{item.phone.brand}</p>
                    </div>

                    {/* Overall Score Dial */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="relative h-14 w-14 flex items-center justify-center">
                        {/* Circle background progress track */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            className="text-slate-200 dark:text-slate-800"
                            fill="transparent"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - item.overallScore / 100)}
                            fill="transparent"
                          />
                        </svg>
                        <span className="text-xs font-black text-slate-850 dark:text-slate-100">
                          {item.overallScore}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">معدل التقييم</span>
                    </div>

                    {/* Highlights micro-badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1 min-h-[30px]">
                      {item.highlights.isBestValue && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/40">
                          أفضل قيمة 💰
                        </span>
                      )}
                      {item.highlights.isBestPerformance && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/40">
                          الأقوى أداءً 🔥
                        </span>
                      )}
                      {item.highlights.isBestCamera && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/40">
                          أفضل كاميرا 📸
                        </span>
                      )}
                      {item.highlights.isHighestBattery && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/40">
                          أقوى بطارية 🔋
                        </span>
                      )}
                      {item.highlights.isFastestCharging && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/40">
                          أسرع شحن ⚡
                        </span>
                      )}
                    </div>

                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body - specification parameters sections with inline editing support */}
          <tbody>
            
            {/* ================= CATEGORY: General ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                1. الفئة والمعلومات العامة
              </td>
            </tr>
            
            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                العلامة التجارية
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-center text-xs font-bold text-slate-800 dark:text-slate-300 border-r border-slate-100 dark:border-slate-850/60">
                  {item.phone.brand}
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Display ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                2. الشاشة والعرض (Display)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                معدل تقييم الشاشة
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{item.categoryScores.display}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.display}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تفاصيل الشاشة
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "screen" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "screen", item.phone.screen || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50 dark:hover:border-indigo-900/20"
                      title="انقر لتعديل تفاصيل المعيار"
                    >
                      {item.phone.screen || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Performance ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                3. معالج الأداء والعتاد والمحرك العصبي (Performance)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تقييم الأداء والعتاد
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-purple-650 dark:text-purple-400">{item.categoryScores.performance}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 dark:bg-purple-400 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.performance}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                المعالج والوحدة العصبية
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "processor" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "processor", item.phone.processor || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50"
                    >
                      {item.phone.processor || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تفاصيل التخزين والرام
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "storage" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "storage", item.phone.storage || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50"
                    >
                      {item.phone.storage || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Camera ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                4. مصفوفة الكاميرات المستشعرات (Camera)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تقييم منظومة التصوير
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-rose-650 dark:text-rose-400">{item.categoryScores.camera}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-600 dark:bg-rose-400 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.camera}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                مواصفات العدسات
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "camera" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "camera", item.phone.camera || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50"
                    >
                      {item.phone.camera || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Battery ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                5. البطارية والشحن السلكي واللاسلكي (Battery)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تقييم البطارية والشحن
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">{item.categoryScores.battery}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-600 dark:bg-amber-400 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.battery}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                سعة البطارية
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "battery" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "battery", item.phone.battery || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50"
                    >
                      {item.phone.battery || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                القدرة وتقنيات الشحن
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "charging" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "charging", item.phone.charging || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50"
                    >
                      {item.phone.charging || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Connectivity & Protection ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                6. الاتصال ومستويات الحماية (Connectivity & Protection)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تقييم الحماية والمتانة
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{item.categoryScores.connectivity}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.connectivity}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تفاصيل المتانة والحماية والمنفذ
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-right text-xs text-slate-650 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850/60 min-w-[200px] leading-relaxed relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "other_specs" ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "other_specs", item.phone.other_specs || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100/50"
                    >
                      {item.phone.other_specs || "غير متوفر"}
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Software ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                7. النظام وسنوات التحديثات السنوية (Software)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                تقييم النظام والدعم
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400">{item.categoryScores.software}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 dark:bg-teal-400 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.software}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* ================= CATEGORY: Price & Value ================= */}
            <tr className="bg-slate-100/50 dark:bg-slate-900/10 font-sans">
              <td colSpan={comparisonList.length + 1} className="p-2.5 text-xs font-black text-indigo-700 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/80 px-4">
                8. السعر ومعدل القيمة الموازنة (Price & Value Score)
              </td>
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                مؤشر القيمة مقابل السعر
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 border-r border-slate-100 dark:border-slate-850/60">
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs font-black text-green-600 dark:text-green-400">{item.categoryScores.value}/100</span>
                    <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-600 dark:bg-green-450 h-full rounded-full" 
                        style={{ width: `${item.categoryScores.value}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
              <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 sticky right-0 bg-white dark:bg-slate-900 shadow-[inset_-1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[inset_-1px_0_0_0_rgba(30,41,59,1)] z-10">
                السعر المتوقع بالأسواق
              </td>
              {processedComparisons.map((item, idx) => (
                <td key={idx} className="p-4 text-center text-xs text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-850/60 font-black relative group">
                  {editingCell?.phoneIdx === idx && editingCell?.field === "price_range" ? (
                    <div className="space-y-2 max-w-[155px] mx-auto">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                      />
                      <div className="flex justify-end gap-1">
                        <button onClick={handleSaveEditing} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">حفظ</button>
                        <button onClick={() => setEditingCell(null)} className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleStartEditing(idx, "price_range", item.phone.price_range || "")}
                      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-1.5 rounded-lg transition-colors inline-block"
                    >
                      <span className="text-green-600 dark:text-green-450 font-extrabold">{item.phone.price_range || "غير محدد"}</span>
                      <span className="opacity-0 group-hover:opacity-100 block text-[9px] text-indigo-500 font-bold mt-1">تعديل 📝</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

      {/* Reusable Scoring insights box cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6" id="scoring-insights-layout">
        <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
            <Trophy size={14} />
            <span>الهاتف الرائد الإجمالي 👑</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            بناءً على التقييمات التراكمية الموزونة لسرعة الأداء، منظومة الكاميرات، مواصفات الشاشة، والمتانة المصنعية:
          </p>
          <div className="pt-2">
            {processedComparisons.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">
                    {processedComparisons.find(p => p.rank === 1)?.phone.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    المركز الأول بمعدل {processedComparisons.find(p => p.rank === 1)?.overallScore}/100
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} />
            <span>ملك القيمة والاقتصاد 💰</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            الهاتف الذي يقدم أعلى جودة تقنية ومستشعرات فئة أولى مقابل السعر الفعلي المنافس بالأسواق:
          </p>
          <div className="pt-2">
            {processedComparisons.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">
                    {processedComparisons.find(p => p.highlights.isBestValue)?.phone.name || "معالجة المقاييس..."}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    معدل الفائدة الإجمالية {processedComparisons.find(p => p.highlights.isBestValue)?.categoryScores.value}/100
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400">
            <Zap size={14} />
            <span>عملاق الشحن والصمود 🔋</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            الهاتف المتصدر لأعلى قدرة شحن سلكية بالواط وسعة مللي أمبير لضمان عمل متواصل بدون انقطاع:
          </p>
          <div className="pt-2">
            {processedComparisons.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">
                    {processedComparisons.find(p => p.highlights.isHighestBattery)?.phone.name || processedComparisons[0]?.phone.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    بطارية {processedComparisons.find(p => p.highlights.isHighestBattery)?.normalizedSpecs.batteryCapacity || "5000"} مللي أمبير / {processedComparisons.find(p => p.highlights.isFastestCharging)?.normalizedSpecs.chargingSpeedWatts || "33"} واط شحن
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
