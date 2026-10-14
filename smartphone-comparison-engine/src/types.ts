/**
 * Smartphone Normalized representation for strict specifications comparison
 */
export interface SmartphoneNormalized {
  ramGB: number;               // Normalized RAM value (e.g., 12)
  storageGB: number;           // Normalized storage capacity (e.g., 256)
  batteryCapacity: number;     // Normalized battery capacity in mAh (e.g., 5000)
  chargingSpeedWatts: number;  // Normalized charging speed in watts (e.g., 45)
  screenSizeInches: number;    // Normalized screen size (e.g., 6.8)
  screenRefreshRateHz: number; // Normalized screen refresh rate (e.g., 120)
  cameraMainMegapixels: number;// Normalized main camera megapixel count (e.g., 200)
  priceUSD: number;            // Normalized numerical price in USD (e.g., 999)
  hasWirelessCharging: boolean;// Normalized boolean flag
  isWaterResistant: boolean;   // Normalized water resistance rating flag (IP68+)
  cpuNormalized?: string;      // Normalized/Canonical CPU string
  displayCategory?: string;    // Normalized display category
  cameraOpticalZoom?: number;  // Normalized optical zoom factor
  cameraOisPresence?: boolean; // OIS presence flag
}

/**
 * Technical specification confidence scoring and anomaly detection representation
 */
export interface SpecificationConfidence {
  overallScore: number;       // Confidence score (0-100)
  missingFields: string[];     // Formally hollow fields or fields set to fallback text
  estimatedFields: string[];   // Fields containing approximate/estimated indicators
  uncertainFields: string[];   // Fields flagged with low certainty indicators
}

/**
 * Smartphone Specification Interface (Canonical Master Schema)
 */
export interface Smartphone {
  name: string;
  brand: string;
  screen: string;
  processor: string;
  camera: string;
  battery: string;
  charging: string;
  storage: string;
  price_range?: string;
  other_specs?: string;
  normalized?: SmartphoneNormalized;
  confidence?: SpecificationConfidence;

  // Phase 4 - Image System Support (Unified URL references)
  thumbnail?: string;
  heroImage?: string;
  brandLogo?: string;

  // Phase 5 - Data Quality & Auditing Version Control
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  confidenceScore?: number;

  // Premium Specs fields requested for NanoReview style dashboard
  releaseYear?: string;
  gpu?: string;
  os?: string;
  antutu?: string;
  geekbench?: string;
  geekbenchSingle?: string;
  geekbenchMulti?: string;
  weight?: string;
  dimensions?: string;
  water_resistance?: string;
  waterResistance?: string;
  fingerprint?: string;
  has5g?: boolean | string;
  supports5G?: boolean;
  otherSpecs?: string;
}

/**
 * Pre-defined default comparisons to make onboarding fun
 */
export interface SmartphoneComparisonTemplate {
  title: string;
  phoneA: Smartphone;
  phoneB: Smartphone;
}

/**
 * Comparison prompt request/response interfaces
 */
export interface CompareRequest {
  phoneA: Smartphone;
  phoneB: Smartphone;
}

export interface CompareResponse {
  markdown: string;
  analyzedAt: string;
}
