import { Smartphone } from "../types";
import { normalizePhoneSpecs, normalizeCpu } from "../utils/normalizationPipeline";

export interface CategoryScores {
  display: number;
  performance: number;
  camera: number;
  battery: number;
  charging: number;
  storage: number;
  connectivity: number;
  software: number;
  value: number;
  price: number;
  
  // Premium Spec Scores
  gpu?: number;
  antutu?: number;
  geekbench?: number;
  waterResistance?: number;
  supports5G?: number;
}

export interface ScoringWeightConfig {
  performance: number;
  display: number;
  camera: number;
  battery: number;
  charging: number;
  storage: number;
  software: number;
  value: number;
}

export const DEFAULT_WEIGHTS: ScoringWeightConfig = {
  performance: 0.15,
  display: 0.15,
  camera: 0.15,
  battery: 0.12,
  charging: 0.10,
  storage: 0.10,
  software: 0.08,
  value: 0.15
};

/**
 * Scoring Engine V2 — Solid computation layer isolation.
 * Encapsulates highly precise algorithms to evaluate smartphone parameters.
 * Handles missing specifications safely by fallback rules.
 */
export class ScoringService {
  /**
   * Helper utility to evaluate performance tier based on CPU text keywords.
   */
  public static evaluateCpuScore(processor: string): number {
    const text = (processor || "").toLowerCase().trim();
    if (!text || text === "غير متوفر" || text === "غير محدد") {
      return 50; // Neutral baseline for missing/unknown CPU
    }

    // Resolve into its canonical normalized identifier first (Phase 1 CPU Normalization)
    const canonical = normalizeCpu(text).toLowerCase();

    // Flagship level (Ultra Premium)
    if (
      canonical === "snapdragon 8 elite" ||
      canonical === "apple a18 pro" ||
      canonical === "apple a18" ||
      canonical === "apple a17 pro" ||
      canonical === "snapdragon 8 gen 3" ||
      canonical === "dimensity 9400" ||
      canonical === "dimensity 9300"
    ) {
      return 98;
    }

    // High Tier (Premium)
    if (
      canonical === "snapdragon 8 gen 2" ||
      canonical === "apple a16 bionic" ||
      canonical === "exynos 2400" ||
      canonical === "google tensor g4" ||
      canonical === "google tensor g3" ||
      canonical === "dimensity 9200" ||
      canonical === "dimensity 8300"
    ) {
      return 90;
    }

    // Upper Middle Tier
    if (
      canonical === "snapdragon 8+ gen 1" ||
      canonical === "snapdragon 8 gen 1" ||
      canonical === "apple a15 bionic" ||
      canonical === "dimensity 8200" ||
      canonical === "exynos 2200" ||
      canonical === "google tensor g2"
    ) {
      return 82;
    }

    // Middle Tier (Standard)
    if (
      canonical === "snapdragon 7 series" ||
      canonical.includes("snapdragon 7") ||
      canonical === "dimensity 7200" ||
      canonical === "exynos 1480" ||
      canonical === "helio g99" ||
      canonical === "snapdragon 6 series" ||
      canonical.includes("snapdragon 6")
    ) {
      return 72;
    }

    // Budget Tier
    return 60;
  }

  /**
   * 1. Performance Score (0-100)
   * Evaluates Processor tier combined with RAM capacity safely using normalized data.
   */
  public static calculatePerformanceScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);
    const cpuRaw = this.evaluateCpuScore(norm.cpuNormalized || "");
    
    // RAM scale: standard 8GB default if missing or invalid
    const ramGB = norm.ramGB > 0 ? norm.ramGB : 8;
    let ramScore = 50;
    if (ramGB >= 16) ramScore = 100;
    else if (ramGB >= 12) ramScore = 90;
    else if (ramGB >= 8) ramScore = 75;
    else if (ramGB >= 6) ramScore = 60;
    else ramScore = 40;

    const performance = Math.round(cpuRaw * 0.70 + ramScore * 0.30);
    return Math.min(100, Math.max(0, performance));
  }

  /**
   * 2. Camera Score (0-100)
   * Evaluates Megapixels coupled with sensory layout, OIS and brand-specific ISP logic purely from normalized values.
   */
  public static calculateCameraScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);

    // Main camera Megapixels
    const mp = norm.cameraMainMegapixels > 0 ? norm.cameraMainMegapixels : 50;
    let mpScore = 50;
    if (mp >= 200) mpScore = 95;
    else if (mp >= 108) mpScore = 90;
    else if (mp >= 50) mpScore = 80;
    else if (mp >= 48) mpScore = 76;
    else if (mp >= 12) mpScore = 65;

    // Optical Zoom bonus from normalized optical zoom
    let zoomBonus = 0;
    const zoom = norm.cameraOpticalZoom || 0;
    if (zoom >= 5) zoomBonus = 15;
    else if (zoom >= 3) zoomBonus = 12;
    else if (zoom >= 2) zoomBonus = 8;

    // OIS Presence bonus from normalized OIS status
    const oisBonus = norm.cameraOisPresence ? 10 : 0;

    // Secondary details lens fallback
    let lensBonus = 5;
    const text = (phone.camera || "").toLowerCase().trim();
    if (
      text.includes("triple") || 
      text.includes("quad") || 
      text.includes("ثلاثية") || 
      text.includes("رباعية")
    ) {
      lensBonus = 10;
    }

    // Brand-specific ISP processing optimization
    const brand = (phone.brand || "").toLowerCase().trim();
    const brandBonus = (brand === "apple" || brand === "google" || brand === "samsung" || brand === "xiaomi") ? 8 : 0;

    const camera = mpScore + zoomBonus + oisBonus + lensBonus + brandBonus;
    return Math.min(100, Math.max(0, camera));
  }

  /**
   * 3. Display Score (0-100)
   * Evaluates Refresh rate, screen panel type and brightness/HDR indicators purely on normalized values.
   */
  public static calculateDisplayScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);

    // Refresh rate scoring
    const hz = norm.screenRefreshRateHz > 0 ? norm.screenRefreshRateHz : 120;
    let refreshScore = 60;
    if (hz >= 144) refreshScore = 100;
    else if (hz >= 120) refreshScore = 92;
    else if (hz >= 90) refreshScore = 78;

    // Panel type evaluation of display category (OLED, AMOLED, etc.)
    let panelScore = 60; // Standard LCD default
    const category = norm.displayCategory || "";
    if (category === "LTPO AMOLED" || category === "Dynamic AMOLED" || category === "Super Retina XDR") {
      panelScore = 98;
    } else if (category === "AMOLED" || category === "OLED") {
      panelScore = 94;
    }

    // Brightness/Resolution highlights from original spec descriptor safely
    let bonus = 0;
    const lowerScreen = (phone.screen || "").toLowerCase();
    if (
      lowerScreen.includes("hdr") || 
      lowerScreen.includes("dolby") || 
      lowerScreen.includes("nits") || 
      lowerScreen.includes("شمعة") ||
      lowerScreen.includes("1200") ||
      lowerScreen.includes("2000") ||
      lowerScreen.includes("2600")
    ) {
      bonus = 8;
    }

    // Screen ergonomics size points
    const size = norm.screenSizeInches;
    if (size >= 6.1 && size <= 6.9) {
      bonus += 4;
    }

    const display = Math.round(panelScore * 0.50 + refreshScore * 0.45 + bonus);
    return Math.min(100, Math.max(0, display));
  }

  /**
   * 4. Battery Score (0-100)
   * Rates absolute capacity scale paired with OS/processor runtime optimizations using normalized capacity.
   */
  public static calculateBatteryScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);
    const capacity = norm.batteryCapacity > 0 ? norm.batteryCapacity : 5000;

    let capacityScore = 50;
    if (capacity >= 6000) capacityScore = 100;
    else if (capacity >= 5500) capacityScore = 94;
    else if (capacity >= 5000) capacityScore = 85;
    else if (capacity >= 4500) capacityScore = 74;
    else if (capacity >= 4000) capacityScore = 65;
    else if (capacity >= 3000) capacityScore = 55;

    // Processor efficiency bonus using normalized CPU identifier
    const cpuNorm = norm.cpuNormalized || "";
    const isEfficientChip = 
      cpuNorm.includes("A18") || 
      cpuNorm.includes("A17") || 
      cpuNorm.includes("Gen 3") || 
      cpuNorm.includes("Elite") ||
      cpuNorm.includes("9400");
    const efficiencyBonus = isEfficientChip ? 6 : 0;

    // Apple battery life system optimization
    const brand = (phone.brand || "").toLowerCase().trim();
    const iosBonus = brand === "apple" ? 12 : 0;

    const battery = capacityScore + efficiencyBonus + iosBonus;
    return Math.min(100, Math.max(0, battery));
  }

  /**
   * 5. Charging Score (0-100)
   * Computes wired charging speed combined with wireless fallback bonuses using normalized parameters.
   */
  public static calculateChargingScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);
    const watts = norm.chargingSpeedWatts > 0 ? norm.chargingSpeedWatts : 33;

    let chargingScore = 40;
    if (watts >= 120) chargingScore = 98;
    else if (watts >= 80) chargingScore = 90;
    else if (watts >= 65) chargingScore = 84;
    else if (watts >= 45) chargingScore = 75;
    else if (watts >= 33) chargingScore = 66;
    else if (watts >= 25) chargingScore = 58;
    else if (watts >= 15) chargingScore = 50;

    const wirelessBonus = norm.hasWirelessCharging ? 15 : 0;
    
    const charging = chargingScore + wirelessBonus;
    return Math.min(100, Math.max(0, charging));
  }

  /**
   * 6. Storage Score (0-100)
   * Rates storage capacity coupled with high-density RAM support values using normalized data.
   */
  public static calculateStorageScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);
    const storage = norm.storageGB > 0 ? norm.storageGB : 128;

    let storageScore = 40;
    if (storage >= 1024) storageScore = 100;
    else if (storage >= 512) storageScore = 94;
    else if (storage >= 256) storageScore = 82;
    else if (storage >= 128) storageScore = 68;
    else if (storage >= 64) storageScore = 52;

    const ramBonus = norm.ramGB >= 12 ? 8 : (norm.ramGB >= 8 ? 4 : 0);

    const storageOverall = storageScore + ramBonus;
    return Math.min(100, Math.max(0, storageOverall));
  }

  /**
   * 7. Software Score (0-100)
   * Evaluates brand OS lifecycle support standards and versions.
   */
  public static calculateSoftwareScore(phone: Smartphone): number {
    const brandName = (phone.brand || "").toLowerCase().trim();
    const otherSpecs = (phone.other_specs || "").toLowerCase();

    let supportScore = 65;
    if (brandName === "google" || brandName === "samsung") {
      supportScore = 94;
    } else if (brandName === "apple") {
      supportScore = 92;
    } else if (brandName === "oneplus" || brandName === "xiaomi" || brandName === "asus") {
      supportScore = 84;
    } else if (brandName === "poco" || brandName === "realme" || brandName === "nothing") {
      supportScore = 76;
    }

    // Checking for long-term support text markers
    if (
      otherSpecs.includes("7 years") || 
      otherSpecs.includes("7 سنوات") || 
      otherSpecs.includes("تحديثات لمد")
    ) {
      supportScore = Math.max(supportScore, 98);
    }

    // Check modern system versions
    let versionBonus = 0;
    if (
      otherSpecs.includes("android 14") || 
      otherSpecs.includes("android 15") || 
      otherSpecs.includes("ios 18") || 
      otherSpecs.includes("hyperos")
    ) {
      versionBonus = 4;
    }

    const software = supportScore + versionBonus;
    return Math.min(100, Math.max(0, software));
  }

  /**
   * 8. Value Score (0-100)
   * Computes specifications performance relative to cost index.
   */
  public static calculateValueScore(phone: Smartphone, categoryScores: Omit<CategoryScores, "value" | "price" | "connectivity">): number {
    const norm = normalizePhoneSpecs(phone);
    const rawPrice = norm.priceUSD > 0 ? norm.priceUSD : 500;

    // Comprehensive hardware quality factor
    const hwFactor = (
      categoryScores.display + 
      categoryScores.performance + 
      categoryScores.camera + 
      categoryScores.battery + 
      categoryScores.charging + 
      categoryScores.storage + 
      categoryScores.software
    ) / 7;

    // Price scaling factor: lower prices receive significantly higher values
    let priceScore = 45;
    if (rawPrice <= 200) priceScore = 98;
    else if (rawPrice <= 350) priceScore = 90;
    else if (rawPrice <= 550) priceScore = 78;
    else if (rawPrice <= 850) priceScore = 64;
    else if (rawPrice <= 1100) priceScore = 52;

    // Weighted specifications-to-price value metric
    const value = Math.round(hwFactor * 0.40 + priceScore * 0.60);
    return Math.min(100, Math.max(0, value));
  }

  /**
   * Helper for standard build/connectivity evaluation to preserve compatibility.
   */
  public static calculateConnectivityScore(phone: Smartphone): number {
    const norm = normalizePhoneSpecs(phone);
    const buildText = (phone.other_specs || "").toLowerCase();

    const isIp68 = norm.isWaterResistant || buildText.includes("ip68") || buildText.includes("ip67");
    const waterScore = isIp68 ? 45 : 20;

    const premiumBuildBonus = 
      buildText.includes("titanium") || 
      buildText.includes("تيتانيوم") || 
      buildText.includes("glass") || 
      buildText.includes("زجاج") ||
      buildText.includes("framer") ? 35 : 15;

    const portScore = buildText.includes("usb-c") || buildText.includes("منفذ") || buildText.includes("wifi 7") ? 20 : 15;

    const connectivity = waterScore + premiumBuildBonus + portScore;
    return Math.min(100, Math.max(0, connectivity));
  }

  /**
   * Calculates gpu performance score based on name.
   */
  public static calculateGpuScore(phone: Smartphone): number {
    const gpuText = (phone.gpu || "").toLowerCase();
    if (!gpuText) return 50;
    if (gpuText.includes("apple") && gpuText.includes("6-core")) return 98;
    if (gpuText.includes("adreno 830") || gpuText.includes("elite")) return 100;
    if (gpuText.includes("adreno 750") || gpuText.includes("8 gen 3")) return 95;
    if (gpuText.includes("mali-g720") || gpuText.includes("immortalis")) return 92;
    if (gpuText.includes("adreno") || gpuText.includes("mali")) return 75;
    return 65;
  }

  /**
   * Calculates antutu score based on absolute value out of 3,000,000.
   */
  public static calculateAntutuScore(phone: Smartphone): number {
    const val = parseInt((phone.antutu || "").replace(/[^0-9]/g, ""));
    if (isNaN(val) || val <= 0) return 50;
    return Math.round(Math.min(100, Math.max(10, (val / 30000))));
  }

  /**
   * Calculates geekbench score based on Multi Geekbench out of 10,000.
   */
  public static calculateGeekbenchScore(phone: Smartphone): number {
    const singleVal = parseInt((phone.geekbenchSingle || "").replace(/[^0-9]/g, ""));
    const multiVal = parseInt((phone.geekbenchMulti || "").replace(/[^0-9]/g, ""));
    
    let single = singleVal || 1500;
    let multi = multiVal || 4505;
    
    if (isNaN(singleVal) || isNaN(multiVal)) {
      const matchS = (phone.geekbench || "").match(/Single:\s*(\d+)/i);
      const matchM = (phone.geekbench || "").match(/Multi:\s*(\d+)/i);
      if (matchS?.[1]) single = parseInt(matchS[1]);
      if (matchM?.[1]) multi = parseInt(matchM[1]);
    }
    
    return Math.round(Math.min(100, Math.max(10, (multi / 100))));
  }

  /**
   * Calculates IP water resistance rating out of 100.
   */
  public static calculateWaterResistanceScore(phone: Smartphone): number {
    const text = (phone.waterResistance || phone.water_resistance || "").toLowerCase();
    if (text.includes("ip68")) return 100;
    if (text.includes("ip67")) return 85;
    if (text.includes("ip54") || text.includes("splash") || text.includes("رشاشات")) return 60;
    return 40;
  }

  /**
   * Calculates 5G network compatibility out of 100.
   */
  public static calculateSupports5GScore(phone: Smartphone): number {
    const supports = phone.supports5G === true || phone.has5g === true || (phone.has5g === "true");
    return supports ? 100 : 40;
  }

  /**
   * Calculates comprehensive category-specific scores for a single device.
   */
  public static calculateSingleCategoryScores(phone: Smartphone): CategoryScores {
    const norm = normalizePhoneSpecs(phone);

    const display = this.calculateDisplayScore(phone);
    const performance = this.calculatePerformanceScore(phone);
    const camera = this.calculateCameraScore(phone);
    const battery = this.calculateBatteryScore(phone);
    const charging = this.calculateChargingScore(phone);
    const storage = this.calculateStorageScore(phone);
    const software = this.calculateSoftwareScore(phone);
    const connectivity = this.calculateConnectivityScore(phone);

    const gpu = this.calculateGpuScore(phone);
    const antutu = this.calculateAntutuScore(phone);
    const geekbench = this.calculateGeekbenchScore(phone);
    const waterResistance = this.calculateWaterResistanceScore(phone);
    const supports5G = this.calculateSupports5GScore(phone);

    // Dynamic specs-to-cost value calculation
    const value = this.calculateValueScore(phone, {
      display,
      performance,
      camera,
      battery,
      charging,
      storage,
      software
    });

    // Inverse price score factor to maintain compatibility references
    const basePrice = Math.max(100, norm.priceUSD);
    const price = Math.round(Math.min(100, Math.max(10, (1400 - basePrice) / 13)));

    return {
      display,
      performance,
      camera,
      battery,
      charging,
      storage,
      connectivity,
      software,
      value,
      price,
      gpu,
      antutu,
      geekbench,
      waterResistance,
      supports5G
    };
  }

  /**
   * Calculates final weighted overall score out of 100 based on weights configuration.
   */
  public static calculateOverallScore(scores: CategoryScores, weights: ScoringWeightConfig = DEFAULT_WEIGHTS): number {
    const overall = (
      (scores.performance * weights.performance) +
      (scores.display * weights.display) +
      (scores.camera * weights.camera) +
      (scores.battery * weights.battery) +
      (scores.charging * weights.charging) +
      (scores.storage * weights.storage) +
      (scores.software * weights.software) +
      (scores.value * weights.value)
    );

    return Math.min(100, Math.max(10, Math.round(overall)));
  }

  /**
   * Generates a bulletproof Arabic tech review explanation for compared smartphones.
   */
  public static generateWinnerExplanation(winnerName: string, winnerScore: number, winnerScores: CategoryScores, competitorName: string, competitorScore: number, competitorScores: CategoryScores): string {
    const advantages: { categoryName: string; diff: number }[] = [];
    const categoriesMap = [
      { key: "performance", name: "الأداء وسرعة المعالجة" },
      { key: "display", name: "جودة الشاشة ومعدل التحديث" },
      { key: "camera", name: "أداء التصوير والكاميرات" },
      { key: "battery", name: "سعة البطارية ومقاومة التفريغ" },
      { key: "charging", name: "سرعة الشحن وإمداد الطاقة" },
      { key: "storage", name: "سرعة التخزين وحجم الذاكرة" },
      { key: "software", name: "دعم النظام والتحديثات المستقبلية" },
      { key: "value", name: "المعادلة السعرية والجدوى الاقتصادية" }
    ];

    categoriesMap.forEach(cat => {
      const wScore = winnerScores[cat.key as keyof CategoryScores] || 0;
      const cScore = competitorScores[cat.key as keyof CategoryScores] || 0;
      const diff = wScore - cScore;
      if (diff > 0) {
        advantages.push({ categoryName: cat.name, diff });
      }
    });

    // Sort advantages descendingly to show biggest gaps first
    advantages.sort((a, b) => b.diff - a.diff);

    let explanation = `يتفوق **${winnerName}** على منافسه الشرس **${competitorName}** بمجموع فني كلي يبلغ **${winnerScore}/100** نقطة مقابل **${competitorScore}/100** نقطة للخصم الشقيق. `;

    if (advantages.length > 0) {
      explanation += `ويرتكز تفوقه الفني على مميزات تكتيكية حاسمة تشمل: `;
      const highlights = advantages.map(a => `**${a.categoryName}** (+${Math.round(a.diff)} نقطة)`);
      explanation += highlights.slice(0, 3).join(" و") + ".";
    } else {
      explanation += `يتقارب الهاتفان بشدة في تجربة الأداء الشاملة بفروق طفيفة ميكروية لا تكاد تذكر في الاستخدام اليومي العام.`;
    }

    return explanation;
  }
}
