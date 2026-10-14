import { useEffect, useRef, useMemo } from "react";
import { useCompareStore } from "../store/compare.store";
import { useGenerateSpecsMutation } from "../hooks/useQueries";
import { Smartphone } from "../types";
import { useSmartphoneSearch } from "../hooks/useSmartphoneSearch";
import PhoneImage from "./PhoneImage";
import { 
  Cpu, 
  Battery, 
  Database, 
  Search, 
  Loader2,
  Sparkles
} from "lucide-react";

function getBrandColor(brand: string): string {
  const name = brand.toLowerCase();
  if (name.includes("apple")) return "bg-zinc-800 dark:bg-zinc-750 text-white border-zinc-500/30";
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
  else if (name.includes("oneplus")) glowColor = "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-955/45 shadow-[0_0_6px_rgba(239,68,68,0.1)]";

  return (
    <div className={`w-8 h-10 rounded-md border flex flex-col items-center justify-between p-0.5 shrink-0 relative overflow-hidden ${glowColor}`}>
      <div className="w-4 h-[2px] bg-slate-400 dark:bg-slate-700 rounded-full z-10" />
      <div className="absolute inset-x-0 -top-full bottom-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 transform rotate-12 pointer-events-none" />
      <div className="w-full flex-grow rounded-[2px] bg-white/20 dark:bg-black/35 mt-0.5 flex items-center justify-center">
        <span className="text-[6.5px] font-black text-slate-400 dark:text-slate-500 scale-75 select-none font-mono">SPEC</span>
      </div>
    </div>
  );
}

interface PhoneSpecFormProps {
  id: "A" | "B";
  title: string;
}

export default function PhoneSpecForm({ id }: PhoneSpecFormProps) {
  const isGreen = id === "A";
  
  // Access state and dispatchers directly from Zustand
  const phone = useCompareStore((state) => isGreen ? state.phoneA : state.phoneB);
  const setPhone = useCompareStore((state) => isGreen ? state.setPhoneA : state.setPhoneB);

  // Auto spec generation hook
  const generateSpecsMutation = useGenerateSpecsMutation();

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    suggestions: searchSuggestionsResult,
    isOpen: showSuggestions,
    setIsOpen: setShowSuggestions,
    activeIndex: activeSuggestionIndex,
    setActiveIndex: setActiveSuggestionIndex,
    selectSuggestion: handleSelectSuggestionWithStore,
    handleKeyDown: handleSearchKeyDown,
  } = useSmartphoneSearch({
    initialQuery: "",
    debounceMs: 200,
    limit: 6,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Synchronize input typing state with external changes to phone name
  useEffect(() => {
    setSearchQuery("");
    setShowSuggestions(false);
  }, [phone.name, setSearchQuery, setShowSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSuggestions]);

  const handleSelectSuggestion = (suggestedPhone: Smartphone) => {
    setPhone({ ...suggestedPhone });
    setSearchQuery("");
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    handleSelectSuggestionWithStore(suggestedPhone);
  };

  const handleFieldNameChange = (newValue: string) => {
    setSearchQuery(newValue);
    if (newValue.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyDown(e, (selectedPhone) => {
      setPhone({ ...selectedPhone });
      setSearchQuery("");
      setShowSuggestions(false);
    });
  };

  const handleAutoRetrieve = () => {
    const queryTerm = searchQuery.trim();
    if (!queryTerm) return;

    generateSpecsMutation.mutate(queryTerm, {
      onSuccess: (specs) => {
        setPhone(specs);
        setSearchQuery("");
        setShowSuggestions(false);
      }
    });
  };

  const isGenerating = generateSpecsMutation.isPending;
  const genStatus = generateSpecsMutation.data 
    ? "تم التحديث بالذكاء الاصطناعي ✨" 
    : (generateSpecsMutation.error ? `خطأ: ${generateSpecsMutation.error.message}` : null);

  // Custom RAM, Storage, and Battery specs extractors with safe fallbacks
  const ramValueText = useMemo(() => {
    if (phone.normalized?.ramGB) {
      return `${phone.normalized.ramGB} جيجابايت RAM`;
    }
    const match = phone.storage.match(/(\d+)\s*(?:GB|جيجا|جيجابايت)\s*(?:رام|RAM|ram)/i) || phone.storage.match(/(?:رام|RAM|ram)\s*(\d+)/i);
    return match ? `${match[1]} جيجابايت RAM` : "8 جيجابايت RAM";
  }, [phone]);

  const storageValueText = useMemo(() => {
    if (phone.normalized?.storageGB) {
      return `${phone.normalized.storageGB} جيجابايت`;
    }
    const match = phone.storage.match(/(\d+)\s*(?:GB|TB|جيجا|تيرابايت|تيرا|جيجابايت)/i);
    return match ? `${match[0]}` : "256 جيجابايت";
  }, [phone]);

  const batteryValueText = useMemo(() => {
    if (phone.normalized?.batteryCapacity) {
      return `${phone.normalized.batteryCapacity} مللي أمبير`;
    }
    const match = phone.battery.match(/(\d+)\s*(?:mAh|ملي|مللي|امبير|أمبير)/i);
    return match ? `${match[0]}` : "5000 مللي أمبير";
  }, [phone]);

  // Dynamic Theme Styling constants
  const themeBg = isGreen ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700";
  const themeFocusBorder = isGreen ? "focus:border-emerald-400/80" : "focus:border-indigo-400/80";
  const themeFocusRing = isGreen ? "focus:ring-emerald-500/10" : "focus:ring-indigo-500/10";
  
  const glassBorder = isGreen 
    ? "border-emerald-200/50 dark:border-emerald-900/20" 
    : "border-indigo-200/50 dark:border-indigo-900/20";
    
  const glassGlow = isGreen
    ? "shadow-[0_4px_24px_rgba(16,185,129,0.02)]"
    : "shadow-[0_4px_24px_rgba(79,70,229,0.02)]";

  return (
    <div className={`bg-white/80 dark:bg-slate-900/40 border ${glassBorder} rounded-3xl p-3 sm:p-4 pb-4 ${glassGlow} backdrop-blur-xl flex flex-col justify-between h-full transition-all duration-305 font-sans`} dir="rtl" id={`phone-form-container-${id}`}>
      
      {/* Search Input & AI Retrieval Gateway */}
      <div className="mb-3.5 relative" ref={wrapperRef}>
        <div className="flex gap-1.5">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder="ابحث عن هاتف أو اكتب اسمه..."
              className={`w-full bg-slate-50/60 dark:bg-slate-950/45 border border-slate-250 dark:border-slate-800/80 rounded-xl pr-7 pl-2 py-1.5 text-[10.5px] sm:text-xs text-slate-800 dark:text-slate-150 focus:outline-none ${themeFocusBorder} focus:ring-2 ${themeFocusRing} text-right font-sans transition-all`}
              disabled={isGenerating}
              autoComplete="off"
              id={`search-input-field-${id}`}
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          
          <button
            type="button"
            onClick={handleAutoRetrieve}
            disabled={isGenerating || !searchQuery.trim()}
            className={`${themeBg} text-white shadow-xs border border-transparent px-2.5 py-1.5 rounded-xl text-[9.5px] sm:text-[10px] font-black flex items-center gap-0.5 transition-all cursor-pointer disabled:opacity-50 shrink-0`}
            id={`btn-search-retrieve-${id}`}
            title="جلب المواصفات بالذكاء الاصطناعي من الويب فورياً"
          >
            {isGenerating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
            <span className="hidden xs:inline">استرداد ذكي</span>
          </button>
        </div>

        {/* Suggestion dropdown popup */}
        {showSuggestions && searchSuggestionsResult.length > 0 && (
          <div 
            className="absolute z-55 w-full mt-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 backdrop-blur-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-right animate-fade-in"
            id={`autocomplete-dropdown-${id}`}
          >
            {searchSuggestionsResult.map((result, idx) => {
              const item = result.phone;
              const isActive = idx === activeSuggestionIndex;
              const activeClass = isActive 
                ? (id === "A" 
                    ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-650/15 dark:text-emerald-300 font-bold"
                    : "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-650/15 dark:text-indigo-300 font-bold"
                  )
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50";
              
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setActiveSuggestionIndex(idx)}
                  className={`w-full text-right px-3 py-2 text-xs transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${activeClass}`}
                  id={`suggestion-item-${id}-${idx}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <MiniPhoneThumbnail brand={item.brand} />
                      <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[7px] font-black shadow-xs ${getBrandColor(item.brand)}`}>
                        {getBrandLogoLetter(item.brand)}
                      </div>
                    </div>

                    <div className="flex flex-col items-start text-right">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">الشركة: {item.brand}</span>
                    </div>
                  </div>
                  
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 px-2 py-0.5 rounded-lg font-black font-mono">
                    {item.price_range || "$999"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isGenerating && (
          <p className="text-[9.5px] mt-1.5 text-indigo-600 dark:text-indigo-400 animate-pulse font-bold mr-1">
            جاري استخلاص وفحص أبعاد الهاتف بالذكاء الاصطناعي...
          </p>
        )}
        {genStatus && (
          <p className="text-[9.5px] mt-1.5 flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-450 mr-1">
            <span>✓ {genStatus}</span>
          </p>
        )}
      </div>

      {/* Main Catalog Style Product Card */}
      <div className="flex-grow flex flex-col items-center justify-between mt-2 text-center w-full">
        {/* Phone Image at the Very Top */}
        <div className="relative w-full flex justify-center mb-2.5">
          <PhoneImage 
            phone={phone} 
            type="thumbnail" 
            className="w-28 h-32 sm:w-32 sm:h-36 object-contain bg-transparent dark:bg-transparent transition-transform duration-300 hover:scale-105" 
          />
        </div>

        {/* Phone Name, Brand, and Inline Specs Directly Below */}
        <div className="space-y-1 w-full">
          <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight min-h-[1.5rem] flex items-center justify-center px-1">
            {phone.name || "لم يتم تحديد جهاز"}
          </h4>
          
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            <span>{phone.brand || "اختر هاتفاً للمقارنة"}</span>
          </div>

          {/* Inline compact technical specifications */}
          <div className="w-full bg-slate-50/70 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-800/40 rounded-xl py-1.5 px-2 text-center text-[10.5px] sm:text-xs text-slate-600 dark:text-slate-300 font-bold mt-1">
            {ramValueText.replace(" جيجابايت RAM", "GB")} • {storageValueText.replace(" جيجابايت", "GB")} • {batteryValueText.replace(" مللي أمبير", "mAh")}
          </div>
        </div>
      </div>
    </div>
  );
}
