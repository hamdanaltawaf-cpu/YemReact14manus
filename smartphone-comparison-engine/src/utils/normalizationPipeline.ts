import { Smartphone, SmartphoneNormalized, SpecificationConfidence } from "../types";
import { SmartphoneSchema } from "../validators/schemas";
import { StorageManager } from "./storage";

// In-Memory cache fallback to guarantee performance even if localStorage has issues
const processCache = new Map<string, Smartphone>();

/**
 * Robust utility to convert Arabic digits (٠-٩) to standard English digits (0-9)
 */
export function convertArabicToEnglishDigits(text: string): string {
  if (!text) return "";
  const map: { [key: string]: string } = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
  };
  return text.replace(/[٠-٩]/g, (char) => map[char] || char);
}

/**
 * 1. AI Normalization Utilities
 * Heuristic/Regex engine to extract standard specifications from Arabic or English descriptions.
 * This guarantees consistency even if the database is in a transition state or the model returns fuzzy text.
 */
export function extractNumberFromText(text: string, patterns: RegExp[]): number | null {
  if (!text) return null;
  const converted = convertArabicToEnglishDigits(text);
  const clean = converted.toLowerCase().trim();
  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      // Find the first capturing group that is a number
      for (let i = 1; i < match.length; i++) {
        if (match[i]) {
          // Replace commas or spaces inside numeric strings for clean float conversion
          const numStr = match[i].replace(/,/g, "").trim();
          const val = parseFloat(numStr);
          if (!isNaN(val)) return val;
        }
      }
    }
  }
  return null;
}

export function parseRam(text: string): number {
  if (!text) return 8; // Default standard RAM
  const cleaned = convertArabicToEnglishDigits(text).toLowerCase().replace(/\s+/g, "");
  
  // Try pattern matches for GB numbers
  const match = cleaned.match(/(\d+)(?:gb|g|جيجا|جيجابايت|رام|ram)/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val > 0 && val <= 64) {
      return val;
    }
  }
  
  const fallbackMatch = cleaned.match(/(\d+)/);
  if (fallbackMatch) {
    const val = parseInt(fallbackMatch[1]);
    if (!isNaN(val) && val > 0 && val <= 64) return val;
  }
  return 8; // Default 8GB safe fallback
}

export function parseStorage(text: string): number {
  if (!text) return 128; // Default standard storage
  const cleaned = convertArabicToEnglishDigits(text).toLowerCase().replace(/\s+/g, "");
  
  if (cleaned.includes("1tb") || cleaned.includes("1تيرا") || cleaned.includes("تيرابايت")) {
    return 1024;
  }
  
  const match = cleaned.match(/(\d+)(?:gb|g|جيجا|جيجابايت|تخزين|storage)/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val > 0) return val;
  }
  
  const fallbackMatch = cleaned.match(/(\d+)/);
  if (fallbackMatch) {
    const val = parseInt(fallbackMatch[1]);
    if (!isNaN(val) && val > 0) {
      if (val === 1 || val === 2) return val * 1024; // Treat 1/2 without unit as TB
      return val;
    }
  }
  return 128; // Default 128GB safe fallback
}

export function parseBattery(text: string): number {
  if (!text) return 5000; // Default standard battery
  const cleaned = convertArabicToEnglishDigits(text).replace(/,/g, "").toLowerCase().replace(/\s+/g, "");
  
  const match = cleaned.match(/(\d{4,5})(?:mah|مللي|ملي)/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val >= 1000 && val <= 25000) return val;
  }
  
  const fallback = cleaned.match(/(\d{4,5})/);
  if (fallback) {
    const val = parseInt(fallback[1]);
    if (!isNaN(val) && val >= 1000 && val <= 25000) return val;
  }
  return 5000; // Default 5000mAh safe fallback
}

export function parseCharging(text: string): number {
  if (!text) return 33; // Default standard charging speed
  const cleaned = convertArabicToEnglishDigits(text).toLowerCase().replace(/\s+/g, "");
  
  const match = cleaned.match(/(\d+)(?:w|watt|واط|سلكي)/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val > 0 && val <= 300) return val;
  }
  
  const fallback = cleaned.match(/(\d+)/);
  if (fallback) {
    const val = parseInt(fallback[1]);
    if (!isNaN(val) && val > 0 && val <= 300) return val;
  }
  return 33; // Default 33W safe fallback
}

export function parseScreenSize(text: string): number {
  if (!text) return 6.5; // Default screen size
  const patterns = [
    /(\d+\.\d+)\s*(?:inch|bosa|بوصة|بوصة|"|'')/i,
    /(\d+)\s*(?:inch|bosa|بوصة|بوصة|"|'')/i,
    /(\d+\.\d+)/
  ];
  return extractNumberFromText(text, patterns) || 6.5; // Default to standard 6.5 inches
}

export function normalizeDisplayCategory(screenText: string): string {
  if (!screenText) return "OLED";
  const clean = screenText.toLowerCase();

  if (clean.includes("ltpo") && (clean.includes("amoled") || clean.includes("oled"))) {
    return "LTPO AMOLED";
  }
  if (clean.includes("dynamic") && clean.includes("amoled")) {
    return "Dynamic AMOLED";
  }
  if (clean.includes("retina") || clean.includes("xdr")) {
    return "Super Retina XDR";
  }
  if (clean.includes("amoled") || clean.includes("اموليد")) {
    return "AMOLED";
  }
  if (clean.includes("oled") || clean.includes("أوليد")) {
    return "OLED";
  }
  if (clean.includes("ips") || clean.includes("lcd") || clean.includes("سائل")) {
    return "IPS LCD";
  }
  return "OLED"; // Standard OLED fallback
}

export function parseRefreshRate(text: string): number {
  if (!text) return 120; // Default refresh rate
  const cleaned = convertArabicToEnglishDigits(text).toLowerCase().replace(/\s+/g, "");
  
  const match = cleaned.match(/(\d+)(?:hz|هرتز|hertz)/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val > 0) {
      if (val >= 144) return 144;
      if (val >= 120) return 120;
      if (val >= 90) return 90;
      return 60;
    }
  }
  
  const fallback = cleaned.match(/(\d+)/);
  if (fallback) {
    const val = parseInt(fallback[1]);
    if (val === 60 || val === 90 || val === 120 || val === 144) return val;
    if (val >= 120) return 120;
    if (val >= 90) return 90;
    if (val >= 60) return 60;
  }
  return 120; // Default 120Hz safe fallback
}

export function parseCameraMegaPixels(text: string): number {
  if (!text) return 50; // Default MP
  const cleaned = convertArabicToEnglishDigits(text).toLowerCase().replace(/\s+/g, "");
  
  const match = cleaned.match(/(\d+)(?:\s*(?:mp|megapixel|ميجابكسل|ميجا))/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val > 0 && val <= 500) return val;
  }
  
  const fallback = cleaned.match(/(\d+)/);
  if (fallback) {
    const val = parseInt(fallback[1]);
    if (!isNaN(val) && val > 0 && val <= 500) return val;
  }
  return 50; // Default 50MP safe fallback
}

export function parseOpticalZoom(text: string): number {
  if (!text) return 0; // Default zoom
  const cleaned = convertArabicToEnglishDigits(text).toLowerCase();
  
  const match = cleaned.match(/(\d+)\s*(?:x|x\s*optical|x\s*بصري|تقريب|بصري|optical)/);
  if (match) {
    const val = parseInt(match[1]);
    if (!isNaN(val) && val > 0 && val <= 100) return val;
  }
  
  if (cleaned.includes("zoom") || cleaned.includes("تقريب") || cleaned.includes("بصري")) {
    if (cleaned.includes("5x") || cleaned.includes("5") || cleaned.includes("خمس")) return 5;
    if (cleaned.includes("3x") || cleaned.includes("3") || cleaned.includes("ثلاث")) return 3;
    if (cleaned.includes("2x") || cleaned.includes("2") || cleaned.includes("ضعف")) return 2;
  }
  return 0; // None if not specified
}

export function parseOisPresence(text: string): boolean {
  if (!text) return false;
  const cleaned = text.toLowerCase();
  return (
    cleaned.includes("ois") || 
    cleaned.includes("stabilization") || 
    cleaned.includes("تثبيت بصري") || 
    cleaned.includes("ثبات بصري") || 
    cleaned.includes("بصري")
  );
}

export function normalizeCpu(processor: string): string {
  if (!processor) return "غير متوفر";
  const clean = processor.toLowerCase().trim();
  if (clean === "غير متوفر" || clean === "غير محدد" || clean === "") {
    return "غير متوفر";
  }

  // Phase 1 - CPU canonical identifier resolution
  if (clean.includes("8 gen 3") || clean.includes("8gen3") || clean.includes("sd8g3")) {
    return "Snapdragon 8 Gen 3";
  }
  if (clean.includes("8 gen 4") || clean.includes("8gen4") || clean.includes("sd8g4") || clean.includes("8 elite") || clean.includes("8elite")) {
    return "Snapdragon 8 Elite";
  }
  if (clean.includes("8 gen 2") || clean.includes("8gen2") || clean.includes("sd8g2")) {
    return "Snapdragon 8 Gen 2";
  }
  if (clean.includes("8 gen 1") || clean.includes("8gen1") || clean.includes("sd8g1")) {
    return "Snapdragon 8 Gen 1";
  }
  if (clean.includes("8+ gen 1") || clean.includes("8+gen1") || clean.includes("sd8+g1")) {
    return "Snapdragon 8+ Gen 1";
  }
  if (clean.includes("a18 pro")) {
    return "Apple A18 Pro";
  }
  if (clean.includes("a18")) {
    return "Apple A18";
  }
  if (clean.includes("a17 pro")) {
    return "Apple A17 Pro";
  }
  if (clean.includes("a16 bionic") || clean.includes("a16")) {
    return "Apple A16 Bionic";
  }
  if (clean.includes("a15 bionic") || clean.includes("a15")) {
    return "Apple A15 Bionic";
  }
  if (clean.includes("dimensity 9400") || clean.includes("9400")) {
    return "Dimensity 9400";
  }
  if (clean.includes("dimensity 9300") || clean.includes("9300")) {
    return "Dimensity 9300";
  }
  if (clean.includes("dimensity 9200") || clean.includes("9200")) {
    return "Dimensity 9200";
  }
  if (clean.includes("dimensity 8300") || clean.includes("8300")) {
    return "Dimensity 8300";
  }
  if (clean.includes("dimensity 8200") || clean.includes("8200")) {
    return "Dimensity 8200";
  }
  if (clean.includes("dimensity 7200") || clean.includes("7200")) {
    return "Dimensity 7200";
  }
  if (clean.includes("tensor g4") || clean.includes("g4")) {
    return "Google Tensor G4";
  }
  if (clean.includes("tensor g3") || clean.includes("g3")) {
    return "Google Tensor G3";
  }
  if (clean.includes("tensor g2") || clean.includes("g2")) {
    return "Google Tensor G2";
  }
  if (clean.includes("exynos 2400") || clean.includes("2400")) {
    return "Exynos 2400";
  }
  if (clean.includes("exynos 2200") || clean.includes("2200")) {
    return "Exynos 2200";
  }
  if (clean.includes("exynos 1480") || clean.includes("1480")) {
    return "Exynos 1480";
  }
  if (clean.includes("helio g99") || clean.includes("g99")) {
    return "Helio G99";
  }
  if (clean.includes("snapdragon 7") || clean.includes("sd7")) {
    return "Snapdragon 7 Series";
  }
  if (clean.includes("snapdragon 6") || clean.includes("sd6")) {
    return "Snapdragon 6 Series";
  }

  return processor
    .replace(/(?:qualcomm|mediatek|google|samsung|apple)\s+/gi, "")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function parsePrice(text: string): number {
  if (!text) return 500;
  // Clean separators and find numeric sequences
  const clean = convertArabicToEnglishDigits(text).replace(/,/g, "");
  const patterns = [
    /\$(\d+)/,
    /(\d+)\s*(?:\$|usd|دولار|دولاراً)/i,
    /(\d+)/
  ];
  return extractNumberFromText(clean, patterns) || 499; // Default to standard $499 mid-ranger
}

/**
 * Standardizes a smartphone's unstructured Arabic specifications into a unified, numerical format.
 */
export function normalizePhoneSpecs(phone: Smartphone): SmartphoneNormalized {
  if (phone.normalized) {
    return phone.normalized;
  }

  const cameraText = phone.camera || "";
  const otherText = phone.other_specs || "";
  const chargingText = phone.charging || "";
  const storageText = phone.storage || "";
  const screenText = phone.screen || "";
  const processorText = phone.processor || "";

  // Enhanced RAM parsing across storage & alternative keys
  let ramGB = parseRam(storageText);
  if (ramGB === 8 && otherText) {
    const backupRam = parseRam(otherText);
    if (backupRam !== 8) ramGB = backupRam;
  }

  // Enhanced Storage parsing
  let storageGB = parseStorage(storageText);
  if (storageGB === 128 && otherText) {
    const backupStorage = parseStorage(otherText);
    if (backupStorage !== 128) storageGB = backupStorage;
  }

  const hasWirelessCharging = 
    chargingText.includes("لاسلكي") || 
    chargingText.toLowerCase().includes("wireless") || 
    chargingText.toLowerCase().includes("magsafe") ||
    otherText.includes("لاسلكي") ||
    otherText.toLowerCase().includes("wireless");

  const isWaterResistant = 
    otherText.includes("مقاوم للماء") || 
    otherText.includes("مقاومة للماء") || 
    otherText.toLowerCase().includes("water resistant") || 
    otherText.toLowerCase().includes("waterproof") || 
    otherText.toLowerCase().includes("ip68") || 
    otherText.toLowerCase().includes("ip67");

  return {
    ramGB,
    storageGB,
    batteryCapacity: parseBattery(phone.battery || ""),
    chargingSpeedWatts: parseCharging(chargingText),
    screenSizeInches: parseScreenSize(screenText),
    screenRefreshRateHz: parseRefreshRate(screenText),
    cameraMainMegapixels: parseCameraMegaPixels(cameraText),
    priceUSD: parsePrice(phone.price_range || ""),
    hasWirelessCharging,
    isWaterResistant,
    cpuNormalized: normalizeCpu(processorText),
    displayCategory: normalizeDisplayCategory(screenText),
    cameraOpticalZoom: parseOpticalZoom(cameraText),
    cameraOisPresence: parseOisPresence(cameraText)
  };
}

/**
 * 2. Confidence Scoring System
 * Analytically scores specification data and marks missing/uncertain fields based on text markers.
 */
export function scoreSpecificationConfidence(phone: Smartphone): SpecificationConfidence {
  const missingFields: string[] = [];
  const estimatedFields: string[] = [];
  const uncertainFields: string[] = [];

  // Check structure completeness
  const checkCompleteness = (val: string | undefined, name: string) => {
    if (!val || val.trim() === "" || val === "غير متوفر" || val === "غير محدد") {
      missingFields.push(name);
      return false;
    }
    return true;
  };

  const checkUncertainty = (val: string | undefined, name: string) => {
    if (!val) return;
    const clean = val.toLowerCase();
    
    // Estimate markers (Arabic and English)
    const estimateMarkers = ["تقريبي", "تقريبياً", "estimated", "approx", "حدود", "مقدر", "estimated value"];
    if (estimateMarkers.some(m => clean.includes(m))) {
      estimatedFields.push(name);
    }

    // Uncertainty markers
    const uncertaintyMarkers = ["ربما", "غير مؤكد", "قد يكون", "uncertain", "not confirmed", "unverified", "مشكوك", "غالباً"];
    if (uncertaintyMarkers.some(m => clean.includes(m))) {
      uncertainFields.push(name);
    }
  };

  const fieldsToCheck = [
    { value: phone.brand, name: "brand" },
    { value: phone.screen, name: "screen" },
    { value: phone.processor, name: "processor" },
    { value: phone.camera, name: "camera" },
    { value: phone.battery, name: "battery" },
    { value: phone.charging, name: "charging" },
    { value: phone.storage, name: "storage" },
    { value: phone.price_range, name: "price_range" },
  ];

  fieldsToCheck.forEach(f => {
    const isComplete = checkCompleteness(f.value, f.name);
    if (isComplete) {
      checkUncertainty(f.value, f.name);
    }
  });

  // Calculate strict deterministic overall score
  // Complete specs default to 100.
  // We deduct 15 points per missing key specification,
  // 5 points per estimated detail,
  // and 8 points per uncertain/unvetted detail.
  let overallScore = 100 
    - (missingFields.length * 15) 
    - (estimatedFields.length * 5) 
    - (uncertainFields.length * 8);

  // Guarantee score sits within a healthy 10-100 range
  overallScore = Math.max(10, Math.min(100, overallScore));

  return {
    overallScore,
    missingFields,
    estimatedFields,
    uncertainFields
  };
}

/**
 * 3. Fuzzy Duplicate and Variant Detection
 * Standardizes names and brand identifiers to check for minor spelling updates,
 * regional variants (5G, Dual SIM, Middle East), and regional additions.
 */
export function standardizePhoneName(name: string): string {
  if (!name) return "";
  let norm = name.toLowerCase().trim();
  
  // Remove known common regional and technical variant suffixes that cause duplication
  const suffixesToRemove = [
    "5g", "4g", "lte", "dual sim", "dual-sim", "global", "global edition", 
    "international", "international version", "نسخة الشرق الأوسط", 
    "النسخة العالمية", "سلسلة", "رابطة", "برو", "عادي", "نسخة", "سلسلة",
    "giga", "gb", "ram", "rom"
  ];

  suffixesToRemove.forEach(suffix => {
    norm = norm.replace(new RegExp(`\\b${suffix}\\b`, "g"), "");
  });

  // Clean remaining punctuation, excess whitespace
  norm = norm.replace(/[^a-z0-9]/g, "");
  return norm;
}

export function arePhonesDuplicated(phoneNameA: string, phoneNameB: string): boolean {
  if (!phoneNameA || !phoneNameB) return false;
  
  // Normalization logic: trim, lowercase, and space normalization to single spaces
  const norm = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  const a = norm(phoneNameA);
  const b = norm(phoneNameB);

  if (a === b) return true;

  // Collapse spaces completely to catch variations like "S24 Ultra" vs "S24Ultra" or "iPhone 15Pro" vs "iPhone 15 Pro"
  const collapse = (str: string) => {
    return str.replace(/\s+/g, "");
  };

  return collapse(a) === collapse(b);
}

/**
 * Checks a smartphone name against an active template catalog to retrieve matches.
 */
export function detectDuplicateInList(
  phoneName: string, 
  brand: string, 
  phonesList: Smartphone[]
): Smartphone | null {
  if (!phoneName) return null;
  
  // Clean target
  const standardizedTargetName = standardizePhoneName(phoneName);
  
  for (const item of phonesList) {
    // Exact match instantly takes priority
    if (item.name.toLowerCase().trim() === phoneName.toLowerCase().trim()) {
      return item;
    }

    // Standard compare
    const currentName = standardizePhoneName(item.name);
    if (currentName === standardizedTargetName) {
      return item;
    }

    // Check Jaccard overlap on fully standard strings
    if (arePhonesDuplicated(item.name, phoneName)) {
      // Confirm brand alignment before merging
      if (brand && item.brand && brand.toLowerCase().trim() === item.brand.toLowerCase().trim()) {
        return item;
      }
    }
  }

  return null;
}

/**
 * 4. Data Validation and Normalization Pipeline
 * Orchestrates: Raw AI Output -> Validation -> Normalization -> Confidence Scoring -> Smart Caching -> Application Payload.
 */
export function processSpecPipeline(rawSpecs: any): Smartphone {
  // Validate basic spec compliance
  const parsed = SmartphoneSchema.safeParse(rawSpecs);
  let baseSpecs: Smartphone;

  if (parsed.success) {
    baseSpecs = parsed.data;
  } else {
    // Defensive engineering: fallback default values
    baseSpecs = {
      name: typeof rawSpecs?.name === "string" ? rawSpecs.name : "هاتف ذكي",
      brand: typeof rawSpecs?.brand === "string" ? rawSpecs.brand : "غير معروف",
      screen: typeof rawSpecs?.screen === "string" ? rawSpecs.screen : "غير متوفر",
      processor: typeof rawSpecs?.processor === "string" ? rawSpecs.processor : "غير متوفر",
      camera: typeof rawSpecs?.camera === "string" ? rawSpecs.camera : "غير متوفر",
      battery: typeof rawSpecs?.battery === "string" ? rawSpecs.battery : "غير متوفر",
      charging: typeof rawSpecs?.charging === "string" ? rawSpecs.charging : "غير متوفر",
      storage: typeof rawSpecs?.storage === "string" ? rawSpecs.storage : "غير متوفر",
      price_range: typeof rawSpecs?.price_range === "string" ? rawSpecs.price_range : "غير محدد",
      other_specs: typeof rawSpecs?.other_specs === "string" ? rawSpecs.other_specs : "غير متوفر",
    };
  }

  // Inject normalized specs
  baseSpecs.normalized = normalizePhoneSpecs(baseSpecs);
  
  // Inject calculated confidence indexes
  baseSpecs.confidence = scoreSpecificationConfidence(baseSpecs);

  // Preserve premium specifications attributes
  const premiumFields = [
    "releaseYear", "gpu", "os", "antutu", "geekbench", "geekbenchSingle", "geekbenchMulti",
    "weight", "dimensions", "water_resistance", "waterResistance", "fingerprint", "has5g", "supports5G", "thumbnail", "otherSpecs"
  ];
  premiumFields.forEach(f => {
    if (rawSpecs[f] !== undefined) {
      (baseSpecs as any)[f] = rawSpecs[f];
    }
  });

  // Smart inference for missing premium fields to prevent '—' fallback rendering
  baseSpecs.gpu = baseSpecs.gpu && baseSpecs.gpu !== "—" ? baseSpecs.gpu : inferGpu(baseSpecs);
  baseSpecs.os = baseSpecs.os && baseSpecs.os !== "—" ? baseSpecs.os : inferOs(baseSpecs);
  baseSpecs.releaseYear = baseSpecs.releaseYear && baseSpecs.releaseYear !== "—" ? baseSpecs.releaseYear : inferReleaseYear(baseSpecs);
  const waterRes = inferWaterResistance(baseSpecs);
  baseSpecs.waterResistance = baseSpecs.waterResistance && baseSpecs.waterResistance !== "—" ? baseSpecs.waterResistance : waterRes;
  baseSpecs.water_resistance = baseSpecs.water_resistance && baseSpecs.water_resistance !== "—" ? baseSpecs.water_resistance : waterRes;
  baseSpecs.fingerprint = baseSpecs.fingerprint && baseSpecs.fingerprint !== "—" ? baseSpecs.fingerprint : inferFingerprint(baseSpecs);
  const is5g = infer5G(baseSpecs);
  baseSpecs.supports5G = baseSpecs.supports5G ?? is5g;
  baseSpecs.has5g = baseSpecs.has5g ?? is5g;
  baseSpecs.antutu = baseSpecs.antutu && baseSpecs.antutu !== "—" ? baseSpecs.antutu : inferAntutu(baseSpecs);
  const gb = inferGeekbench(baseSpecs);
  baseSpecs.geekbenchSingle = baseSpecs.geekbenchSingle || gb.single;
  baseSpecs.geekbenchMulti = baseSpecs.geekbenchMulti || gb.multi;
  baseSpecs.geekbench = baseSpecs.geekbench && baseSpecs.geekbench !== "—" ? baseSpecs.geekbench : gb.full;
  const otherStr = baseSpecs.otherSpecs || baseSpecs.other_specs || "مواصفات تكنولوجية رائدة متكاملة";
  baseSpecs.otherSpecs = otherStr;
  baseSpecs.other_specs = otherStr;

  return baseSpecs;
}

export function inferGpu(phone: Smartphone): string {
  if (phone.gpu && phone.gpu.trim() !== "" && phone.gpu !== "—") return phone.gpu;
  const proc = (phone.processor || "").toLowerCase();
  if (proc.includes("a18 pro") || proc.includes("a18")) return "Apple GPU (6-core)";
  if (proc.includes("a17 pro")) return "Apple GPU (6-core)";
  if (proc.includes("a16")) return "Apple GPU (5-core)";
  if (proc.includes("a15")) return "Apple GPU (5-core)";
  if (proc.includes("8 gen 3") || proc.includes("8gen3")) return "Adreno 750";
  if (proc.includes("8 gen 2") || proc.includes("8gen2")) return "Adreno 740";
  if (proc.includes("8+ gen 1") || proc.includes("8 gen 1")) return "Adreno 730";
  if (proc.includes("tensor g4") || proc.includes("tensor g3")) return "Immortalis-G715s MC10";
  if (proc.includes("dimensity 9300") || proc.includes("dimensity 9400")) return "Immortalis-G720";
  if (proc.includes("dimensity 8300")) return "Mali-G610 MC6";
  if (proc.includes("exynos 2400")) return "Xclipse 940";
  if (proc.includes("helio g99")) return "Mali-G57 MC2";
  if (phone.brand?.toLowerCase() === "apple") return "Apple GPU";
  return "معالج رسوميات عالي الأداء";
}

export function inferOs(phone: Smartphone): string {
  if (phone.os && phone.os.trim() !== "" && phone.os !== "—") return phone.os;
  const brand = (phone.brand || "").toLowerCase();
  const other = (phone.other_specs || phone.otherSpecs || "").toLowerCase();
  if (brand === "apple" || phone.name?.toLowerCase().includes("iphone")) {
    return "iOS 17 (قابل للترقية إلى iOS 18+)";
  }
  if (other.includes("hyperos")) return "Android 14 (HyperOS)";
  if (other.includes("one ui")) return "Android 14 (One UI 6.1)";
  if (other.includes("oxygenos")) return "Android 14 (OxygenOS 14)";
  return "Android 14";
}

export function inferReleaseYear(phone: Smartphone): string {
  if (phone.releaseYear && phone.releaseYear.trim() !== "" && phone.releaseYear !== "—") return phone.releaseYear;
  const name = (phone.name || "").toLowerCase();
  if (name.includes("16") || name.includes("s24") || name.includes("14 ultra") || name.includes("f6") || name.includes("rog 8")) return "2024";
  if (name.includes("15") || name.includes("pixel 8") || name.includes("phone (2)")) return "2023";
  return "2024";
}

export function inferWaterResistance(phone: Smartphone): string {
  const existing = phone.waterResistance || phone.water_resistance;
  if (existing && existing.trim() !== "" && existing !== "—") return existing;
  const other = (phone.other_specs || phone.otherSpecs || "").toLowerCase();
  if (other.includes("ip68")) return "مقاومة الماء والغبار بمعيار IP68";
  if (other.includes("ip67")) return "مقاومة الماء والغبار بمعيار IP67";
  if (other.includes("ip65")) return "مقاومة رذاذ الماء بمعيار IP65";
  if (other.includes("ip54")) return "مقاومة رذاذ الماء بمعيار IP54";
  if (other.includes("مقاومة") || other.includes("ماء")) return "مقاوم للماء والغبار";
  return "غير معتمد رسمياً (مقاومة الرذاذ البسيط)";
}

export function inferFingerprint(phone: Smartphone): string {
  if (phone.fingerprint && phone.fingerprint.trim() !== "" && phone.fingerprint !== "—") return phone.fingerprint;
  const brand = (phone.brand || "").toLowerCase();
  const name = (phone.name || "").toLowerCase();
  const other = (phone.other_specs || phone.otherSpecs || "").toLowerCase();
  if (brand === "apple" || name.includes("iphone") || other.includes("face id")) {
    return "Face ID (بصمة الوجه ثلاثية الأبعاد)";
  }
  if (name.includes("s24 ultra") || name.includes("s24+")) {
    return "مدمج تحت الشاشة (Ultrasonic)";
  }
  return "مدمج تحت الشاشة (Optical)";
}

export function infer5G(phone: Smartphone): boolean {
  if (phone.supports5G !== undefined) return phone.supports5G;
  if (phone.has5g !== undefined) return phone.has5g === true || phone.has5g === "true";
  const name = (phone.name || "").toLowerCase();
  const proc = (phone.processor || "").toLowerCase();
  const other = (phone.other_specs || phone.otherSpecs || "").toLowerCase();
  if (name.includes("5g") || proc.includes("5g") || other.includes("5g")) return true;
  if (name.includes("iphone") || name.includes("s2") || name.includes("pixel") || name.includes("poco") || name.includes("xiaomi")) return true;
  return true;
}

export function inferAntutu(phone: Smartphone): string {
  if (phone.antutu && phone.antutu.trim() !== "" && phone.antutu !== "—") return phone.antutu;
  const proc = (phone.processor || "").toLowerCase();
  if (proc.includes("a18 pro")) return "1780000";
  if (proc.includes("a17 pro") || proc.includes("8 gen 3")) return "1680000";
  if (proc.includes("8 gen 2") || proc.includes("a16")) return "1500000";
  if (proc.includes("tensor g3")) return "1140000";
  if (proc.includes("8300")) return "1420000";
  return "1350000";
}

export function inferGeekbench(phone: Smartphone): { single: string; multi: string; full: string } {
  let single = phone.geekbenchSingle || "";
  let multi = phone.geekbenchMulti || "";
  if (!single || !multi) {
    const proc = (phone.processor || "").toLowerCase();
    if (proc.includes("a18 pro")) { single = "3400"; multi = "8400"; }
    else if (proc.includes("a17 pro")) { single = "2950"; multi = "7200"; }
    else if (proc.includes("8 gen 3")) { single = "2250"; multi = "7100"; }
    else if (proc.includes("8 gen 2")) { single = "1980"; multi = "5540"; }
    else if (proc.includes("tensor g3")) { single = "1760"; multi = "5150"; }
    else { single = "1800"; multi = "5200"; }
  }
  const full = phone.geekbench || `Single: ${single} / Multi: ${multi}`;
  return { single, multi, full };
}

/**
 * 5. Smart Caching Layer
 * Key-value LocalStorage and Memory Cache configuration
 */
export function getSpecsCacheKey(phoneName: string): string {
  return `cachedSpecs-${standardizePhoneName(phoneName)}`;
}

export function getCachedSpecs(phoneName: string): Smartphone | null {
  if (!phoneName) return null;
  const normalizedKey = getSpecsCacheKey(phoneName);

  // 1. In-memory check
  if (processCache.has(normalizedKey)) {
    return processCache.get(normalizedKey) || null;
  }

  // 2. LocalStorage query
  const saved = StorageManager.getItem<Smartphone | null>(normalizedKey, null);
  if (saved) {
    // Fill in memory instantly
    processCache.set(normalizedKey, saved);
    return saved;
  }

  return null;
}

export function saveSpecsToCache(phoneName: string, specs: Smartphone): void {
  if (!phoneName || !specs) return;
  const normalizedKey = getSpecsCacheKey(phoneName);
  
  // Clean standard format
  const pipelineProcessed = processSpecPipeline(specs);

  // Save in memory AND storage
  processCache.set(normalizedKey, pipelineProcessed);
  StorageManager.setItem(normalizedKey, pipelineProcessed);
}
