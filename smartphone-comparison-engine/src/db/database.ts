import * as fs from "fs";
import * as path from "path";
import { 
  BrandEntity, 
  ChipsetEntity, 
  DisplayEntity, 
  BatteryEntity, 
  CameraEntity, 
  PriceEntity, 
  PhoneEntity, 
  ReviewEntity 
} from "./schema";
import { Smartphone } from "../types";
import { extendedPhones } from "../data/defaultPhones";
import { 
  normalizePhoneSpecs, 
  scoreSpecificationConfidence, 
  processSpecPipeline 
} from "../utils/normalizationPipeline";

// High-performance Memory-based SQL/Relational Database Engine with local file storage backup potential
export class RelationalDatabase {
  private static instance: RelationalDatabase | null = null;

  // Tables
  public brands = new Map<string, BrandEntity>();
  public chipsets = new Map<string, ChipsetEntity>();
  public displays = new Map<string, DisplayEntity>();
  public batteries = new Map<string, BatteryEntity>();
  public cameras = new Map<string, CameraEntity>();
  public prices = new Map<string, PriceEntity>();
  public phones = new Map<string, PhoneEntity>();
  public reviews = new Map<string, ReviewEntity[]>(); // Grouped by phoneId

  private constructor() {
    this.seedDatabase();
  }

  public static getInstance(): RelationalDatabase {
    if (!RelationalDatabase.instance) {
      RelationalDatabase.instance = new RelationalDatabase();
    }
    return RelationalDatabase.instance;
  }

  /**
   * Reset database (mainly for testing)
   */
  public clear(): void {
    this.brands.clear();
    this.chipsets.clear();
    this.displays.clear();
    this.batteries.clear();
    this.cameras.clear();
    this.prices.clear();
    this.phones.clear();
    this.reviews.clear();
    this.seedDatabase();
  }

  /**
   * Automatically generate stable ID/Slug from phone name
   */
  public generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-") // Keep arabic letters and english letters/numbers
      .replace(/^-+|-+$/g, "");
  }

  /**
   * SEEDING LAYER: Deconstruct flat structures into normalized relational storage
   */
  private seedDatabase(): void {
    console.log("[Database] Initiating seeding of relational entities...");
    
    const dbDir = path.join(process.cwd(), "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const BRANDS_FILE_PATH = path.join(dbDir, "brands.json");
    const PHONES_FILE_PATH = path.join(dbDir, "phones.json");

    let brandsLoaded = false;
    if (fs.existsSync(BRANDS_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(BRANDS_FILE_PATH, "utf-8");
        const list: BrandEntity[] = JSON.parse(fileContent);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(b => {
            const bId = b.id || b.name.toLowerCase().trim();
            this.brands.set(bId, {
              ...b,
              id: bId,
              logoEmoji: b.logoEmoji || b.logo || "📱",
              originCountry: b.originCountry || b.country || "غير محدد",
              country: b.country || b.originCountry || "غير محدد",
              founded: b.founded || 2010,
              logo: b.logo || b.logoEmoji || "📱",
              website: b.website || "",
              shortDescription: b.shortDescription || "",
              totalPhones: b.totalPhones || 0
            });
          });
          brandsLoaded = true;
          console.log(`[Database] Loaded ${this.brands.size} brands from ${BRANDS_FILE_PATH}`);
        }
      } catch (e) {
        console.error("[Database] Error loading brands from file:", e);
      }
    }

    if (!brandsLoaded) {
      const defaultBrands: BrandEntity[] = [
        { id: "apple", name: "Apple", logoEmoji: "🍏", originCountry: "USA", country: "USA", founded: 1976, logo: "🍏", website: "https://www.apple.com", shortDescription: "شركة تفاحة تكنولوجية رائدة تبتكر هواتف آيفون المتطورة ونظام iOS المذهل.", totalPhones: 5 },
        { id: "samsung", name: "Samsung", logoEmoji: "📱", originCountry: "South Korea", country: "South Korea", founded: 1938, logo: "📱", website: "https://www.samsung.com", shortDescription: "سامسونج رائدة الهواتف الذكية عالمياً بسلسلة جالاكسي ونظام بيئي متكامل.", totalPhones: 3 },
        { id: "google", name: "Google", logoEmoji: "🟩", originCountry: "USA", country: "USA", founded: 1998, logo: "🟩", website: "https://store.google.com", shortDescription: "جوجل الأمريكية المبتكرة لهواتف بكسل فائقة الذكاء والمدمجة مع قدرات الذكاء الاصطناعي جيميني.", totalPhones: 3 },
        { id: "xiaomi", name: "Xiaomi", logoEmoji: "🍊", originCountry: "China", country: "China", founded: 2010, logo: "🍊", website: "https://www.mi.com", shortDescription: "شاومي الصينية الصاعدة بقوة تقدم هواتف وأجهزة ذكية ممتازة بأسعار تنافسية هائلة.", totalPhones: 2 },
        { id: "oneplus", name: "OnePlus", logoEmoji: "🟥", originCountry: "China", country: "China", founded: 2013, logo: "🟥", website: "https://www.oneplus.com", shortDescription: "ون بلس تقدم الأداة الأسرع للألعاب الثقيلة وصاحبة شعار لا تساوم مطلقاً.", totalPhones: 1 },
        { id: "poco", name: "Poco", logoEmoji: "🟡", originCountry: "China", country: "China", founded: 2018, logo: "🟡", website: "https://www.poco.net", shortDescription: "بوكو المتفرعة والمبنية بقوة للألعاب الثقيلة والهواتف الاقتصادية ذات الأداء السريع.", totalPhones: 1 },
        { id: "realme", name: "Realme", logoEmoji: "🟡", originCountry: "China", country: "China", founded: 2018, logo: "🟡", website: "https://www.realme.com", shortDescription: "ريلمي العلامة المبتكرة والسريعة جداً في لفت انتباه فئة الشباب بتصاميمها المتفردة.", totalPhones: 1 },
        { id: "asus", name: "Asus", logoEmoji: "🟦", originCountry: "Taiwan", country: "Taiwan", founded: 1989, logo: "🟦", website: "https://rog.asus.com", shortDescription: "أسوس التايوانية وسلسلة ROG الخارقة صانعة هواتف الألعاب الأقوى عالمياً كلياً.", totalPhones: 1 }
      ];
      defaultBrands.forEach(b => this.brands.set(b.id, b));
      try {
        fs.writeFileSync(BRANDS_FILE_PATH, JSON.stringify(defaultBrands, null, 2), "utf-8");
        console.log(`[Database] Seeded and saved default brands to ${BRANDS_FILE_PATH}`);
      } catch (e) {
        console.error("[Database] Error writing default brands:", e);
      }
    }

    let phonesLoaded = false;
    if (fs.existsSync(PHONES_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(PHONES_FILE_PATH, "utf-8");
        const list = JSON.parse(fileContent);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(p => {
            this.insertOrUpdatePhone(p, 100, false);
          });
          phonesLoaded = true;
          console.log(`[Database] Loaded ${this.phones.size} phones from ${PHONES_FILE_PATH}`);
        }
      } catch (e) {
        console.error("[Database] Error loading phones from file:", e);
      }
    }

    if (!phonesLoaded) {
      // Use extendedPhones fallback
      for (const phone of extendedPhones) {
        this.insertOrUpdatePhone(phone, 100, false);
      }
      try {
        // Collect flat list of all stored phones as Smartphone objects
        const listToSave = Array.from(this.phones.keys()).map(slug => this.getMergedSmartphone(slug)).filter(Boolean);
        fs.writeFileSync(PHONES_FILE_PATH, JSON.stringify(listToSave, null, 2), "utf-8");
        console.log(`[Database] Seeded and saved ${listToSave.length} phones to ${PHONES_FILE_PATH}`);
      } catch (e) {
        console.error("[Database] Error writing default phones:", e);
      }
    }

    console.log(`[Database] Seeding completed: ${this.phones.size} Phones, ${this.brands.size} Brands, ${this.chipsets.size} Chipsets loaded successfully.`);
  }

  /**
   * Relational Mapper: Deconstruct high-level Smartphone object to relational schema rows
   */
  public insertOrUpdatePhone(phone: Smartphone, confidenceScore = 100, persistToFile = true): PhoneEntity {
    console.log(`[STEP 4] Processing: ${phone.brand} ${phone.name}`);
    const slug = this.generateSlug(phone.name);
    
    // Determine brand details
    const brandLower = phone.brand.toLowerCase();
    let brandId = brandLower;
    if (!this.brands.has(brandId)) {
      // Create Brand dynamically if missing (unsupervised data sync support)
      const brandEntity: BrandEntity = {
        id: brandId,
        name: phone.brand,
        logoEmoji: "📱",
        originCountry: "البر الرئيسي",
        country: "البر الرئيسي",
        founded: 2024,
        logo: "📱",
        website: "",
        shortDescription: `شركة مصنعة لهاتف الممتاز ${phone.name}.`,
        totalPhones: 1
      };
      this.brands.set(brandId, brandEntity);
      
      if (persistToFile) {
        try {
          const BRANDS_FILE_PATH = path.join(process.cwd(), "database", "brands.json");
          const arr = Array.from(this.brands.values());
          fs.writeFileSync(BRANDS_FILE_PATH, JSON.stringify(arr, null, 2), "utf-8");
          console.log(`[STEP 5] Saved new brand: ${brandId}`);
        } catch (e) {
          console.error("[Database] Error writing brands to file during phone insert:", e);
        }
      }
    }

    // Deep parsing and structural decomposition
    const normalized = normalizePhoneSpecs(phone);

    // 1. Map Chipset/Processor
    const chipsetId = `${slug}-chipset`;
    const chipsetEntity: ChipsetEntity = {
      id: chipsetId,
      name: phone.processor || "معالج افتراضي",
      nanometer: phone.processor?.includes("3 نانومتر") ? 3 : phone.processor?.includes("4 نانومتر") ? 4 : 5,
      coreCount: phone.processor?.includes("سداسي") ? 6 : phone.processor?.includes("ثماني") ? 8 : 8,
      clockSpeedGhz: phone.processor?.includes("3.78") ? 3.78 : 3.2,
      architecture: "ARM64"
    };
    this.chipsets.set(chipsetId, chipsetEntity);

    // 2. Map Display
    const displayId = `${slug}-display`;
    const displayEntity: DisplayEntity = {
      id: displayId,
      sizeInches: normalized.screenSizeInches,
      technology: phone.screen?.includes("OLED") ? "OLED" : phone.screen?.includes("AMOLED") ? "AMOLED" : "IPS LCD",
      refreshRateHz: normalized.screenRefreshRateHz,
      resolution: phone.screen?.includes("2K") ? "2560 x 1440" : "2400 x 1080",
      peakBrightnessNits: phone.screen?.includes("4500") ? 4500 : phone.screen?.includes("3000") ? 3000 : 2000,
      protectionText: phone.screen?.includes("Gorilla") ? "Gorilla Glass" : "Ceramic Shield"
    };
    this.displays.set(displayId, displayEntity);

    // 3. Map Battery
    const batteryId = `${slug}-battery`;
    const batteryEntity: BatteryEntity = {
      id: batteryId,
      capacityMah: normalized.batteryCapacity,
      chemistry: "Li-Ion",
      estimatedHoursVideo: phone.battery?.includes("29") ? 29 : 24,
      fastChargingWatts: normalized.chargingSpeedWatts,
      wirelessChargingWatts: normalized.hasWirelessCharging ? 15 : 0,
      reverseCharging: phone.charging?.includes("عكسي") || false
    };
    this.batteries.set(batteryId, batteryEntity);

    // 4. Map Camera
    const cameraId = `${slug}-camera`;
    const cameraEntity: CameraEntity = {
      id: cameraId,
      mainMegapixels: normalized.cameraMainMegapixels,
      ultrawideMegapixels: phone.camera?.includes("48 م") ? 48 : 12,
      telephotoMegapixels: phone.camera?.includes("64") ? 64 : phone.camera?.includes("50") ? 50 : 12,
      opticalZoom: phone.camera?.includes("5x") ? 5 : phone.camera?.includes("3x") ? 3 : 1,
      systemDescription: phone.camera || "غير متوفر"
    };
    this.cameras.set(cameraId, cameraEntity);

    // 5. Map Price
    const priceId = `${slug}-price`;
    const priceEntity: PriceEntity = {
      id: priceId,
      priceMinUsd: normalized.priceUSD,
      priceMaxUsd: normalized.priceUSD,
      priceRangeStr: phone.price_range || `$${normalized.priceUSD}`
    };
    this.prices.set(priceId, priceEntity);

    // Heuristic Popularity score calculation
    let popularity = 50;
    const phoneLower = phone.name.toLowerCase();
    if (phoneLower.includes("pro max") || phoneLower.includes("ultra")) {
      popularity = 95;
    } else if (phoneLower.includes("pro") || phoneLower.includes("+")) {
      popularity = 80;
    } else if (brandLower === "apple" || brandLower === "samsung") {
      popularity = 75;
    }

    // 6. Map Master Phone Row
    const phoneEntity: PhoneEntity = {
      id: slug,
      name: phone.name,
      brandId,
      chipsetId,
      displayId,
      batteryId,
      cameraId,
      priceId,
      otherSpecs: phone.otherSpecs || phone.other_specs || "غير متوفر",
      other_specs: phone.other_specs || phone.otherSpecs || "غير متوفر",
      screen: phone.screen,
      processor: phone.processor,
      camera: phone.camera,
      battery: phone.battery,
      charging: phone.charging,
      storage: phone.storage,
      price_range: phone.price_range,
      popularityScore: popularity,
      confidenceScore,
      normalizedAt: new Date().toISOString(),
      
      // Map extensions
      releaseYear: phone.releaseYear ?? "",
      gpu: phone.gpu ?? "",
      os: phone.os ?? "",
      antutu: phone.antutu ?? "",
      geekbench: phone.geekbench ?? "",
      geekbenchSingle: phone.geekbenchSingle ?? "",
      geekbenchMulti: phone.geekbenchMulti ?? "",
      weight: phone.weight ?? "",
      dimensions: phone.dimensions ?? "",
      water_resistance: phone.water_resistance ?? phone.waterResistance ?? "",
      waterResistance: phone.waterResistance ?? phone.water_resistance ?? "",
      fingerprint: phone.fingerprint ?? "",
      has5g: phone.has5g === true || phone.has5g === "true" || phone.supports5G === true,
      supports5G: phone.supports5G ?? (phone.has5g === true || phone.has5g === "true"),
      thumbnail: phone.thumbnail
    };

    this.phones.set(slug, phoneEntity);

    // Clean review seeds if uninitialized
    if (!this.reviews.has(slug)) {
      this.reviews.set(slug, [
        {
          id: `${slug}-review-1`,
          phoneId: slug,
          userName: "مروان العتيبي",
          rating: 4.8,
          comment: `مستوى عتاد ممتاز وتحديثات ممتازة للغاية في ${phone.name}.`,
          createdAt: new Date().toISOString()
        },
        {
          id: `${slug}-review-2`,
          phoneId: slug,
          userName: "سارة القحطاني",
          rating: 4.3,
          comment: `شاشة خلابة للرؤية مع استهلاك متزن للطاقة. خياري الأفضل لهاتف ${phone.brand}.`,
          createdAt: new Date().toISOString()
        }
      ]);
    }

    if (persistToFile) {
      try {
        const PHONES_FILE_PATH = path.join(process.cwd(), "database", "phones.json");
        const listToSave = Array.from(this.phones.keys()).map(s => this.getMergedSmartphone(s)).filter(Boolean);
        fs.writeFileSync(PHONES_FILE_PATH, JSON.stringify(listToSave, null, 2), "utf-8");
        console.log(`[STEP 5] Saving to database: ${PHONES_FILE_PATH}`);
        console.log(`[STEP 6] Save success! Total phones: ${listToSave.length}`);
      } catch (e) {
        console.error("[Database] Error persisting phones to file inside insertOrUpdatePhone:", e);
      }
    }

    return phoneEntity;
  }

  /**
   * Save both phones and brands securely and block-wait for file write completion
   */
  public saveDatabase(): void {
    try {
      const dbDir = path.join(process.cwd(), "database");
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Save Phones
      const PHONES_FILE_PATH = path.join(dbDir, "phones.json");
      const listToSave = Array.from(this.phones.keys()).map(s => this.getMergedSmartphone(s)).filter(Boolean);
      fs.writeFileSync(PHONES_FILE_PATH, JSON.stringify(listToSave, null, 2), "utf-8");
      
      // Save Brands
      const BRANDS_FILE_PATH = path.join(dbDir, "brands.json");
      const brandsToSave = Array.from(this.brands.values());
      fs.writeFileSync(BRANDS_FILE_PATH, JSON.stringify(brandsToSave, null, 2), "utf-8");
      
      console.log(`[Database] saveDatabase successfully wrote ${listToSave.length} phones & ${brandsToSave.length} brands to disk sync.`);
    } catch (e) {
      console.error("[Database] Error in saveDatabase write:", e);
      throw e;
    }
  }

  /**
   * Relational Mapper: Join separate entities into unified high-level Smartphone type (with normalized metadata)
   */
  public getMergedSmartphone(slug: string): Smartphone | null {
    const phone = this.phones.get(slug);
    if (!phone) return null;

    const brand = this.brands.get(phone.brandId);
    const chipset = this.chipsets.get(phone.chipsetId);
    const display = this.displays.get(phone.displayId);
    const battery = this.batteries.get(phone.batteryId);
    const camera = this.cameras.get(phone.cameraId);
    const price = this.prices.get(phone.priceId);

    // Convert and rebuild the high-fidelity representation expected by comparison views
    const basePhone: Smartphone = {
      name: phone.name,
      brand: brand?.name || phone.brandId,
      screen: phone.screen || (display?.sizeInches 
        ? `${display?.sizeInches} بوصة ${display?.technology || "OLED"}، معدل تحديث ${display?.refreshRateHz || 120}Hz، سطوع يصل لـ ${display?.peakBrightnessNits || 2000} شمعة`
        : phone.otherSpecs || "غير متوفر"),
      processor: phone.processor || `${chipset?.name || "ثماني النواة"} (${chipset?.nanometer || 4} نانومتر)`,
      camera: phone.camera || camera?.systemDescription || "كاميرا ذكية متكاملة",
      battery: phone.battery || `${battery?.capacityMah || 5000} مللي أمبير من فئة السليكون المتطورة تتيح كفاءة تشغيل طوال اليوم`,
      charging: phone.charging || `شحن سلكي سريع بقدرة ${battery?.fastChargingWatts || 33} واط، شحن لاسلكي بقدرة ${battery?.wirelessChargingWatts || 15} واط`,
      storage: phone.storage || `خيارات تخزين داخلية متعددة وسعة رام ممتازة`,
      price_range: phone.price_range || price?.priceRangeStr || `$${price?.priceMinUsd || 499}`,
      other_specs: phone.other_specs || phone.otherSpecs || "غير متوفر",
      
      // Inject premium spec entities
      releaseYear: phone.releaseYear ?? "",
      gpu: phone.gpu ?? "",
      os: phone.os ?? "",
      antutu: phone.antutu ?? "",
      geekbench: phone.geekbench ?? "",
      geekbenchSingle: phone.geekbenchSingle ?? "",
      geekbenchMulti: phone.geekbenchMulti ?? "",
      weight: phone.weight ?? "",
      dimensions: phone.dimensions ?? "",
      water_resistance: phone.water_resistance ?? phone.waterResistance ?? "",
      waterResistance: phone.waterResistance ?? phone.water_resistance ?? "",
      fingerprint: phone.fingerprint ?? "",
      has5g: phone.has5g ?? false,
      supports5G: phone.supports5G ?? phone.has5g ?? false,
      thumbnail: phone.thumbnail,
      otherSpecs: phone.otherSpecs ?? ""
    };

    // Construct the fully enriched object utilizing our existing Normalization Pipeline
    return processSpecPipeline(basePhone);
  }
}
