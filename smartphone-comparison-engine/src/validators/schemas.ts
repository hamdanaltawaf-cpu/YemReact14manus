import { z } from "zod";

export const SmartphoneNormalizedSchema = z.object({
  ramGB: z.number().default(8),
  storageGB: z.number().default(128),
  batteryCapacity: z.number().default(5000),
  chargingSpeedWatts: z.number().default(33),
  screenSizeInches: z.number().default(6.5),
  screenRefreshRateHz: z.number().default(120),
  cameraMainMegapixels: z.number().default(50),
  priceUSD: z.number().default(500),
  hasWirelessCharging: z.boolean().default(false),
  isWaterResistant: z.boolean().default(false),
});

export const SpecificationConfidenceSchema = z.object({
  overallScore: z.number().min(0).max(100).default(100),
  missingFields: z.array(z.string()).default([]),
  estimatedFields: z.array(z.string()).default([]),
  uncertainFields: z.array(z.string()).default([]),
});

/**
 * Zod schema for Smartphone specifications
 */
export const SmartphoneSchema = z.object({
  name: z.string().min(1, "اسم الهاتف مطلوب"),
  brand: z.string().default("غير معروف"),
  screen: z.string().default("غير متوفر"),
  processor: z.string().default("غير متوفر"),
  camera: z.string().default("غير متوفر"),
  battery: z.string().default("غير متوفر"),
  charging: z.string().default("غير متوفر"),
  storage: z.string().default("غير متوفر"),
  price_range: z.string().optional().default("غير محدد"),
  other_specs: z.string().optional().default("غير متوفر"),
  normalized: SmartphoneNormalizedSchema.optional(),
  confidence: SpecificationConfidenceSchema.optional(),
});

/**
 * Zod schema for comparison request payload
 */
export const CompareRequestSchema = z.object({
  phoneA: SmartphoneSchema,
  phoneB: SmartphoneSchema,
});

/**
 * Zod schema for comparison response payload
 */
export const CompareResponseSchema = z.object({
  markdown: z.string().min(1, "تقرير المقارنة فارغ"),
  analyzedAt: z.string().datetime().or(z.string()),
});

/**
 * Zod schema for search payload
 */
export const SearchPayloadSchema = z.object({
  query: z.string().min(1, "استعلام البحث مطلوب"),
});

/**
 * Zod schema for AI response holding specs
 */
export const AISpecsResponseSchema = z.object({
  specs: SmartphoneSchema,
});

/**
 * Zod schema for generate specs request
 */
export const GenerateSpecsSchema = z.object({
  name: z.string().min(1, "اسم الهاتف مطلوب"),
});

/**
 * Zod schema for AI advisor chat request
 */
export const AdvisorChatSchema = z.object({
  phoneA: SmartphoneSchema,
  phoneB: SmartphoneSchema,
  question: z.string().min(1, "السؤال مطلوب"),
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    text: z.string()
  })).optional().default([]),
});

/**
 * Zod schema for Bulk Actions request
 */
export const BulkActionSchema = z.object({
  action: z.string().min(1, "نوع الإجراء الجماعي مطلوب"),
  phoneNames: z.array(z.string()).min(1, "يرجى تحديد هاتف واحد على الأقل"),
  payload: z.any().optional(),
});

/**
 * Zod schema for Brand creation/edit
 */
export const BrandSchema = z.object({
  name: z.string().min(1, "اسم الشركة المصنعة مطلوب"),
  logoEmoji: z.string().optional(),
  originCountry: z.string().optional(),
});

/**
 * Zod schema for Admin Supervisor invitation
 */
export const AdminInviteSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
});

/**
 * Zod schema for Gemini Engine Configuration
 */
export const GeminiConfigSchema = z.object({
  model: z.string().min(1, "اسم النموذج مطلوب"),
  temperature: z.number().min(0).max(2).optional(),
});

/**
 * Zod schema for Backup JSON Import
 */
export const BackupImportSchema = z.object({
  database: z.object({
    phones: z.array(z.any()).optional(),
    brands: z.array(z.any()).optional(),
  }),
});

/**
 * Zod schema for AI Import request
 */
export const AIImportSchema = z.object({
  name: z.string().min(1, "اسم الهاتف للبحث والإنشاء مطلوب"),
});

/**
 * Normalizes and validates raw phone specs to guarantee safe execution
 */
export function validateAndNormalizePhone(rawSpecs: any) {
  const result = SmartphoneSchema.safeParse(rawSpecs);
  if (result.success) {
    return result.data;
  }
  
  // Fallback defaults with safe values
  return {
    name: typeof rawSpecs?.name === "string" ? rawSpecs.name : "هاتف غير معروف",
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
