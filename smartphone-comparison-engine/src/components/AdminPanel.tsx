import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "../utils/apiFetch";
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Settings, 
  Activity, 
  Download, 
  ArrowRight, 
  Save, 
  RefreshCw, 
  Cpu, 
  ShieldAlert, 
  Database,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wifi,
  Layers,
  Search,
  Building2,
  Users,
  CloudLightning,
  RotateCcw,
  History,
  UserPlus,
  UserMinus,
  Flame,
  TrendingUp,
  Sparkles,
  Upload,
  Filter
} from "lucide-react";
// Admin sub-components
import { DatabaseStatsCard } from './admin/DatabaseStatsCard';
import { ImportEngineStatus } from './admin/ImportEngineStatus';
import { LastSyncCard } from './admin/LastSyncCard';
import { ActivityLog } from './admin/ActivityLog';
import { SystemHealthCard } from './admin/SystemHealthCard';
import { SmartSyncButton } from './admin/SmartSyncButton';
import { DatabaseStatusTopBar } from './admin/DatabaseStatusTopBar';
import DataQualityCenter from './admin/DataQualityCenter';
import { AdvancedFilters } from './admin/AdvancedFilters';
import { ActiveFilterChips } from './admin/ActiveFilterChips';

interface PhoneSpec {
  name: string;
  brand: string;
  screen: string;
  processor: string;
  camera: string;
  battery: string;
  charging: string;
  storage: string;
  price_range: string;
  other_specs: string;
  // Premium Fields
  releaseYear?: string;
  gpu?: string;
  os?: string;
  antutu?: string;
  geekbench?: string;
  weight?: string;
  dimensions?: string;
  water_resistance?: string;
  fingerprint?: string;
  has5g?: boolean;
  thumbnail?: string;
}

interface AdminPanelProps {
  userEmail: string;
  onBack: () => void;
}

export default function AdminPanel({ userEmail, onBack }: AdminPanelProps) {
  // Tabs Navigation
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "catalog" | "add" | "ai_import" | "perf" | "logs" | "admins"
  >("dashboard");
  const [catalogSubTab, setCatalogSubTab] = useState<"phones" | "brands">("phones");

  // Core Lists States
  const [phones, setPhones] = useState<PhoneSpec[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ brand: "all", sortBy: "newest" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const [selectedPhoneNames, setSelectedPhoneNames] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [bulkModal, setBulkModal] = useState<{
    isOpen: boolean;
    type: "change_status" | "add_tags" | "remove_tags" | "reindex" | null;
    payload?: any;
  }>({ isOpen: false, type: null });
  const [bulkTagInput, setBulkTagInput] = useState("");

  // Stats & Performance States
  const [adminStats, setAdminStats] = useState<any>(null);
  const [perfStats, setPerfStats] = useState<any>(null);

  // Gemini parameters State
  const [currentModel, setCurrentModel] = useState("gemini-3.6-flash");
  const [currentTemp, setCurrentTemp] = useState(0.15);

  // Brand Management States
  const [brands, setBrands] = useState<any[]>([]);
  const [brandForm, setBrandForm] = useState({ name: "", logoEmoji: "📱", originCountry: "غير متوفر" });
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // Supervisors States
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Timeline Logs States
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // AI Import state
  const [aiImportName, setAiImportName] = useState("");
  const [aiImportLoading, setAiImportLoading] = useState(false);
  const [aiImportSpecs, setAiImportSpecs] = useState<any | null>(null);
  const [autoImportLoading, setAutoImportLoading] = useState(false);
  const [latestPhones, setLatestPhones] = useState<any[]>([]);
  const [brandImportLoading, setBrandImportLoading] = useState(false);
  const [sourceStatuses, setSourceStatuses] = useState<any[]>([]);
  const [importLogs, setImportLogs] = useState<any[]>([]);
  const [smartSyncLoading, setSmartSyncLoading] = useState(false);
  const [smartSyncReport, setSmartSyncReport] = useState<any | null>(null);

  // Global Catalog Builder states
  const [globalCatalogStatus, setGlobalCatalogStatus] = useState<any>(null);
  const [catalogBuilderLoading, setCatalogBuilderLoading] = useState(false);

  // Backups states
  const [backupFile, setBackupFile] = useState<File | null>(null);



  // Loaders
  const loadPhones = async () => {
    setIsLoading(true);
    try {
      let url = "/api/phones";
      
      const hasAdvancedFilters = Object.entries(filters).some(([k, v]) => k !== 'sortBy' && v !== "all" && v !== "" && v !== undefined && v !== null);

      if (debouncedSearchQuery || filters.sortBy || hasAdvancedFilters) {
        const params = new URLSearchParams();
        if (debouncedSearchQuery) params.append("q", debouncedSearchQuery);
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "all" && value !== "" && value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        
        url = `/api/phones/search?${params.toString()}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      const items = data.phones || data.results?.map((r: any) => r.phone) || [];
      if (data.success || data.results) {
        setPhones(items);
      }
    } catch (err) {
      console.error("Failed to load smartphones catalog", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await apiFetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setAdminStats(data.stats);
        setCurrentModel(data.stats.geminiModel);
        setCurrentTemp(data.stats.geminiTemp);
      }
    } catch (err) {
      console.error("Failed to load admin stats", err);
    }
  };

  const loadPerformance = async () => {
    try {
      const res = await apiFetch("/api/admin/perf");
      const data = await res.json();
      if (data.success) {
        setPerfStats(data.performance);
      }
    } catch (err) {
      console.error("Failed to load performance metrics", err);
    }
  };

  const loadBrands = async () => {
    try {
      const res = await apiFetch("/api/admin/brands");
      const data = await res.json();
      if (data.success && Array.isArray(data.brands)) {
        setBrands(data.brands);
      }
    } catch (err) {
      console.error("Failed to load brands list", err);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await apiFetch("/api/admin/admins");
      const data = await res.json();
      if (data.success && Array.isArray(data.admins)) {
        setAdminsList(data.admins);
      }
    } catch (err) {
      console.error("Failed to load supervisors list", err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await apiFetch("/api/admin/logs");
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setActivityLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load timeline activity logs", err);
    }
  };

  const loadImportEngineData = async () => {
    try {
      const statusRes = await apiFetch("/api/admin/import/sources-status");
      const statusData = await statusRes.json();
      if (statusData.success) {
        setSourceStatuses(statusData.statuses || []);
      }
      
      const logsRes = await apiFetch("/api/admin/import/logs");
      const logsData = await logsRes.json();
      if (logsData.success) {
        setImportLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error("Error loading import engine metrics:", err);
    }
  };

  useEffect(() => {
    if (!userEmail) return;
    loadStats();
    loadPerformance();
    loadBrands();
    loadAdmins();
    loadLogs();
    loadImportEngineData();
  }, [userEmail]);

  useEffect(() => {
    loadPhones();
  }, [debouncedSearchQuery, filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleShowNotification = (type: "success" | "error" | "info", text: string) => {
    setActionStatus({ type, text });
    setTimeout(() => {
      setActionStatus(null);
    }, 4500);
  };



  // Handle Bulk Actions for Phones
  const handleBulkAction = async (action: string, payload?: any) => {
    if (selectedPhoneNames.length === 0) return;
    
    if (action === "export") {
      const format = payload.format;
      const dataToExport = phones.filter(p => selectedPhoneNames.includes(p.name));
      if (format === "json") {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const anchor = document.createElement("a");
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", `export-${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        handleShowNotification("success", "تم تصدير الأجهزة المحددة بنجاح.");
      } else if (format === "csv") {
        if (dataToExport.length === 0) return;
        const headers = Object.keys(dataToExport[0]).join(",");
        const rows = dataToExport.map(obj => Object.values(obj).map(val => `"${val}"`).join(",")).join("\n");
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + "\n" + rows);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", `export-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        handleShowNotification("success", "تم تصدير الأجهزة المحددة بنجاح.");
      }
      return;
    }

    setIsBulkActionLoading(true);
    try {
      const res = await apiFetch("/api/admin/phones/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          phoneNames: selectedPhoneNames,
          payload
        })
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", data.message || "تم تنفيذ العملية بنجاح.");
        loadPhones();
        loadStats();
        setBulkModal({ isOpen: false, type: null });
        setBulkTagInput("");
      } else {
        handleShowNotification("error", data.error || "فشل تنفيذ العملية.");
      }
    } catch (err) {
      handleShowNotification("error", "فشل الاتصال بالخادم أثناء تنفيذ العملية.");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Delete smartphone item
  const handleDeletePhone = async (phoneName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الهاتف "${phoneName}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/admin/phones/${encodeURIComponent(phoneName)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم حذف الهاتف بنجاح وإخلاء روابطه.");
        loadPhones();
        loadStats();
        loadPerformance();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "فشل حذف الهاتف.");
      }
    } catch (err) {
      handleShowNotification("error", "حدث عطل أثناء الارتباط بعملية الحذف.");
    }
  };

  // Fetch Global Catalog Status
  const fetchGlobalCatalogStatus = async (abortController?: AbortController) => {
    try {
      const res = await apiFetch("/api/admin/import/global-catalog/status", {
        signal: abortController?.signal
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          console.warn("[Admin Poller] Access denied (403).");
          return false;
        }
        return true;
      }
      
      const data = await res.json();
      setGlobalCatalogStatus(data);
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') return true;
      // Only log non-abort errors quietly as debug to avoid console spam
      console.debug("[Global Catalog Status Poller] Network or parsing error:", err.message);
      return true;
    }
  };

  // Start Global Catalog Build
  const handleStartGlobalCatalogBuild = async () => {
    setCatalogBuilderLoading(true);
    try {
      const res = await apiFetch("/api/admin/import/global-catalog/start", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "🚀 بدأت عملية بناء الكتالوج العالمي الكلي في الخلفية بنجاح!");
        await fetchGlobalCatalogStatus();
      } else {
        throw new Error(data.error || "فشل بدء العملية");
      }
    } catch (err: any) {
      handleShowNotification("error", err.message || "فشل بدء استيراد الكتالوج العالمي.");
    } finally {
      setCatalogBuilderLoading(false);
    }
  };

  // Stop Global Catalog Build
  const handleStopGlobalCatalogBuild = async () => {
    try {
      const res = await apiFetch("/api/admin/import/global-catalog/stop", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        handleShowNotification("info", "⏹️ تم إيقاف عملية بناء الكتالوج مؤقتاً.");
        await fetchGlobalCatalogStatus();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      handleShowNotification("error", err.message || "فشل إيقاف العملية.");
    }
  };

  // Resume Global Catalog Build
  const handleResumeGlobalCatalogBuild = async () => {
    try {
      const res = await apiFetch("/api/admin/import/global-catalog/resume", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "▶️ تم استئناف عملية بناء الكتالوج.");
        await fetchGlobalCatalogStatus();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      handleShowNotification("error", err.message || "فشل استئناف العملية.");
    }
  };

  // Poller effect for Catalog Builder - Optimized to poll only when relevant tab is active
  useEffect(() => {
    if (activeTab !== "ai_import") {
      // Clear status if we leave the tab to ensure fresh state next time
      setGlobalCatalogStatus(null);
      return;
    }
    
    let isMounted = true;
    const abortController = new AbortController();
    let timer: any = null;

    const poll = async () => {
      const shouldContinue = await fetchGlobalCatalogStatus(abortController);
      if (shouldContinue && isMounted && activeTab === "ai_import") {
        timer = setTimeout(poll, 4000); // 4 second interval is plenty for background status
      }
    };

    poll();

    return () => {
      isMounted = false;
      abortController.abort();
      if (timer) clearTimeout(timer);
    };
  }, [activeTab]);

  // Fetch latest phones
  const handleFetchLatestPhones = async () => {
    setAutoImportLoading(true);
    try {
      const res = await apiFetch("/api/admin/import/latest-phones");
      if (!res.ok) {
        throw new Error(`API Error ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error("Non-JSON response returned from /api/admin/import/latest-phones:", textResponse);
        throw new Error(`تنسيق الاستجابة غير صحيح: expected JSON but received '${contentType || "unknown"}'. الرجوع إلى الـ Console للمزيد من التفاصيل.`);
      }
      const data = await res.json();
      if (data.success) {
        setLatestPhones(data.phones || []);
        loadPhones();
        
        const scannedCount = data.scanned !== undefined ? data.scanned : 0;
        const addedCount = data.added !== undefined ? data.added : 0;
        const skippedCount = data.skipped !== undefined ? data.skipped : 0;

        if (addedCount > 0) {
          const reportMessage = `🎉 عملية استيراد ناجحة ومكتملة!\n` +
                                `✅ تم فحص ${scannedCount} هاتفاً بالكامل\n` +
                                `➕ تمت إضافة ${addedCount} هاتفاً جديداً بنجاح لقاعدة البيانات\n` +
                                `⏭ تم تخطي ${skippedCount} هاتفاً موجوداً مسبقاً لحماية البيانات من التكرار.`;
          handleShowNotification("success", reportMessage);
        } else {
          const reportMessage = `ℹ️ قاعدة البيانات محدثة بالكامل!\n` +
                                `✅ تم فحص ${scannedCount} هاتفاً\n` +
                                `⏭ تم تخطي جميع الهواتف الـ ${skippedCount} لأنها مسجلة ومحفوظة مسبقاً بدقة واحترافية.`;
          handleShowNotification("info", reportMessage);
        }
        loadImportEngineData();
      } else {
        handleShowNotification("error", data.error || "فشل جلب الهواتف.");
      }
    } catch (err: any) {
      handleShowNotification("error", err.message || "خطأ في الاتصال.");
    } finally {
      setAutoImportLoading(false);
    }
  };

  // Add selected phones
  const handleAddSelectedPhones = async (selectedPhones: any[]) => {
    // Implement adding selected phones
    handleShowNotification("success", `تمت إضافة ${selectedPhones.length} هاتف.`);
  };

  // Fetch and sync brands
  const handleImportBrands = async () => {
    setBrandImportLoading(true);
    try {
      const res = await apiFetch("/api/admin/import/brands", {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error(`API Error ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error("Non-JSON response returned from /api/admin/import/brands:", textResponse);
        throw new Error(`تنسيق الاستجابة غير صحيح: expected JSON but received '${contentType || "unknown"}'. الرجوع إلى الـ Console للمزيد من التفاصيل.`);
      }
      const data = await res.json();
      if (data.success) {
        const scannedCount = data.scanned !== undefined ? data.scanned : 0;
        const addedCount = data.added !== undefined ? data.added : 0;
        const skippedCount = data.skipped !== undefined ? data.skipped : 0;

        const reportMessage = `✅ تم فحص ${scannedCount} علامة تجارية\n` +
                              `➕ تمت إضافة ${addedCount} شركة جديدة ثريّة البيانات\n` +
                              `⏭ تم تخطي ${skippedCount} شركة موجودة مسبقاً بالتزامن`;

        handleShowNotification("success", reportMessage);
        loadBrands();
        loadImportEngineData();
      } else {
        handleShowNotification("error", data.error || "فشل جلب الشركات.");
      }
    } catch (err: any) {
      handleShowNotification("error", err.message || "خطأ في الاتصال.");
    } finally {
      setBrandImportLoading(false);
    }
  };

  // Automated smart orchestrator sync sequence
  const handleSmartSync = async () => {
    setSmartSyncLoading(true);
    setSmartSyncReport(null);
    const startTime = Date.now();
    try {
      handleShowNotification("success", "🔄 البدء بالمرحلة 1: تحديث ومزامنة العلامات التجارية...");
      
      // Phase 1: Import Brands
      const brandsRes = await apiFetch("/api/admin/import/brands", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        }
      });
      const brandsData = await brandsRes.json();
      const brandsAdded = (brandsData.success && brandsData.added) ? brandsData.added : 0;
      
      handleShowNotification("success", "🔄 البدء بالمرحلة 2: مزامنة واستيراد أحدث الهواتف من المصادر الحية...");

      // Phase 2: Import Latest Phones
      const phonesRes = await apiFetch("/api/admin/import/latest-phones");
      const phonesData = await phonesRes.json();
      const phonesScanned = (phonesData.success && phonesData.scanned) ? phonesData.scanned : 0;
      const phonesAdded = (phonesData.success && phonesData.added) ? phonesData.added : 0;
      const phonesSkipped = (phonesData.success && phonesData.skipped) ? phonesData.skipped : 0;

      handleShowNotification("success", "🔄 البدء بالمرحلة 3: تحديث الكاش وإعادة بناء الكتالوج...");

      // Phase 3: Refresh Cache & Load Fresh Lists
      await apiFetch("/api/admin/cache/reload", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        }
      });

      // Reload fresh state directly to reflect changes in UI
      await loadPhones();
      await loadBrands();
      await loadStats();
      await loadLogs();
      await loadImportEngineData();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      setSmartSyncReport({
        brandsAdded,
        phonesAdded,
        phonesUpdated: (phonesScanned - phonesAdded - phonesSkipped > 0) ? (phonesScanned - phonesAdded - phonesSkipped) : 0,
        skipped: phonesSkipped,
        duration
      });

      handleShowNotification("success", "✅ اكتملت المزامنة الذكية المتكاملة وحفظت الملفات بنجاح!");
    } catch (err: any) {
      console.error(err);
      handleShowNotification("error", "فشلت المزامنة الذكية: " + err.message);
    } finally {
      setSmartSyncLoading(false);
    }
  };

  // AI Import Spec Auto Builder
  const handleAiSpecsRetrieve = async () => {
    if (!aiImportName.trim()) {
      handleShowNotification("error", "يرجى كتابة اسم الهاتف بالكامل.");
      return;
    }
    setAiImportLoading(true);
    setAiImportSpecs(null);
    try {
      const res = await apiFetch("/api/admin/ai-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: aiImportName })
      });
      const data = await res.json();
      if (data.success && data.specs) {
        setAiImportSpecs(data.specs);
        handleShowNotification("success", "تم بناء المواصفات الذكية بنجاح! راجعها بالأسفل.");
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "فشل الحصول على الاستجابة من الذكاء الاصطناعي.");
      }
    } catch (err) {
      handleShowNotification("error", "حدث خطأ غير متوقع أثناء توليد المواصفات.");
    } finally {
      setAiImportLoading(false);
    }
  };

  // Quick Direct Save AI Specs Into Database
  const handleSaveAiSpecsDirectly = async () => {
    if (!aiImportSpecs) return;
    try {
      const payload = {
        name: aiImportSpecs.name,
        brand: aiImportSpecs.brand,
        screen: aiImportSpecs.screen || "",
        processor: aiImportSpecs.processor || "",
        camera: aiImportSpecs.camera || "",
        battery: aiImportSpecs.battery || "",
        charging: aiImportSpecs.charging || "",
        storage: aiImportSpecs.storage || "",
        price_range: aiImportSpecs.price_range || "",
        other_specs: aiImportSpecs.other_specs || "",
        releaseYear: aiImportSpecs.releaseYear || "",
        gpu: aiImportSpecs.gpu || "",
        os: aiImportSpecs.os || "",
        antutu: aiImportSpecs.antutu || "",
        geekbench: aiImportSpecs.geekbench || "",
        weight: aiImportSpecs.weight || "",
        dimensions: aiImportSpecs.dimensions || "",
        water_resistance: aiImportSpecs.water_resistance || "",
        fingerprint: aiImportSpecs.fingerprint || "",
        has5g: !!aiImportSpecs.has5g,
        thumbnail: aiImportSpecs.thumbnail || ""
      };
      const res = await apiFetch("/api/admin/phones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم حفظ وتثبيت مواصفات الهاتف الذكي بنجاح!");
        setAiImportSpecs(null);
        setActiveTab("catalog");
        loadPhones();
        loadStats();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "فشل حفظ مواصفات الهاتف.");
      }
    } catch (err) {
      handleShowNotification("error", "تعذر حفظ البيانات في قاعدة البيانات.");
    }
  };

  // Brand Form Actions
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name) {
      handleShowNotification("error", "اسم الشركة المصنعة مطلوب.");
      return;
    }

    const url = editingBrandId ? `/api/admin/brands/${editingBrandId}` : "/api/admin/brands";
    const method = editingBrandId ? "PUT" : "POST";

    try {
      const res = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(brandForm)
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", data.message || "تم تسجيل العلامة بنجاح.");
        setBrandForm({ name: "", logoEmoji: "📱", originCountry: "غير متوفر" });
        setEditingBrandId(null);
        loadBrands();
        loadStats();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "فشل تسجيل العلامة.");
      }
    } catch (err) {
      handleShowNotification("error", "فشل الاتصال بالواجهة الخلفية لإدارة الشركات.");
    }
  };

  const handleStartEditBrand = (b: any) => {
    setBrandForm({
      name: b.name,
      logoEmoji: b.logoEmoji || "📱",
      originCountry: b.originCountry || "غير متوفر"
    });
    setEditingBrandId(b.id);
  };

  const handleDeleteBrand = async (brandId: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف شركة "${name}"؟ قد يؤثر الحذف على ربط هواتف الكاتالوج.`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/brands/${brandId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم حذف الشركة بنجاح.");
        loadBrands();
        loadStats();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "فشل حذف الشركة.");
      }
    } catch (err) {
      handleShowNotification("error", "عطل أثناء الربط بحذف الشركة.");
    }
  };

  // Supervisor invites and revokes
  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) {
      handleShowNotification("error", "يرجى كتابة بريد إلكتروني صالح.");
      return;
    }
    try {
      const res = await apiFetch("/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: newAdminEmail })
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", data.message || "تم ترخيص المشرف الجديد بنجاح.");
        setNewAdminEmail("");
        loadAdmins();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "فشل إضافة حساب المشرف.");
      }
    } catch (err) {
      handleShowNotification("error", "حدث عطل غير متوقع أثناء الترخيص.");
    }
  };

  const handleRevokeAdmin = async (email: string) => {
    if (email === "hamdanaltawaf@gmail.com") return;
    if (!window.confirm(`هل أنت متأكد من سحب صلاحية المشرف من الحساب "${email}"؟`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/admins/${encodeURIComponent(email)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم إلغاء ترخيص المشرف بنجاح وسحب الصلاحية.");
        loadAdmins();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "تعذر إلغاء المشرف.");
      }
    } catch (err) {
      handleShowNotification("error", "تعذر الاتصال بـ API الإدارة.");
    }
  };

  // Gemini model selection parameters save
  const handleSaveGeminiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/admin/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: currentModel, temperature: currentTemp })
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم حفظ وتطبيق معايير محرك Gemini بنجاح على الخادم.");
        loadStats();
        loadLogs();
      } else {
        handleShowNotification("error", data.error || "تعذر حفظ إعدادات Gemini.");
      }
    } catch (err) {
      handleShowNotification("error", "تعذر الارتباط بإعدادات الخادم.");
    }
  };

  // Evacuate Cache memory
  const handleClearServerCache = async () => {
    try {
      const res = await apiFetch("/api/admin/cache/clear", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم مسح وتفريغ جميع ذواكر الكاش المؤقتة بنجاح!");
        loadStats();
        loadPerformance();
        loadLogs();
      }
    } catch (err) {
      handleShowNotification("error", "عطل أثناء تصفية الكاش.");
    }
  };

  // Re-seed Database to baseline
  const handleReloadDefaultIndices = async () => {
    if (!window.confirm("تحذير: سيتم إعادة تسوية قاعدة البيانات وتنزيل الهواتف الافتراضية مع مسح أي إضافات مخصصة! هل تود المتابعة؟")) {
      return;
    }
    try {
      const res = await apiFetch("/api/admin/cache/reload", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        handleShowNotification("success", "تم تصفير وإعادة تعيين قاعدة البيانات للجداول الافتراضية بنجاح!");
        loadPhones();
        loadStats();
        loadPerformance();
        loadBrands();
        loadLogs();
      }
    } catch (err) {
      handleShowNotification("error", "عطل أثناء تصفير الجداول.");
    }
  };

  // JSON Database export Anchor download
  const handleBackupExport = async () => {
    try {
      const res = await apiFetch("/api/admin/export");
      const data = await res.json();
      if (data.success && data.database) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.database, null, 2));
        const anchor = document.createElement("a");
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", `gsmarena-backup-${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        handleShowNotification("success", "تم حفظ وتصدير ملف السجل الموحد كنسخة احتياطية JSON بنجاح!");
        loadLogs();
      }
    } catch (err) {
      handleShowNotification("error", "تعذر تصدير النسخة الاحتياطية.");
    }
  };

  // Upload and restore from backup file handler
  const handleBackupImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupFile) {
      handleShowNotification("error", "يرجى اختيار ملف نسخة احتياطية صالح أولاً.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedBackup = JSON.parse(event.target?.result as string);
        const res = await apiFetch("/api/admin/backup/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ database: parsedBackup })
        });
        const data = await res.json();
        if (data.success) {
          handleShowNotification("success", "تهانينا! تم تصفير الكاتالوج واستيراد النسخة الاحتياطية بنجاح تام!");
          setBackupFile(null);
          loadPhones();
          loadStats();
          loadBrands();
          loadLogs();
        } else {
          handleShowNotification("error", data.error || "الملف لا يستوفي شروط الهيكل الموحد.");
        }
      } catch (err) {
        handleShowNotification("error", "صياغة وتشفير الملف خاطئ أو تالف.");
      }
    };
    reader.readAsText(backupFile);
  };

  // Dynamic filter lists for Smartphones Catalogue
  let filteredPhones = phones;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPhoneNames(filteredPhones.map(p => p.name));
    } else {
      setSelectedPhoneNames([]);
    }
  };

  const handleSelectPhone = (name: string, checked: boolean) => {
    if (checked) {
      setSelectedPhoneNames(prev => [...prev, name]);
    } else {
      setSelectedPhoneNames(prev => prev.filter(n => n !== name));
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6" id="admin-master-dashboard" dir="rtl">
      
      {/* Upper Status / Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-indigo-500/10">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-md sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                منظومة الإدارة الفنية المركزية
              </h2>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-wide">Pro</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono mt-1">
              حساب المشرف النشط: <span className="text-slate-800 dark:text-slate-200 underline decoration-indigo-500">{userEmail}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 transition-all self-start shadow-sm"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>الولوج للتقارير والواجهة العامة ←</span>
        </button>
      </div>
      <DatabaseStatusTopBar phonesCount={phones.length} brandsCount={brands.length} />

      {/* Main SaaS Layout wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Drawer / Sidebar Menu */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 lg:space-y-1">
          <span className="hidden lg:block text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 px-3.5 pt-2 pb-1 uppercase">الأقسام الرئيسية</span>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shrink-0 text-right ${
              activeTab === "dashboard"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">📱 لوحة التحكم الإحصائية</span>
          </button>

          <button
            onClick={() => { setActiveTab("catalog"); setCatalogSubTab("phones"); }}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shrink-0 text-right ${
              activeTab === "catalog" && catalogSubTab === "phones"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">🗂️ قاعدة الهواتف الكاتالوج</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_import")}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shrink-0 text-right ${
              activeTab === "ai_import"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">⚡ استيراد ذكي بالـ AI</span>
          </button>

          <button
            onClick={() => setActiveTab("perf")}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shrink-0 text-right ${
              activeTab === "perf"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">⚙️ الأداء وكاش السيرفر</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shrink-0 text-right ${
              activeTab === "logs"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <History className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">📝 سجل عمليات الإشراف</span>
          </button>

          <button
            onClick={() => setActiveTab("admins")}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all shrink-0 text-right ${
              activeTab === "admins"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">👑 إدارة المشرفين</span>
          </button>
        </div>

        {/* Right Core Workspace Content Panel */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
          
          {/* Global Action Notifications header */}
          <AnimatePresence>
            {actionStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3.5 mb-5 rounded-xl text-xs font-bold flex items-start gap-2.5 shadow-sm border ${
                  actionStatus.type === "success" 
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30"
                    : actionStatus.type === "info"
                    ? "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/30"
                    : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/30"
                }`}
              >
                {actionStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : actionStatus.type === "info" ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{actionStatus.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================= TAB: DASHBOARD ======================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Top Row: Core stats & sync */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Statistics Card */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">📊 إحصائيات قاعدة البيانات</h3>
                  <DatabaseStatsCard stats={adminStats} />
                  
                  {/* Smart Sync Control Panel */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white">المزامنة الذكية الموحدة</h3>
                    <p className="text-[10px] text-slate-400 leading-normal">تحديث كل الشركات بالترتيب، ثم سحب أحدث الهواتف، ثم تصفية الهواتف المكررة، وإعادة بناء الكاش فورا.</p>
                    <SmartSyncButton onSync={handleSmartSync} loading={smartSyncLoading} />
                    
                    {smartSyncReport && (
                      <div className="mt-3 p-3 bg-slate-900 text-slate-100 font-mono text-[9px] rounded-xl whitespace-pre leading-relaxed border border-slate-700">
                        <div>━━━━━━━━━━━━━━━━━━━━</div>
                        <div className="text-emerald-400 font-black">Smart Sync Completed</div>
                        <div>━━━━━━━━━━━━━━━━━━━━</div>
                        <div>Brands Added: {smartSyncReport.brandsAdded}</div>
                        <div>Phones Added: {smartSyncReport.phonesAdded}</div>
                        <div>Phones Updated: {smartSyncReport.phonesUpdated}</div>
                        <div>Duplicates Skipped: {smartSyncReport.skipped}</div>
                        <div className="mt-1 text-indigo-300 font-black">Final Database:</div>
                        <div>Phones: {phones.length}</div>
                        <div>Brands: {brands.length}</div>
                        <div className="mt-1">Duration: {smartSyncReport.duration} sec</div>
                        <div>━━━━━━━━━━━━━━━━━━━━</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations & Last Sync */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">🔄 آخر التحركات الإشرافية</h3>
                  <LastSyncCard lastSync={importLogs && importLogs.length > 0 ? importLogs[0] : null} />
                  <SystemHealthCard />
                </div>

                {/* Integration status */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">🟢 تكامل الخدمات والمصادر</h3>
                  <ImportEngineStatus statuses={sourceStatuses || []} />
                </div>

              </div>

              {/* Extended Row: Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Quick Logs Feed */}
                <div className="lg:col-span-12 space-y-4">
                  <ActivityLog logs={activityLogs || []} />
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB: CATALOG ======================= */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              
              {/* Inner Sub-Tabs layout */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 pb-1">
                <button
                  type="button"
                  onClick={() => setCatalogSubTab("phones")}
                  className={`cursor-pointer pb-2 text-xs font-black transition-all border-b-2 px-1 ${
                    catalogSubTab === "phones"
                      ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  📱 قاعدة الهواتف الكاتالوج
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogSubTab("brands")}
                  className={`cursor-pointer pb-2 text-xs font-black transition-all border-b-2 px-1 ${
                    catalogSubTab === "brands"
                      ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  🏢 إدارة العلامات والشركات المصنعة
                </button>
              </div>

              {catalogSubTab === "phones" && (
                <div className="space-y-4">
                  {/* Filter controls */}
                  <div className="flex flex-col sm:flex-row gap-2 items-center relative">
                    <div className="w-full sm:flex-1 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن هاتف أو شركة مصنّعة..."
                        className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
                      />
                      <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                        <Filter className="w-4 h-4 text-slate-400 hover:text-indigo-500" />
                      </button>
                      
                      <AdvancedFilters 
                        isOpen={isFilterOpen} 
                        onClose={() => setIsFilterOpen(false)} 
                        filters={filters} 
                        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))} 
                        brands={brands} 
                        qualityFilter={filters.qualityFilter || null} 
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select value={filters.sortBy || "newest"} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className="w-auto text-xs py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-slate-700 dark:text-slate-300 hidden sm:block">
                        <option value="newest">الأحدث ترتيباً</option>
                        <option value="oldest">الأقدم ترتيباً</option>
                        <option value="az">أ - ي</option>
                        <option value="za">ي - أ</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => loadPhones()}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تحديث</span>
                      </button>
                    </div>
                  </div>

                  <ActiveFilterChips 
                    filters={filters} 
                    onRemove={(key) => {
                      const newFilters = { ...filters };
                      delete newFilters[key];
                      setFilters(newFilters);
                    }} 
                    onClearAll={() => setFilters({ brand: "all", sortBy: "newest" })} 
                  />

                  <DataQualityCenter 
                    userEmail={userEmail} 
                    onFilterSelect={(v) => setFilters(prev => ({ ...prev, qualityFilter: v }))} 
                    activeFilter={filters.qualityFilter || null} 
                  />

                  {/* Table rendering the Smartphones */}
                  <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      عرض {filteredPhones.length} جهاز
                    </span>
                  </div>
                  
                  {selectedPhoneNames.length > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-800 dark:text-indigo-300">
                          تم تحديد: {selectedPhoneNames.length} أجهزة
                        </span>
                        <button 
                          onClick={() => setSelectedPhoneNames([])}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-200 cursor-pointer"
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              setBulkModal({ isOpen: true, type: "change_status", payload: { status: e.target.value } });
                              e.target.value = "";
                            }
                          }}
                          disabled={isBulkActionLoading}
                          className="text-[10px] py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold cursor-pointer"
                        >
                          <option value="">تغيير الحالة...</option>
                          <option value="Published">Published (منشور)</option>
                          <option value="Draft">Draft (مسودة)</option>
                          <option value="Pending Review">Pending Review (قيد المراجعة)</option>
                          <option value="Archived">Archived (مؤرشف)</option>
                        </select>

                        <button 
                          onClick={() => setBulkModal({ isOpen: true, type: "add_tags" })}
                          disabled={isBulkActionLoading}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          + إضافة وسم
                        </button>
                        <button 
                          onClick={() => setBulkModal({ isOpen: true, type: "remove_tags" })}
                          disabled={isBulkActionLoading}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          - إزالة وسم
                        </button>
                        <button 
                          onClick={() => setBulkModal({ isOpen: true, type: "reindex" })}
                          disabled={isBulkActionLoading}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          إعادة فهرسة
                        </button>
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              handleBulkAction('export', { format: e.target.value });
                              e.target.value = "";
                            }
                          }}
                          disabled={isBulkActionLoading}
                          className="text-[10px] py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold cursor-pointer"
                        >
                          <option value="">تصدير المحدد...</option>
                          <option value="csv">تصدير CSV</option>
                          <option value="json">تصدير JSON</option>
                        </select>

                        {isBulkActionLoading && (
                          <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xs">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold pb-2">
                          <th className="p-3 w-10 text-center">
                            <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={filteredPhones.length > 0 && selectedPhoneNames.length === filteredPhones.length}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th className="p-3">اسم الهاتف الذكي</th>
                          <th className="p-3">العلامة</th>
                          <th className="p-3 hidden md:table-cell">المعالج والعتاد</th>
                          <th className="p-3 hidden md:table-cell flex-nowrap shrink-0">النظام ومعدل التقييم</th>
                          <th className="p-3 text-left">التحكم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-400 font-black">جاري جلب وقراءة بيانات الكاتالوج العلائقي...</td>
                          </tr>
                        ) : filteredPhones.length > 0 ? (
                          filteredPhones.map((phone) => (
                            <tr key={phone.name} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="p-3 text-center">
                                <input 
                                  type="checkbox" 
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  checked={selectedPhoneNames.includes(phone.name)}
                                  onChange={(e) => handleSelectPhone(phone.name, e.target.checked)}
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {phone.thumbnail ? (
                                    <img src={phone.thumbnail} alt={phone.name} className="w-7 h-7 object-cover rounded-md" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-7 h-7 bg-indigo-500/10 text-indigo-500 rounded-md flex items-center justify-center text-[10px]">📱</div>
                                  )}
                                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{phone.name}</span>
                                </div>
                              </td>
                              <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">{phone.brand}</td>
                              <td className="p-3 text-[10px] text-slate-400 max-w-[200px] truncate hidden md:table-cell">{phone.processor}</td>
                              <td className="p-3 text-[10px] font-mono text-slate-400 hidden md:table-cell">
                                {phone.os || "غير محدد"} {phone.antutu ? `| Antutu: ${phone.antutu}` : ""}
                              </td>
                              <td className="p-3 text-left">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePhone(phone.name)}
                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-10 text-center">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <span className="text-slate-400 font-bold">لا توجد أجهزة تطابق الفلاتر الحالية.</span>
                                {(debouncedSearchQuery || Object.values(filters).some(v => v !== "all" && v !== "")) && (
                                  <button
                                    onClick={() => {
                                      setSearchQuery("");
                                      setDebouncedSearchQuery("");
                                      setFilters({ brand: "all", sortBy: "newest" });
                                    }}
                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors"
                                  >
                                    مسح كل الفلاتر
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {catalogSubTab === "brands" && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      إدارة العلامات والشركات المصنعة
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">مجموع الشركات: {brands.length}</span>
                  </div>

                  {/* Add Brand Form */}
                  <form onSubmit={handleBrandSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-end">
                    <div className="w-full sm:flex-1 flex flex-col gap-1 text-right">
                      <label className="text-[10px] font-black text-slate-500">اسم العلامة التجارية</label>
                      <input
                        type="text"
                        required
                        value={brandForm.name}
                        onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        placeholder="مثل: Apple أو Poco"
                        className="p-2.5 border rounded-xl text-xs sm:w-full dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="w-full sm:w-32 flex flex-col gap-1 text-right">
                      <label className="text-[10px] font-black text-slate-500">أيقونة Emoji</label>
                      <input
                        type="text"
                        value={brandForm.logoEmoji}
                        onChange={(e) => setBrandForm({ ...brandForm, logoEmoji: e.target.value })}
                        placeholder="🍎"
                        className="p-2.5 border rounded-xl text-xs w-full text-center dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="w-full sm:flex-1 flex flex-col gap-1 text-right">
                      <label className="text-[10px] font-black text-slate-500">بلد المنشأ المقر</label>
                      <input
                        type="text"
                        value={brandForm.originCountry}
                        onChange={(e) => setBrandForm({ ...brandForm, originCountry: e.target.value })}
                        placeholder="امثلة: الولايات المتحدة / الصين"
                        className="p-2.5 border rounded-xl text-xs sm:w-full dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="cursor-pointer w-full md:w-auto px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingBrandId ? "حفظ التغييرات" : "إضافة علامة"}</span>
                    </button>
                  </form>

                  {/* Brands Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {brands.map((b) => (
                      <div key={b.id} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-3xs hover:border-indigo-400 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{b.logoEmoji || "📱"}</span>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs block">{b.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold block">{b.phoneCount || 0} هواتف مسجلة</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditBrand(b)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBrand(b.id, b.name)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ======================= TAB: ADD/EDIT PHONE (REMOVED) ======================= */}
          {false && (
            <div>مغلق</div>
          )}

          {/* ======================= TAB: AI AUTOMATIC IMPORT ======================= */}
          {activeTab === "ai_import" && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-2xl border border-indigo-200/50 space-y-1">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  أداة استيراد المواصفات الفنية الذكية بنقرة واحدة
                </span>
                <p className="text-[10px] leading-relaxed opacity-90">
                  اكتب فقط اسم أي هاتف مفقود أو معلن عنه حديثاً بالكامل، وسيتولى الذكاء الاصطناعي (Gemini) صياغة جميع المواصفات عادية وبريميوم وترجمتها للعربية الفصحى في ثوانٍ.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiImportName}
                  onChange={(e) => setAiImportName(e.target.value)}
                  placeholder="امثلة: Apple iPhone 16 Pro Max أو Google Pixel 9 Pro"
                  className="w-full sm:flex-1 p-2.5 border border-slate-250 dark:border-slate-850 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  disabled={aiImportLoading}
                  onClick={handleAiSpecsRetrieve}
                  className="cursor-pointer px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {aiImportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudLightning className="w-4 h-4" />}
                  <span>{aiImportLoading ? "جاري قراءة البيانات بالـ AI..." : "استيراد بالذكاء الاصطناعي"}</span>
                </button>
              </div>


              {/* Display generated specifications preview for review */}
              {aiImportSpecs && (
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">معاينة مواصفات الذكاء الاصطناعي المرجعية</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{aiImportSpecs.name}</span>
                    </div>
                    <button
                      onClick={handleSaveAiSpecsDirectly}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors"
                    >
                      حفظ وإدخال في الكاتالوج مباشرة
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl">
                      <span className="text-slate-400 block font-bold">المصنع / الشركة:</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{aiImportSpecs.brand}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl">
                      <span className="text-slate-400 block font-bold">سنة الإصدار:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{aiImportSpecs.releaseYear || "—"}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl col-span-2">
                      <span className="text-slate-400 block font-bold">المعالج:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{aiImportSpecs.processor}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl">
                      <span className="text-slate-400 block font-bold">نظام التشغيل OS:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{aiImportSpecs.os || "—"}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl">
                      <span className="text-slate-400 block font-bold">كرت الشاشة GPU:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{aiImportSpecs.gpu || "—"}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl">
                      <span className="text-slate-400 block font-bold">تقييم Antutu:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200 text-indigo-500 font-mono">{aiImportSpecs.antutu || "—"}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl">
                      <span className="text-slate-400 block font-bold">تقييم Geekbench:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200 font-mono">{aiImportSpecs.geekbench || "—"}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl col-span-2">
                      <span className="text-slate-400 block font-bold">الشاشة:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{aiImportSpecs.screen}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl col-span-2">
                      <span className="text-slate-400 block font-bold">البطارية والاتصال:</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{aiImportSpecs.battery}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Added AI Import Functionality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Auto Import Latest Phones */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    استيراد أحدث الهواتف المتاحة
                  </span>
                  <button
                    onClick={handleFetchLatestPhones}
                    disabled={autoImportLoading}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    {autoImportLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Download className="w-3.5 h-3.5"/>}
                    {autoImportLoading ? "جاري البحث عن أحدث الهواتف..." : "🚀 استيراد أحدث الهواتف"}
                  </button>
                  {latestPhones.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {latestPhones.map((phone, idx) => (
                        <div key={idx} className="text-[10px] p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          {phone.name} ({phone.brand})
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddSelectedPhones(latestPhones)}
                        className="w-full px-4 py-1.5 bg-indigo-600 text-white font-extrabold text-[9px] rounded-lg mt-2"
                      >
                        [إضافة الكل]
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto Import Brands */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    استيراد وتحديث البيانات الشركات
                  </span>
                  <button
                    onClick={handleImportBrands}
                    disabled={brandImportLoading}
                    className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    {brandImportLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Building2 className="w-3.5 h-3.5"/>}
                    {brandImportLoading ? "جاري التحديث..." : "🏢 استيراد وتحديث الشركات"}
                  </button>
                </div>
              </div>

              {/* 🌍 Global Catalog Builder Module */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-950 border border-indigo-200 dark:border-indigo-900 rounded-3xl mt-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span className="text-xl">🌍</span>
                    باني الكتالوج العالمي الكلي (Global Catalog Builder)
                  </span>
                  <span className="text-[10px] self-start sm:self-auto font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    محرك الاستيراد الشامل
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  يقوم هذا الوضع باستيراد وإثراء الهواتف الذكية بشكل شامل ومنهجي عبر 24 مصنعاً عالمياً رئيسياً من عام 2020 وحتى الآن، بالاعتماد على مصفوفة مصادر Pipeline المتعددة. يدعم الإيقاف المؤقت والاستئناف التلقائي لتغطية آلاف الأجهزة بذكاء وبدون تكرار.
                </p>

                {/* Current Active Building State */}
                {globalCatalogStatus ? (
                  <div className="bg-white dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-3">
                    {/* Interactive Progress Indicators */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold">المصنع الحالي</span>
                        <span className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1">
                          {globalCatalogStatus.active && !globalCatalogStatus.paused && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />}
                          {globalCatalogStatus.currentBrand || "لم يبدأ بعد"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold">التقدم الإجمالي</span>
                        <span className="text-xs font-black text-slate-850 dark:text-white">
                          {globalCatalogStatus.processed} / {globalCatalogStatus.totalExpected} جهاز
                        </span>
                      </div>
                      <div className="flex flex-col font-mono">
                        <span className="text-[10px] text-slate-400 font-bold">تمت الإضافة [جديد]</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 text-right" dir="ltr">
                          +{globalCatalogStatus.added} هاتف
                        </span>
                      </div>
                      <div className="flex flex-col font-mono">
                        <span className="text-[10px] text-slate-400 font-bold">تم التخطي [موجود]</span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 text-right" dir="ltr">
                          {globalCatalogStatus.skipped} هاتف
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {globalCatalogStatus.totalExpected > 0 && (
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${Math.min(100, (globalCatalogStatus.processed / globalCatalogStatus.totalExpected) * 100)}%` }}
                        />
                      </div>
                    )}

                    {/* Estimated time remaining display */}
                    {globalCatalogStatus.active && !globalCatalogStatus.paused && (
                      <div className="text-[9px] text-slate-400 flex items-center justify-between">
                        <span>⏱️ الوقت المنقضي: {Math.floor(globalCatalogStatus.elapsedTimeMs / 1000)} ثانية</span>
                        <span>الوقت المقدر المتبقي: {Math.ceil(((globalCatalogStatus.totalExpected - globalCatalogStatus.processed) * 1.5))} ثانية تقريباً</span>
                      </div>
                    )}

                    {/* Controls Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {!globalCatalogStatus.active && !globalCatalogStatus.paused && !globalCatalogStatus.completed ? (
                        <button
                          onClick={handleStartGlobalCatalogBuild}
                          disabled={catalogBuilderLoading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          🚀 بدء بناء الكتالوج العالمي الكلي
                        </button>
                      ) : (
                        <>
                          {globalCatalogStatus.active && !globalCatalogStatus.paused && (
                            <button
                              onClick={handleStopGlobalCatalogBuild}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              ⏹️ إيقاف مؤقت (Pause Build)
                            </button>
                          )}

                          {globalCatalogStatus.paused && (
                            <button
                              onClick={handleResumeGlobalCatalogBuild}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              ▶️ استئناف البناء (Resume Build)
                            </button>
                          )}

                          {!globalCatalogStatus.completed && (
                            <button
                              onClick={handleStartGlobalCatalogBuild}
                              disabled={catalogBuilderLoading}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-250 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              🔄 إعادة تشغيل من الصفر
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Detailed Build Report */}
                    {globalCatalogStatus.completed && (
                      <div className="mt-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl flex flex-col gap-2">
                        <span className="font-black text-[11px] text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                          📊 تقرير اكتمال بناء الكتالوج الكلي بنجاح
                        </span>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[10px] font-mono mt-1 text-slate-600 dark:text-slate-350" dir="rtl">
                          <div>• حجم الهواتف قبل: {globalCatalogStatus.databaseBefore?.phones || 0} هاتف</div>
                          <div>• حجم الهواتف بعد: {globalCatalogStatus.databaseAfter?.phones || 0} هاتف</div>
                          <div>• حجم الشركات قبل: {globalCatalogStatus.databaseBefore?.brands || 0} شركة</div>
                          <div>• حجم الشركات بعد: {globalCatalogStatus.databaseAfter?.brands || 0} شركة</div>
                          <div>• إجمالي الأثر المكتشف: {globalCatalogStatus.added} إضافة جديدة</div>
                          <div>• تم تخطيها (تكرار معزول): {globalCatalogStatus.skipped} هاتف</div>
                          <div className="col-span-2">• مدة البناء الكلية: {Math.floor(globalCatalogStatus.elapsedTimeMs / 1000)} ثانية</div>
                        </div>
                      </div>
                    )}

                    {/* Realtime progress log window */}
                    {globalCatalogStatus.logs && globalCatalogStatus.logs.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[9px] text-slate-400 font-extrabold block mb-1">الوقائع والعمليات النشطة (Live Activity Stream):</span>
                        <div className="bg-slate-950 text-emerald-400 p-3 h-28 rounded-xl font-mono text-[9px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                          {globalCatalogStatus.logs.map((log: string, idx: number) => (
                             <div key={idx} dir="rtl" className="text-right leading-relaxed font-semibold">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <button
                      onClick={handleStartGlobalCatalogBuild}
                      disabled={catalogBuilderLoading}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
                    >
                      {catalogBuilderLoading ? "جاري تحفيز المحرك..." : "🌍 تشغيل باني الكتالوج العالمي الكلي (Global Catalog Builder)"}
                    </button>
                  </div>
                )}
              </div>

              {/* Health status of Multi-Source Data Pipeline */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-805 dark:text-white flex items-center gap-1.5 mb-4">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  حالة مصادر البيانات المتكاملة (Multi-Source Pipeline)
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {["Gemini", "Google Search", "Official Sites", "Wikipedia", "Local Database"].map((sourceName) => {
                    const found = sourceStatuses.find(s => s.name === sourceName) || { online: true, latency: null, error: null };
                    const isOnline = found.online !== undefined ? found.online : ((found as any).status === "Online");
                    const latencyVal = found.latency !== undefined ? found.latency : null;
                    const errorText = found.error || (found as any).failureReason || null;
                    return (
                      <div key={sourceName} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-1 items-center justify-center text-center relative group" title={errorText ? `سبب الفشل: ${errorText}` : undefined}>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{sourceName}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"} inline-block`}></span>
                          <span className={`text-[9px] font-extrabold ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {isOnline ? "🟢 Online" : "🔴 Offline"}
                          </span>
                        </div>
                        {latencyVal !== null && (
                          <span className="text-[8px] text-slate-400 font-mono mt-0.5">{latencyVal}ms</span>
                        )}
                        {errorText && (
                          <span className="text-[8px] text-rose-500 mt-1 max-w-full truncate" title={errorText}>
                            {errorText}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Import Activity Scraper Timeline Logs */}
              <div className="mt-6">
                <h4 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 mb-4">
                  <History className="w-4 h-4 text-indigo-500" />
                  سجل عمليات الاستيراد والـ Scraper (Import Logs)
                </h4>
                
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-h-60 overflow-y-auto">
                  {importLogs.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-slate-400 font-bold">
                      لا توجد عمليات استيراد مسجلة حالياً
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {importLogs.map((log, index) => {
                        const isSuccess = log.status === "success";
                        return (
                          <div key={index} className="flex items-center justify-between gap-4 p-2.5 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-[9px]" dir="rtl">
                            <div className="flex items-center gap-1.5">
                              <span className={`p-1 rounded-lg ${isSuccess ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-450"}`}>
                                {isSuccess ? "➕" : "❌"}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200">{log.phone || "عملية عامة"}</span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 block">{new Date(log.timestamp).toLocaleString("ar-SA")}</span>
                              </div>
                            </div>
                            <div className="text-left font-bold text-slate-500 dark:text-slate-400">
                              المصدر: <span className="text-indigo-600 dark:text-indigo-400">{log.source}</span>
                              {!isSuccess && log.reason && (
                                <span className="block text-[8px] text-red-500 max-w-xs">{log.reason}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ======================= TAB: CORES / SYSTEM MONITOR ======================= */}
          {activeTab === "perf" && (
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-orange-500 shrink-0" />
                  مستويات الاستهلاك المباشر لموارد السيرفر VPS
                </span>
                
                {perfStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-[10px] leading-relaxed">
                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex flex-col shadow-3xs text-right">
                      <span className="text-slate-400 block font-bold">تخصيص الرام (Heap Used)</span>
                      <span className="font-extrabold text-indigo-500 font-mono text-xs">{perfStats.heapUsedMb} MB</span>
                      <span className="text-[8px] text-slate-400">من الذاكرة المهيأة</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex flex-col shadow-3xs text-right">
                      <span className="text-slate-400 block font-bold">سعة التخزين (Heap Total)</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono text-xs">{perfStats.heapTotalMb} MB</span>
                      <span className="text-[8px] text-slate-400 font-bold">كامل الذاكرة المتاحة</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex flex-col shadow-3xs text-right">
                      <span className="text-slate-400 block font-bold">إجمالي ذاكرة النظام RSS</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-100 font-mono text-xs">{perfStats.rssMb} MB</span>
                      <span className="text-[8px] text-slate-400">سعة العمليات الحركية</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex flex-col shadow-3xs text-right">
                      <span className="text-slate-400 block font-bold">مجموع العناصر بالكاش</span>
                      <span className="font-extrabold text-emerald-500 font-mono text-xs">{perfStats.cacheItems}</span>
                      <span className="text-[8px] text-slate-400">طلبات مهيأة للتصفح مجاناً</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">جاري قراءة مستويات الاستهلاك...</div>
                )}
              </div>

              {/* Cache Flushing and Database Re-indexing Operations */}
              <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-805/10 space-y-4">
                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  ⚙️ تهيئة وأدوات صيانة النظام
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex flex-col gap-2 shadow-2xs">
                    <span className="text-xs font-black text-slate-800 dark:text-white">مسح وتنظيف ذواكر الكاش المؤقت</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      يُخلي ذاكرة التخزين المؤقت للخادم بالكامل، مما يجبر النظام على جلب آخر البيانات والمقالات دورياً وبشكل مباشر من قاعدة البيانات.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearServerCache}
                      className="cursor-pointer py-2 bg-indigo-600 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-lg mt-2 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>تأكيد مسح الكاش المؤقت</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex flex-col gap-2 shadow-2xs">
                    <span className="text-xs font-black text-slate-800 dark:text-white">إعادة جدولة وهيكلة قاعدة البيانات للصفر</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      إعادة بناء قاعدة البيانات العلائقية الافتراضية للصفر، مع محو أي تعديلات مخصصة تمت وتنزيل الكاتالوج الافتراضي الأساسي.
                    </p>
                    <button
                      type="button"
                      onClick={handleReloadDefaultIndices}
                      className="cursor-pointer py-2 bg-rose-600 hover:bg-black text-white font-extrabold text-[10px] rounded-lg mt-2 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إعادة ضبط الهواتف للصفر</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Gemini Models Parameters adjustment form */}
              <form onSubmit={handleSaveGeminiConfig} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-4">
                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  ضبط نماذج الذكاء الاصطناعي التوليدي ومستويات الاستجابة
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500">النموذج النشط للخدمة (Gemini Model)</label>
                    <select
                      value={currentModel}
                      onChange={(e) => setCurrentModel(e.target.value)}
                      className="p-2 border rounded-xl text-xs dark:bg-slate-950 dark:text-white"
                    >
                      <option value="gemini-3.6-flash">Gemini 3.6 Flash (سرعة فائقة وجودة استثنائية وبناء للتقارير)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (أعلى مستويات الاستدلال للتقارير المعمقة)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500">معيار معامل الحرارة (Temperature): {currentTemp}</label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={currentTemp}
                      onChange={(e) => setCurrentTemp(parseFloat(e.target.value))}
                      className="mt-2"
                    />
                    <span className="text-[8px] text-slate-400">الحرارة الأقل (مثال: 0.15) تنتج بيانات غاية في الصرامة والواقعية التقنية.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>تطبيق معايير Gemini الفعالة</span>
                </button>
              </form>

              {/* JSON Backups Downloader & Restoration Section */}
              <div className="p-4 bg-slate-50 border rounded-2xl dark:bg-slate-800/40 dark:border-slate-800 space-y-4">
                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-500" />
                  إدارة النسخ الاحتياطية واستعادة البيانات الكاملة
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Export anchor */}
                  <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl flex flex-col gap-2 text-right">
                    <span className="text-xs font-black text-slate-850 dark:text-white">تنزيل نسخة احتياطية فورية</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      تصدير كافة هواتف الكاتالوج، الشركات والتقييمات المسجلة كملف JSON محمول، جاهز للاستعادة على أي جهاز وخادم آخر.
                    </p>
                    <button
                      type="button"
                      onClick={handleBackupExport}
                      className="cursor-pointer py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-[10px] font-black rounded-lg mt-2 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل وثيقة الـ Backup</span>
                    </button>
                  </div>

                  {/* Import file restore */}
                  <form onSubmit={handleBackupImportSubmit} className="p-4 bg-white dark:bg-slate-900 border rounded-xl flex flex-col gap-2 text-right">
                    <span className="text-xs font-black text-slate-850 dark:text-white">استعادة البيانات من Backup خارجي</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      اختر ملف النسخة الاحتياطية الملائم ذي لاحقة .json، لتهيئة السيرفر ومزامنة الفهارس والجداول العلائقية فوراً.
                    </p>
                    <div className="flex gap-2 items-center mt-2">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                        className="text-[10px] block w-full text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                      />
                      <button
                        type="submit"
                        className="cursor-pointer px-4 py-1.5 bg-emerald-600 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition-all shrink-0 flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>استعادة</span>
                      </button>
                    </div>
                  </form>

                </div>
              </div>

            </div>
          )}

          {/* ======================= TAB: TIMELINE ACTIVITY LOGS ======================= */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-500" />
                  أرشيف العمليات الإشرافية والتحركات الفنية بالسيرفر
                </span>
                <button
                  onClick={loadLogs}
                  className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 rounded-md hover:text-indigo-500 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  تحديث فوري
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs leading-relaxed"
                    >
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{log.action}</span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold block mt-1">
                          <span>المسؤول: {log.adminEmail}</span>
                          <span>المعرف الرقمي للمنفذ IP: {log.ip || "127.0.0.1"}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg self-start sm:self-center shrink-0">
                        ⏱️ {log.timestamp.replace("T", "  ").substring(0, 19)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-xs text-slate-400 font-black">لا توجد سجلات بالعمليات والتحركات الإشرافية حتى الآن.</div>
                )}
              </div>

            </div>
          )}

          {/* ======================= TAB: ADMIN ACCOUNTS MANAGEMENT ======================= */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              
              <div className="p-4 bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-2xl border border-amber-200/50 space-y-1">
                <span className="text-xs font-black flex items-center gap-1.5 text-right w-full">
                  ⚠️ تحذير الصلاحيات الفنية الحساسة
                </span>
                <p className="text-[10px] leading-relaxed opacity-90 text-right">
                  إضافة أي بريد إلكتروني هنا يمنح صاحبه صلاحيات الإشراف الكاملة على قاعدة بيانات هواتف الكاتالوج، الشركات والنسخ الاحتياطية. يرجى مراجعة وتدقيق الصلاحيات بانتظام.
                </p>
              </div>

              {/* Invite Admin Form */}
              <form onSubmit={handleInviteAdmin} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 items-end">
                <div className="w-full sm:flex-1 flex flex-col gap-1 text-right">
                  <label className="text-[10px] font-black text-slate-500">المرشح لترخيص الإشراف (Email)</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="أدخل بريد جوجل المعتمد للمشرف الجديد..."
                    className="p-2.5 border rounded-xl text-xs w-full dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="cursor-pointer w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ترخيص المشرف</span>
                </button>
              </form>

              {/* Admins List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminsList.map((admin) => {
                  const isOwner = admin.email === "hamdanaltawaf@gmail.com";
                  return (
                    <div
                      key={admin.email}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-3xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-500 shrink-0 font-extrabold">
                          👑
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs block">{admin.email}</span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">الحالة: {admin.status} {isOwner && " | مالك النظام / محصن"}</span>
                        </div>
                      </div>

                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRevokeAdmin(admin.email)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer transition-colors"
                          title="سحب الترخيص"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Bulk Action Modal */}
      {bulkModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
            <div className="flex flex-col gap-1 text-center">
              <h3 className="font-black text-lg text-slate-850 dark:text-white">تأكيد الإجراء الجماعي</h3>
              <p className="text-sm font-bold text-slate-500">
                {bulkModal.type === "change_status" && `هل أنت متأكد من تغيير حالة ${selectedPhoneNames.length} جهاز إلى "${bulkModal.payload?.status}"؟`}
                {bulkModal.type === "add_tags" && `إضافة وسم جديد لـ ${selectedPhoneNames.length} جهاز`}
                {bulkModal.type === "remove_tags" && `إزالة وسم من ${selectedPhoneNames.length} جهاز`}
                {bulkModal.type === "reindex" && `هل أنت متأكد من إعادة فهرسة ${selectedPhoneNames.length} جهاز؟`}
              </p>
            </div>

            {(bulkModal.type === "add_tags" || bulkModal.type === "remove_tags") && (
              <input 
                type="text"
                placeholder="أدخل اسم الوسم..."
                value={bulkTagInput}
                onChange={(e) => setBulkTagInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 text-center"
              />
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setBulkModal({ isOpen: false, type: null }); setBulkTagInput(""); }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                disabled={isBulkActionLoading}
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (bulkModal.type === "add_tags" || bulkModal.type === "remove_tags") {
                    if (!bulkTagInput.trim()) return;
                    handleBulkAction(bulkModal.type, { tag: bulkTagInput.trim() });
                  } else {
                    handleBulkAction(bulkModal.type as string, bulkModal.payload);
                  }
                }}
                disabled={isBulkActionLoading || ((bulkModal.type === "add_tags" || bulkModal.type === "remove_tags") && !bulkTagInput.trim())}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isBulkActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
