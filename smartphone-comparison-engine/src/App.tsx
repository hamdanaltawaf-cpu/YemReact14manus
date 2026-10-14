import { useState, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { useSmartphoneCompare } from "./hooks/useSmartphoneCompare";
import PhoneSpecForm from "./components/PhoneSpecForm";
import CompareResults from "./components/CompareResults";
import SpecsRadarChart from "./components/SpecsRadarChart";
import SpecificationMatrix from "./components/SpecificationMatrix";
import AIAdvisorChat from "./components/AIAdvisorChat";
import MultiCompareEngine from "./components/MultiCompareEngine";
import SmartSummaryCard from "./components/SmartSummaryCard";
import WinnerBanner from "./components/WinnerBanner";
import FinalScoreHero from "./components/FinalScoreHero";
import AdminPanel from "./components/AdminPanel";
import { useAuth } from "./components/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Settings, 
  HelpCircle, 
  Cpu, 
  GitCompare, 
  Layers, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Compass, 
  Info,
  ChevronLeft,
  Smartphone as PhoneIcon,
  Zap,
  Battery,
  ShieldAlert,
  Sun,
  Moon,
  Sparkles,
  Flame,
  ThumbsUp,
  Bot,
  MessageSquare
} from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdminUser } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center" dir="rtl">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user || !isAdminUser) {
    return null;
  }
  return <>{children}</>;
};

export default function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"multi" | "dual">("dual");
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [isAdvancedAnalyticsOpen, setIsAdvancedAnalyticsOpen] = useState(false);
  
  // --- ADMIN PERMISSIONS AND SIGN-IN SYSTEM ---
  const { user, loading, isAdminUser, signIn, logOut } = useAuth();
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === "/admin" || h === "#/admin" || p === "/system/admin" || h === "#/system/admin") {
        return "/admin";
      }
      return "/";
    }
    return "/";
  });

  const navigate = (path: string) => {
    if (typeof window !== "undefined") {
      if (path === "/admin" || path === "/system/admin") {
        window.location.hash = "#/admin";
      } else {
        window.location.hash = "";
        window.history.pushState(null, "", "/");
      }
    }
    setCurrentPath(path === "/system/admin" ? "/admin" : path);
  };

  // Listen to router hash changes
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      const path = (p === "/admin" || h === "#/admin" || p === "/system/admin" || h === "#/system/admin") ? "/admin" : "/";
      setCurrentPath(path);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Protect Admin route and force logout of invalid sessions
  useEffect(() => {
    if (!loading) {
      if (user && !isAdminUser) {
        const enforceSignOut = async () => {
          try {
            await logOut();
            navigate("/");
          } catch (err) {
            console.error("Enforcement logout failed:", err);
          }
        };
        enforceSignOut();
      }
    }
  }, [user, isAdminUser, loading]);

  const handleGoogleSignIn = async () => {
    try {
      const u = await signIn();
      showToast(`مرحباً! تم تسجيل الدخول بنجاح لـ ${u.email}`, "success");
    } catch (err: any) {
      console.error(err);
      showToast("تعذر استكمال تسجيل الدخول بواسطة Google. يرجى المحاولة مرة أخرى.", "error");
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      showToast("تم تسجيل الخروج بنجاح. نتمنى رؤيتك قريباً!", "success");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      showToast("حدث خطأ أثناء محاولة تسجيل الخروج.", "error");
    }
  };

  const {
    phoneA,
    setPhoneA,
    phoneB,
    setPhoneB,
    markdownResult,
    setMarkdownResult,
    analyzedAt,
    isLoading,
    errorMsg,
    setErrorMsg,
    loadingStep,
    loadingStepsText,
    battles,
    handleVote,
    handleTemplateSelect,
    handleSwapPhones,
    executeComparison,
  } = useSmartphoneCompare();

  // Splash Screen for verification loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans relative antialiased" dir="rtl">
        <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col items-center gap-4 text-center z-10 relative">
          <div className="bg-gradient-to-tr from-indigo-650 via-purple-600 to-indigo-700 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-550/20 dark:shadow-purple-550/25 ring-4 ring-indigo-500/10 animate-pulse">
            T
          </div>
          <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2">جاري التحقق من حالة الجلسة الآمنة والمصادقة مع Firebase...</p>
          <div className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="bg-indigo-600 dark:bg-indigo-400 h-full w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- END OF ADMIN STORAGE & SIGN-IN ---

  const handleScrollToCompare = () => {
    const target = document.getElementById("presets-selection-inline") || document.getElementById("phones-spec-forms-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative antialiased transition-colors duration-400 dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden" dir="rtl" id="app-root-container">
      
      {/* Absolute Dynamic Glassmorphism Background Accent Blobs */}
      <div className="absolute top-10 right-10 md:right-1/4 w-[350px] h-[350px] bg-gradient-to-tr from-indigo-555/20 to-blue-500/10 dark:from-indigo-600/15 dark:to-blue-600/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-5000"></div>
      <div className="absolute top-[35%] left-10 md:left-[15%] w-[400px] h-[400px] bg-gradient-to-br from-purple-500/15 to-pink-500/10 dark:from-purple-600/10 dark:to-pink-600/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-7000"></div>
      <div className="absolute bottom-40 right-[15%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 dark:from-emerald-600/10 dark:to-teal-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Modern Navigation Header with Glassmorphism and Mode Switcher */}
      <header className="border-b border-slate-200/80 bg-white/70 text-slate-800 dark:border-slate-850 dark:bg-slate-900/90 dark:text-white sticky top-0 z-50 px-4 sm:px-6 py-2.5 sm:py-3 shadow-sm backdrop-blur-md transition-all duration-300" id="main-navigation-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Logo T with Indigo to Purple Gradient, Rounded 2xl with glow */}
            <div className="bg-gradient-to-tr from-indigo-650 via-purple-600 to-indigo-700 w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-md shadow-indigo-600/30 dark:shadow-purple-600/30 ring-2 ring-indigo-500/10">
              T
            </div>
            <div className="text-right">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span>TechCompare Pro</span>
                <span className="text-[9px] sm:text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-md leading-none border border-indigo-100/50 dark:border-indigo-900/40">AI Powered</span>
              </h1>
            </div>
          </div>

          {/* Slim Mode Switcher with Clean Text and Admin Authentication controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={toggleTheme}
              className="px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-705 dark:bg-slate-800 dark:hover:bg-slate-705 dark:text-amber-405 dark:hover:text-amber-300 transition-all cursor-pointer flex items-center justify-center border border-slate-200/60 dark:border-slate-700 shadow-3xs scale-100 hover:scale-102 active:scale-98 text-[11px] font-bold gap-1"
              aria-label="Toggle Dark Mode"
              id="theme-mode-toggle"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="text-[10px] text-slate-550 dark:text-slate-400 font-bold hidden md:inline">
                {isDarkMode ? "الوضع المضيء" : "الوضع المظلم"}
              </span>
            </button>

            {/* Auth Section Drawer/Widget - Only visible once authorized as admin */}
            {isAdminUser && (
              <div className="flex items-center gap-2 border-r border-slate-200/60 dark:border-slate-800 pr-2 sm:pr-3" id="admin-header-widget">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* User Profile Avatar with dynamic Admin badge */}
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-750 flex items-center justify-center text-white font-black text-xs sm:text-sm border border-slate-200 dark:border-slate-800 shadow-xs select-none">
                      {(user?.email || "G").charAt(0).toUpperCase()}
                    </div>
                    <span 
                      className="absolute -top-1.5 -left-1.5 text-[9px] bg-amber-500 text-white rounded-full px-0.5 py-0.2 border border-white font-extrabold leading-none animate-bounce"
                      title="👑 مدير النظام"
                    >
                      👑
                    </span>
                  </div>

                  {/* Profile labels */}
                  <div className="flex flex-col text-right hidden sm:flex">
                    <div className="flex items-center gap-1">
                      <span className="font-sans text-[10px] sm:text-[11px] font-black text-slate-905 dark:text-white leading-none">
                        {(user?.email || "").split("@")[0]}
                      </span>
                      <span className="text-[8px] px-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded border border-amber-400/20">
                        مدير النظام
                      </span>
                    </div>
                    <span className="font-mono text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                      {user?.email}
                    </span>
                  </div>

                  {/* Admin Control Dashboard Shortcut */}
                  <button
                    onClick={() => navigate("/admin")}
                    className="px-2 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 border border-amber-400 dark:border-amber-500 shadow-3xs scale-100 hover:scale-[1.02] active:scale-95 transition-all text-right font-sans"
                    id="admin-button-header"
                  >
                    <span>⚙️ لوحة الإدارة</span>
                  </button>

                  {/* Log out Trigger */}
                  <button
                    onClick={handleSignOut}
                    className="p-1 px-1.5 sm:px-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-650 dark:bg-slate-800 dark:hover:bg-red-950/20 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer scale-100 hover:scale-102 active:scale-98 border border-slate-200/50 dark:border-slate-700 shadow-3xs text-[10px] sm:text-[10.5px] font-bold"
                    title="تسجيل الخروج من الحساب الحالي"
                    id="btn-sign-out"
                  >
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-6 w-full space-y-4 sm:space-y-6 relative z-10" id="main-content-layout">
        {currentPath === "/admin" ? (
          loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center select-none font-sans" dir="rtl">
              <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2">جاري التحقق من حالة الجلسة والمصادقة مع Firebase...</p>
            </div>
          ) : !user ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 px-4 min-h-[50vh] select-none"
              key="admin-login-view"
              dir="rtl"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
                <h3 className="text-xl font-black text-slate-905 dark:text-white mb-6 font-sans">
                  لوحة الإدارة
                </h3>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 bg-indigo-650 hover:bg-indigo-600 active:scale-98 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="font-sans">تسجيل الدخول</span>
                </button>
              </div>
            </motion.div>
          ) : !isAdminUser ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4 select-none font-sans" dir="rtl">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-2" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">غير مصرح لك بالدخول</h3>
              <p className="text-xs text-slate-505 max-w-xs mt-1">عذراً، هذا الحساب ليس لديه صلاحيات الإشراف.</p>
              <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-indigo-650 text-white rounded-lg text-xs font-black cursor-pointer">
                العودة للرئيسية
              </button>
            </div>
          ) : (
            <AdminRoute>
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="animate-fade-in"
                key="admin-layout-panel"
              >
                <AdminPanel userEmail={user?.email || ""} onBack={() => navigate("/")} />
              </motion.div>
            </AdminRoute>
          )
        ) : (
          <>
            {/* Unified Premium SaaS Hero Section */}
            <section 
          className="relative text-center max-w-3xl mx-auto rounded-3xl p-3 sm:p-4.5 overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-md bg-gradient-to-br from-indigo-50/20 via-violet-50/10 to-white/10 dark:from-indigo-950/15 dark:via-violet-950/10 dark:to-slate-950/40 backdrop-blur-md"
          id="welcome-pitch"
        >
          {/* الطبقة الأولى: الشعار، شارة AI Powered، وحالة النظام */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3 border-b border-slate-200/45 dark:border-white/5 pb-2">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">🚀 TechCompare Pro</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold rounded">AI Powered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">حالة النظام: Live</span>
            </div>
          </div>

          {/* الطبقة الثانية: العنوان القوي والوصف القصير */}
          <div className="my-2.5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              مقارنة الهواتف بالذكاء الاصطناعي
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm mt-1">
              تحليل فوري للمواصفات والأداء والكاميرات والبطارية
            </p>
          </div>

          {/* الطبقة الثالثة: شريط إحصائيات أفقي صغير */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 py-1.5 my-3 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1">
              <span>📱</span>
              <span>+5000 هاتف</span>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">|</div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>مقارنة خلال ثوانٍ</span>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">|</div>
            <div className="flex items-center gap-1">
              <span>🧠</span>
              <span>تحليل ذكي</span>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">|</div>
            <div className="flex items-center gap-1">
              <span>🎯</span>
              <span>نتائج دقيقة</span>
            </div>
          </div>

          {/* Hero CTA button */}
          <div className="pt-1">
            <button
              onClick={handleScrollToCompare}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <span>🚀 ابدأ المقارنة</span>
            </button>
          </div>
        </section>

        {viewMode === "multi" ? (
          <div className="space-y-6">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setViewMode("dual")}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/40 dark:bg-emerald-950/40 dark:text-emerald-350 dark:border-emerald-900 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <span>← العودة لمواجهة الهاتفين (1 VS 1)</span>
              </button>
            </div>
            <MultiCompareEngine />
          </div>
        ) : (
          <>
            {/* 1. Interactive Control Panel with presets & Multi-Compare Trigger */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm" id="presets-selection-inline">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-505 ml-1">مواجهات فائقة السرعة 🔥:</span>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect(0)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] sm:text-[11px] font-black text-slate-705 dark:text-slate-350 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200/40 dark:border-slate-800 transition-all cursor-pointer hover:border-indigo-500/50"
                  id="preset-pills-0"
                >
                  🏆 صراع العمالقة
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect(1)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] sm:text-[11px] font-black text-slate-705 dark:text-slate-350 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200/40 dark:border-slate-800 transition-all cursor-pointer hover:border-indigo-500/50"
                  id="preset-pills-1"
                >
                  💸 صفقة الفئة المتوسطة
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect(2)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] sm:text-[11px] font-black text-slate-705 dark:text-slate-350 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200/40 dark:border-slate-800 transition-all cursor-pointer hover:border-indigo-500/50"
                  id="preset-pills-2"
                >
                  🎮 وحوش الألعاب والأداء
                </button>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleSwapPhones}
                  type="button"
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-slate-800 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  id="btn-swap-position"
                  title="تبديل أماكن الهواتف"
                >
                  <GitCompare className="w-3.5 h-3.5 rotate-90 text-indigo-500" />
                  <span>تبديل الجهات ⇅</span>
                </button>

                <button
                  onClick={() => setViewMode("multi")}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/40 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  id="btn-trigger-multi-compare"
                >
                  <span>+ مقارنة أجهزة متعددة 📱</span>
                </button>
              </div>
            </section>

            {/* 2. Side-by-Side Specifications Panel - Structured specifically to align with the matrix below */}
            <section className="w-full" id="phones-spec-forms-section">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3 items-stretch">
                {/* Smartphone A */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.002 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="col-span-1 sm:col-span-5 h-full"
                >
                  <PhoneSpecForm
                    id="A"
                    title="الهاتف الأول (A)"
                  />
                </motion.div>

                {/* Central VS connector - fits perfectly matching the category badges in the matrix below */}
                <div className="hidden sm:flex sm:col-span-2 flex-col items-center justify-center text-center self-center h-full">
                  <div className="bg-gradient-to-tr from-indigo-600 to-indigo-505 dark:from-indigo-600 dark:to-indigo-505 w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[11px] shadow-sm z-10 select-none">
                    VS
                  </div>
                </div>

                {/* Smartphone B */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.002 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="col-span-1 sm:col-span-5 h-full"
                >
                  <PhoneSpecForm
                    id="B"
                    title="الهاتف الثاني (B)"
                  />
                </motion.div>
              </div>
            </section>

            {/* ACTION PANEL: Glow Run Comparison Button */}
            <section className="flex flex-col items-center justify-center py-4 sm:py-6 text-center" id="run-comparison-action-panel">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={executeComparison}
                disabled={isLoading}
                className={`cursor-pointer px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base md:text-md flex items-center justify-center gap-2.5 sm:gap-3 transition-shadow relative overflow-hidden shadow-xl ${
                  isLoading 
                    ? "bg-slate-200 text-slate-400 border border-slate-300 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800 pointer-events-none"
                    : "bg-gradient-to-r from-indigo-650 to-indigo-600 hover:from-indigo-700 hover:to-indigo-650 text-white shadow-lg shadow-indigo-500/10 dark:shadow-indigo-950/30"
                }`}
                id="btn-execute-comparison"
              >
                {isLoading ? (
                  <Cpu className="w-5 h-5 sm:w-5.5 sm:h-5.5 animate-spin text-slate-400" />
                ) : (
                  <GitCompare className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                )}
                <span>أطلق مقارنة ومراجعة الذكاء الاصطناعي الفورية</span>
              </motion.button>

              {/* Loading Micro-States */}
              {isLoading && (
                <div className="mt-6 space-y-3 max-w-md mx-auto" id="loading-spinner-wrapper">
                  <div className="flex items-center justify-center gap-2">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping duration-1000"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">الذكاء الاصطناعي يفكر ويصهر المراجعة...</span>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="w-72 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto border border-slate-300/40 dark:border-slate-705/30 shadow-inner">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-505 h-full transition-all duration-1000"
                      style={{ width: `${((loadingStep + 1) / loadingStepsText.length) * 100}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-extrabold animate-pulse font-sans">
                    {loadingStepsText[loadingStep]}
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-2xl max-w-xl mx-auto flex items-start gap-2.5 text-right text-xs text-red-800 dark:text-red-300" id="error-message-box">
                  <ShieldAlert size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-950 dark:text-red-200 block mb-1">فشل بدء التحليل الفني:</span>
                    <span>تعذر تنفيذ التحليل الذكي حالياً، يرجى المحاولة لاحقاً.</span>
                  </div>
                </div>
              )}
            </section>

            {/* 4. Comparison Results Segment (Sections 1.5 to 5) */}
            {markdownResult && (
              <div className="space-y-6 mt-8">
                
                {/* 1. 🏆 النتيجة النهائية (Final Score Hero) */}
                <FinalScoreHero phoneA={phoneA} phoneB={phoneB} />

                {/* 2. 📋 مصفوفة المواصفات */}
                <div className="animate-fade-in" id="section-specifications-comparison">
                  <SpecificationMatrix phoneA={phoneA} phoneB={phoneB} />
                </div>

                {/* 3. 📝 الخلاصة السريعة والذكية */}
                <div className="animate-fade-in space-y-6" id="section-winner">
                  {/* Winner Hero Banner */}
                  <WinnerBanner phoneA={phoneA} phoneB={phoneB} />

                  {/* Mathematical Performance, Battery, Camera and Value highlights */}
                  <SmartSummaryCard phones={[phoneA, phoneB]} />
                </div>

                {/* 4. 📊 التحليلات التقنية المتقدمة والرسوم البيانية (اختياري) */}
                <div className="animate-fade-in space-y-4" id="section-advanced-analytics">
                  <button
                    onClick={() => setIsAdvancedAnalyticsOpen(!isAdvancedAnalyticsOpen)}
                    className="w-full py-4 px-5 rounded-3xl bg-slate-100 hover:bg-slate-205/85 dark:bg-slate-900/50 dark:hover:bg-slate-900/70 border border-slate-205 dark:border-white/5 flex items-center justify-between transition-all font-black text-slate-900 dark:text-white group cursor-pointer shadow-sm text-xs sm:text-sm"
                    id="toggle-advanced-analytics-btn"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="text-indigo-650 dark:text-indigo-400 w-4 h-4 shrink-0" />
                      <span>التحليلات التقنية المتقدمة والرسوم البيانية (اختياري) 📊</span>
                    </div>
                    <span className="text-slate-405 dark:text-slate-450 group-hover:text-slate-600 dark:group-hover:text-slate-350 transition-colors text-xs">
                      {isAdvancedAnalyticsOpen ? "▲ إخفاء التحليلات التقنية المتقدمة" : "▼ عرض التحليلات التقنية المتقدمة"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isAdvancedAnalyticsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="overflow-hidden space-y-6 pt-2"
                        id="advanced-analytics-accordian-content"
                      >
                        {/* Dynamic Spec Radar & Battery Charts inside a unified Tab layout */}
                        <SpecsRadarChart phoneA={phoneA} phoneB={phoneB} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 5. 🔬 بطاقات التفصيل والمقارنة الفنية */}
                <div className="animate-fade-in space-y-6" id="section-ai-analysis">
                  {/* AI Detailed Analysis Comparison */}
                  <CompareResults 
                    markdown={markdownResult} 
                    analyzedAt={analyzedAt}
                    phoneAName={phoneA.name}
                    phoneBName={phoneB.name}
                    phoneA={phoneA}
                    phoneB={phoneB}
                  />
                </div>

              </div>
            )}
          </>
        )}
          </>
        )}

      </main>

      {/* Floating Action FAB for AI Technical Advisor */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center justify-center">
        {/* Ambient background pulsing glow (light-source depth) to prevent blending in Light Mode */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/25 dark:bg-indigo-500/15 blur-md animate-pulse -z-10 scale-110" />
        <div className="absolute inset-0 rounded-full border border-indigo-500/30 dark:border-indigo-500/15 scale-125 animate-ping [animation-duration:3.5s] -z-10" />
        
        <button
          onClick={() => setShowAiAdvisor(true)}
          className="bg-gradient-to-tr from-indigo-700/95 via-indigo-650/90 to-indigo-600/95 hover:from-indigo-650 hover:to-indigo-550 dark:from-indigo-600 dark:to-indigo-500 text-white rounded-full p-3 sm:p-4 shadow-[0_8px_32px_rgba(79,70,229,0.35)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-indigo-400/35 hover:border-indigo-300 dark:border-white/10 flex items-center gap-1.5 sm:gap-2.5 font-sans font-black text-[10px] sm:text-xs transition-all duration-300 transform scale-100 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md group"
          id="btn-toggle-ai-advisor-fab"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap block">
            اسأل المستشار التقني الذكي 💬
          </span>
        </button>
      </div>

      {/* Expandable Side Drawer for AI Advisor Chat */}
      <AnimatePresence>
        {showAiAdvisor && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiAdvisor(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 cursor-pointer"
              id="ai-advisor-drawer-backdrop"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl z-50 p-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full text-right"
              id="ai-advisor-drawer-panel"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setShowAiAdvisor(false)}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-sans"
                >
                  إغلاق ✕
                </button>
                <div className="text-right">
                  <span className="text-xs text-indigo-650 dark:text-indigo-400 font-black block font-sans">المستشار الفني النشط</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIAdvisorChat />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern footer with glass elements */}
      <footer className="border-t border-slate-200 dark:border-slate-850/60 bg-white/50 dark:bg-slate-900/60 py-5 sm:py-8 px-4 sm:px-6 text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-12 sm:mt-20 shadow-inner backdrop-blur-md" id="footer-branding">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans font-medium">
            جميع حقوق المواد محفوظة لموقع المراجعات التقنية والمقارنات الرقمية الخبيرة © 2026
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9.5px] sm:text-[10.5px]">عينة المقارنة: JSON (Input-Format)</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-505 dark:text-slate-350 font-bold select-none text-[10px] sm:text-xs">تنبع المراجعات الفنية من الحقائق البحتة والشفافية التقنية</span>
          </div>
        </div>
      </footer>



      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-55 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-black tracking-tight"
            style={{
              backgroundColor: toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : "#3B82F6",
              color: "#FFFFFF",
              borderColor: toast.type === "success" ? "#047857" : toast.type === "error" ? "#B91C1C" : "#1D4ED8",
            }}
          >
            <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
            <span className="font-sans font-black">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
