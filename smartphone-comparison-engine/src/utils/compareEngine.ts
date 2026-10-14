import { Smartphone, SmartphoneNormalized } from "../types";
import { normalizePhoneSpecs } from "./normalizationPipeline";
import { 
  ScoringService, 
  CategoryScores, 
  ScoringWeightConfig, 
  DEFAULT_WEIGHTS 
} from "../services/scoring.service";

// Re-export CategoryScores, ScoringWeightConfig, and DEFAULT_WEIGHTS from the scoring service to maintain backwards compatibility
export type { CategoryScores, ScoringWeightConfig };
export { DEFAULT_WEIGHTS };

/**
 * Complete comparative analysis result computed for a specific device.
 */
export interface SmartphoneCalculatedResult {
  phone: Smartphone;
  normalizedSpecs: SmartphoneNormalized;
  categoryScores: CategoryScores;
  overallScore: number;
  rank: number;
  winnerExplanation?: string;
  highlights: {
    isBestValue: boolean;
    isHighestBattery: boolean;
    isBestCamera: boolean;
    isBestPerformance: boolean;
    isFastestCharging: boolean;
  };
}

/**
 * Heuristically assigns a performance tier score based on CPU model descriptors.
 * Delegated to ScoringService for unified Scoring Engine V2 evaluations.
 */
export function evaluateCpuScore(processor: string): number {
  return ScoringService.evaluateCpuScore(processor);
}

/**
 * Heuristically evaluates software quality score based on brand and specifications.
 * Delegated to ScoringService for unified Scoring Engine V2 evaluations.
 */
export function evaluateSoftwareScore(brand: string, otherSpecs: string): number {
  return ScoringService.calculateSoftwareScore({
    name: "",
    brand,
    other_specs: otherSpecs,
    screen: "",
    processor: "",
    camera: "",
    battery: "",
    charging: "",
    storage: ""
  });
}

/**
 * Deterministically generates an Arabic tech review verdict and comparative explanation.
 * Delegated to ScoringService for unified Scoring Engine V2 evaluations.
 */
export function generateWinnerExplanation(winner: SmartphoneCalculatedResult, competitor: SmartphoneCalculatedResult): string {
  return ScoringService.generateWinnerExplanation(
    winner.phone.name,
    winner.overallScore,
    winner.categoryScores,
    competitor.phone.name,
    competitor.overallScore,
    competitor.categoryScores
  );
}

/**
 * Multiphone Comparison Scoring Engine V2 that scores any combination of 2 to 6 phones with customizable weights.
 */
export function calculateMultiComparison(
  phones: Smartphone[], 
  weightsConfig: ScoringWeightConfig = DEFAULT_WEIGHTS
): SmartphoneCalculatedResult[] {
  if (phones.length === 0) return [];

  // Step 1: Normalize all phones to ensure uniform numerical comparisons
  const processedList = phones.map(p => ({
    phone: p,
    norm: normalizePhoneSpecs(p),
  }));

  // Step 2: Establish base comparison maximums for relative highlighting
  let maxBattery = 0;
  let maxCamera = 0;
  let maxRam = 0;
  let maxCharging = 0;
  
  processedList.forEach(({ norm }) => {
    if (norm.batteryCapacity > maxBattery) maxBattery = norm.batteryCapacity;
    if (norm.cameraMainMegapixels > maxCamera) maxCamera = norm.cameraMainMegapixels;
    if (norm.ramGB > maxRam) maxRam = norm.ramGB;
    if (norm.chargingSpeedWatts > maxCharging) maxCharging = norm.chargingSpeedWatts;
  });

  // Step 3: Compute raw category scores and overall scores for each device on a scale of 0-100 via ScoringService V2
  const initialCalculations: SmartphoneCalculatedResult[] = processedList.map(({ phone, norm }) => {
    const categoryScores = ScoringService.calculateSingleCategoryScores(phone);
    const overallScore = ScoringService.calculateOverallScore(categoryScores, weightsConfig);

    return {
      phone,
      normalizedSpecs: norm,
      categoryScores,
      overallScore,
      rank: 1, // Will compute index
      highlights: {
        isBestValue: false,
        isHighestBattery: false,
        isBestCamera: false,
        isBestPerformance: false,
        isFastestCharging: false,
      }
    };
  });

  // Calculate dynamic highlights comparison
  let bestValueIdx = 0;
  let bestValueScore = -1;
  
  initialCalculations.forEach((item, idx) => {
    if (item.categoryScores.value > bestValueScore) {
      bestValueScore = item.categoryScores.value;
      bestValueIdx = idx;
    }

    if (item.normalizedSpecs.ramGB === maxRam && maxRam > 0) {
      item.highlights.isBestPerformance = true;
    }

    if (item.normalizedSpecs.cameraMainMegapixels === maxCamera && maxCamera > 0) {
      item.highlights.isBestCamera = true;
    }

    if (item.normalizedSpecs.batteryCapacity === maxBattery && maxBattery > 0) {
      item.highlights.isHighestBattery = true;
    }

    if (item.normalizedSpecs.chargingSpeedWatts === maxCharging && maxCharging > 0) {
      item.highlights.isFastestCharging = true;
    }
  });

  if (initialCalculations[bestValueIdx]) {
    initialCalculations[bestValueIdx].highlights.isBestValue = true;
  }

  // Calculate ranking numbers sort descend based on Overall Score
  const sortedCalculations = [...initialCalculations].sort((a, b) => b.overallScore - a.overallScore);
  sortedCalculations.forEach((item, index) => {
    const originalItem = initialCalculations.find(ic => ic.phone.name === item.phone.name);
    if (originalItem) {
      originalItem.rank = index + 1;
    }
  });

  // Inject deterministic Arabic explanatory verdict if comparing exactly 2 devices
  if (initialCalculations.length === 2) {
    const [itemA, itemB] = initialCalculations;
    if (itemA.overallScore >= itemB.overallScore) {
      itemA.winnerExplanation = generateWinnerExplanation(itemA, itemB);
      itemB.winnerExplanation = itemA.winnerExplanation;
    } else {
      itemA.winnerExplanation = generateWinnerExplanation(itemB, itemA);
      itemB.winnerExplanation = itemA.winnerExplanation;
    }
  }

  return initialCalculations;
}

/**
 * Multi-Phone Comparison Preset Templates
 */
export interface MultiPhoneTemplate {
  id: string;
  title: string;
  description: string;
  phoneNames: string[];
}

export const comparisonTemplates: MultiPhoneTemplate[] = [
  {
    id: "premium-flagships",
    title: "مواجهة الهواتف الرائدة الخارقة (Flagships)",
    description: "مقارنة شاملة بين عمالقة السوق التكنولوجية العالمية بقمة الإمكانيات والأسعار.",
    phoneNames: ["iPhone 16 Pro Max", "Samsung Galaxy S24 Ultra", "Xiaomi 14 Ultra", "OnePlus 12"]
  },
  {
    id: "gaming-beasts",
    title: "وحوش الألعاب والتردد العالي (Gaming)",
    description: "ترشيح لسرعات الشحن الصاروخية ومعدلات التحديث الخارقة (144Hz+) والبطارية المتطورة.",
    phoneNames: ["Asus ROG Phone 8 Pro", "OnePlus 12", "POCO F6 Pro", "Xiaomi 14 Ultra"]
  },
  {
    id: "camera-masters",
    title: "ملوك التصوير الفني والعدسات العملاقة (Camera)",
    description: "تركيز كامل على دقة الميجابكسل ومقاسات الحساس ومثبت التصوير البصري والسرعة.",
    phoneNames: ["Xiaomi 14 Ultra", "Samsung Galaxy S24 Ultra", "iPhone 16 Pro Max", "Google Pixel 8 Pro"]
  },
  {
    id: "value-kings",
    title: "أبطال الميزانية والقيمة مقابل السعر (Budget/Value)",
    description: "أقوى الهواتف الحاصلة على كفاءة أداء ممتازة وبأسعار اقتصادية في متناول اليد.",
    phoneNames: ["POCO X6 Pro", "POCO F6 Pro", "Nothing Phone (2)", "Google Pixel 8"]
  }
];

/**
 * Converts dynamic phone comparison into a structured text clipboard markdown payload for exporting.
 */
export function formatComparisonForExport(calculated: SmartphoneCalculatedResult[]): string {
  let output = `## تقرير مقارنة الهواتف المتعددة الذكي - TechCompare Pro\n\n`;
  output += `تاريخ استخراج التقرير: ${new Date().toLocaleDateString("ar-EG")}\n\n`;
  
  output += `| المعيار | ` + calculated.map(c => `**${c.phone.name}**`).join(" | ") + ` |\n`;
  output += `| --- | ` + calculated.map(() => `---`).join(" | ") + ` |\n`;
  
  output += `| **الشركة المصنعة** | ` + calculated.map(c => c.phone.brand).join(" | ") + ` |\n`;
  output += `| **الأداء العام** | ` + calculated.map(c => `🏆 Rank #${c.rank} (${c.overallScore}/100)`).join(" | ") + ` |\n`;
  output += `| **الشاشة** | ` + calculated.map(c => `${c.normalizedSpecs.screenSizeInches} بوصة (${c.normalizedSpecs.screenRefreshRateHz}Hz)`).join(" | ") + ` |\n`;
  output += `| **المعالج** | ` + calculated.map(c => c.phone.processor).join(" | ") + ` |\n`;
  output += `| **الكاميرا** | ` + calculated.map(c => `${c.normalizedSpecs.cameraMainMegapixels}MP`).join(" | ") + ` |\n`;
  output += `| **البطارية الشحن** | ` + calculated.map(c => `${c.normalizedSpecs.batteryCapacity}mAh (${c.normalizedSpecs.chargingSpeedWatts}W)`).join(" | ") + ` |\n`;
  output += `| **السعر التقريبي** | ` + calculated.map(c => `$${c.normalizedSpecs.priceUSD}`).join(" | ") + ` |\n`;
  
  output += `\n### 💡 التوصيات الذكية:\n`;
  calculated.forEach(c => {
    const featureHighlights: string[] = [];
    if (c.highlights.isBestValue) featureHighlights.push("أفضل قيمة تقريبية مقابل السعر 💰");
    if (c.highlights.isBestPerformance) featureHighlights.push("أقصى عتاد أداء ومساحة رام عشوائية 🔥");
    if (c.highlights.isBestCamera) featureHighlights.push("أدق مستشعر كاميرا رئيسية 📸");
    if (c.highlights.isHighestBattery) featureHighlights.push("أعلى سعة بطارية عملاقة للتنقل 🔋");
    if (c.highlights.isFastestCharging) featureHighlights.push("سرعة شحن خارقة بالواط ⚡");

    if (featureHighlights.length > 0) {
      output += `- **${c.phone.name}**: ${featureHighlights.join(" ، ")}\n`;
    }
  });

  return output;
}
