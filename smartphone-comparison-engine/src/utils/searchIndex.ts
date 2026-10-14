import { Smartphone } from "../types";
import { extendedPhones } from "../data/defaultPhones";

/**
 * Search Item Representation inside our architecture index
 */
export interface IndexedSmartphone {
  phone: Smartphone;
  id: string;
  nameNormalized: string;
  brandNormalized: string;
  searchTokens: string[];
  aliases: string[];
  arabicAliases: string[];
  popularityScore: number; // 0 to 100 for ranking high-confidence devices
}

export interface SearchOptions {
  limit?: number;
  typoToleranceThreshold?: number; // threshold for Levenshtein comparison (0-1)
  recentSearches?: string[];
  popularPrioritization?: boolean;
  brand?: string;
  status?: string;
  sortBy?: "newest" | "oldest" | "az" | "za";
  
  // Advanced filters
  releaseYearFrom?: string;
  releaseYearTo?: string;
  os?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  batteryMin?: number;
  batteryMax?: number;
  hasImages?: string;
  qualityFilter?: string;
}

export interface SearchResult {
  phone: Smartphone;
  score: number; // match confidence score (0 to 100)
  matchReason: string; // metadata debugging reason (exact, token, fuzzy, misspelling)
}

/**
 * Helper to normalize texts in both Arabic and English to ensure spelling variant consolidation
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  let val = text.toLowerCase().trim();

  // Normalize common Arabic glyph variations
  val = val.replace(/[أإآ]/g, "ا");
  val = val.replace(/ى/g, "ي");
  val = val.replace(/ة/g, "ه");
  val = val.replace(/ؤ/g, "ء");
  val = val.replace(/إ/g, "ا");

  // Normalize Arabic Eastern digits to Western Arabic digits
  const easternDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const westernDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  for (let i = 0; i < 10; i++) {
    val = val.replaceAll(easternDigits[i], westernDigits[i]);
  }

  // Replace punctuation and redundant symbols with space
  val = val.replace(/[.,\-+/_()]/g, " ");
  // Collapse duplicate spaces
  val = val.replace(/\s+/g, " ");

  return val.trim();
}

/**
 * Basic Levenshtein Distance for spell-checking
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];

  for (let i = 0; i <= bl; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= al; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bl; i++) {
    for (let j = 1; j <= al; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bl][al];
}

/**
 * Calculate Jaro-Winkler or a normalized token similarity score (0 to 1)
 */
export function getFuzzyMatchScore(queryWord: string, targetToken: string): number {
  if (queryWord === targetToken) return 1.0;
  if (targetToken.startsWith(queryWord)) return 0.85; // Strong prefix match
  if (targetToken.includes(queryWord)) return 0.75;  // Substring match

  const lenDiff = Math.abs(queryWord.length - targetToken.length);
  const maxLen = Math.max(queryWord.length, targetToken.length);

  // Levenshtein threshold for short words is stricter
  const maxAllowedDistance = queryWord.length <= 3 ? 1 : queryWord.length <= 5 ? 2 : 3;
  const distance = getLevenshteinDistance(queryWord, targetToken);

  if (distance <= maxAllowedDistance) {
    // Normalised distance score
    return 1 - distance / maxLen;
  }

  return 0.0;
}

/**
 * Transliteration dictionary to map phonetic Arabic search prompts to English variants
 */
const ARABIC_TO_ENGLISH_MAP: Record<string, string[]> = {
  ايفون: ["iphone"],
  أيفون: ["iphone"],
  سامسونج: ["samsung"],
  جالكسي: ["galaxy", "samsung"],
  جلاكسي: ["galaxy", "samsung"],
  اس: ["s"],
  الترا: ["ultra"],
  بلس: ["plus", "+"],
  برو: ["pro"],
  ماكس: ["max"],
  بيكسل: ["pixel"],
  بكسل: ["pixel"],
  جوجل: ["google"],
  غوغل: ["google"],
  شاومي: ["xiaomi", "mi"],
  مي: ["mi", "xiaomi"],
  بوكو: ["poco"],
  ونبلس: ["oneplus"],
  "ون بلس": ["oneplus"],
  نثنج: ["nothing"],
  نوثينغ: ["nothing"],
  نوثينج: ["nothing"],
  اسوس: ["asus"],
  روج: ["rog"],
  ريدمي: ["redmi"],
  نوت: ["note"],
};

/**
 * Expand search query tokens with transliterations to hit multiple indices
 */
export function expandArabicQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  const words = normalized.split(" ");
  const expanded: string[] = [];

  for (const word of words) {
    expanded.push(word);
    if (ARABIC_TO_ENGLISH_MAP[word]) {
      expanded.push(...ARABIC_TO_ENGLISH_MAP[word]);
    }
  }

  return Array.from(new Set(expanded));
}

/**
 * Assign pre-computation of aliases, structural parameters and popularity weights
 */
export function buildSearchIndex(phones: Smartphone[]): IndexedSmartphone[] {
  return phones.map((phone, idx) => {
    const nameNorm = normalizeSearchText(phone.name);
    const brandNorm = normalizeSearchText(phone.brand);

    // Dynamic popularity heuristics
    let popularityScore = 50; // standard fallback
    const nameLower = phone.name.toLowerCase();

    if (nameLower.includes("pro max") || nameLower.includes("ultra")) {
      popularityScore = 95; // ultra-premium flagships
    } else if (nameLower.includes("pro") || nameLower.includes("+") || nameLower.includes("plus")) {
      popularityScore = 80;
    } else if (phone.brand === "Apple" || phone.brand === "Samsung") {
      popularityScore = 75; // popular brands
    } else if (phone.brand === "Poco" || phone.brand === "Xiaomi") {
      popularityScore = 65; // high volume mid-rangers
    }

    // Dynamic alias extraction
    const aliases: string[] = [];
    const arabicAliases: string[] = [];

    // e.g. "iPhone 15 Pro Max" -> aliases like "iphone15", "15 pro max", "15pm", "15 pm"
    if (phone.brand.toLowerCase() === "apple") {
      const matchNum = phone.name.match(/\d+/);
      if (matchNum) {
        aliases.push(`iphone ${matchNum[0]}`);
        aliases.push(`iphone${matchNum[0]}`);
        if (nameLower.includes("pro max")) {
          aliases.push(`iphone ${matchNum[0]} pro max`);
          aliases.push(`${matchNum[0]} pro max`);
          aliases.push(`${matchNum[0]}pm`);
          aliases.push(`${matchNum[0]} pm`);
          arabicAliases.push(`ايفون ${matchNum[0]} برو ماكس`);
        } else if (nameLower.includes("pro")) {
          aliases.push(`iphone ${matchNum[0]} pro`);
          aliases.push(`${matchNum[0]} pro`);
          arabicAliases.push(`ايفون ${matchNum[0]} برو`);
        } else {
          arabicAliases.push(`ايفون ${matchNum[0]}`);
        }
      }
    }

    // e.g. "Samsung Galaxy S24 Ultra" -> "s24 ultra", "s24u", "s24", "galaxy s24 ultra"
    if (phone.brand.toLowerCase() === "samsung") {
      const matchS = phone.name.match(/s\d+/i);
      if (matchS) {
        const sNum = matchS[0].toLowerCase(); // e.g., s24
        aliases.push(sNum);
        if (nameLower.includes("ultra")) {
          aliases.push(`${sNum} ultra`);
          aliases.push(`${sNum}u`);
          aliases.push(`${sNum} ult`);
          aliases.push(`galaxy ${sNum} ultra`);
          arabicAliases.push(`اس ${sNum.replace("s", "")} الترا`);
          arabicAliases.push(`سامسونج اس ${sNum.replace("s", "")} الترا`);
        } else if (nameLower.includes("+") || nameLower.includes("plus")) {
          aliases.push(`${sNum} plus`);
          aliases.push(`${sNum}+`);
          aliases.push(`galaxy ${sNum}+`);
          arabicAliases.push(`اس ${sNum.replace("s", "")} بلس`);
        } else {
          arabicAliases.push(`سامسونج اس ${sNum.replace("s", "")}`);
        }
      }
    }

    // e.g. "Google Pixel 8 Pro" -> "pixel 8", "pixel 8 pro", "pixel8"
    if (phone.brand.toLowerCase() === "google") {
      const matchNum = phone.name.match(/\d+/);
      if (matchNum) {
        aliases.push(`pixel ${matchNum[0]}`);
        aliases.push(`pixel${matchNum[0]}`);
        if (nameLower.includes("pro")) {
          aliases.push(`pixel ${matchNum[0]} pro`);
          arabicAliases.push(`بكسل ${matchNum[0]} برو`);
        } else {
          arabicAliases.push(`بكسل ${matchNum[0]}`);
        }
      }
    }

    // e.g. Xiaomi Redmis and notes
    if (phone.brand.toLowerCase() === "xiaomi") {
      if (nameLower.includes("ultra")) {
        aliases.push("xiaomi ultra");
        aliases.push("mi ultra");
        arabicAliases.push("شاومي الترا");
      }
    }

    // Universal tokens
    const searchTokens = Array.from(
      new Set([
        ...nameNorm.split(" "),
        ...brandNorm.split(" "),
        ...aliases.flatMap((a) => normalizeSearchText(a).split(" ")),
      ])
    ).filter(Boolean);

    return {
      phone,
      id: `phone-${idx}-${nameNorm.replace(/\s+/g, "-")}`,
      nameNormalized: nameNorm,
      brandNormalized: brandNorm,
      searchTokens,
      aliases,
      arabicAliases,
      popularityScore,
    };
  });
}

/**
 * Core Smartphone Index Fuzzy Engine
 */
export class SmartphoneFuzzyEngine {
  private index: IndexedSmartphone[];

  constructor(phones: Smartphone[]) {
    this.index = buildSearchIndex(phones);
  }

  /**
   * Run high performance, typo-tolerant scoring across the index
   */
  public search(query: string, options: SearchOptions = {}): SearchResult[] {
    const limit = options.limit || 8;
    const recentSearches = options.recentSearches || [];
    const prioritizePopular = options.popularPrioritization !== false;

    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
      // Return highly popular flagships standard if empty input
      return this.index
        .slice()
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map((item) => ({
          phone: item.phone,
          score: 50 + item.popularityScore / 10,
          matchReason: "خلاصة الأجهزة الأكثر شعبية",
        }));
    }

    const queryTokens = expandArabicQuery(query);
    const results: SearchResult[] = [];

    for (const item of this.index) {
      let finalScore = 0;
      let reason = "";

      // 1. Direct Equal Matches
      if (item.nameNormalized === normalizedQuery) {
        finalScore = 100;
        reason = "تطابق الاسم بالكامل";
      } else if (item.nameNormalized.includes(normalizedQuery)) {
        finalScore = 85;
        reason = "تطابق جزئي مباشر بالاسم";
      } else if (normalizedQuery.includes(item.brandNormalized) && normalizedQuery.includes(item.nameNormalized.replace(item.brandNormalized, "").trim())) {
        finalScore = 95;
        reason = "تطابق علامة وموديل";
      }

      // 2. Alias Matches
      if (finalScore < 100) {
        for (const alias of item.aliases) {
          const normAlias = normalizeSearchText(alias);
          if (normAlias === normalizedQuery) {
            finalScore = Math.max(finalScore, 90);
            reason = "تطابق الاسم المختصر البديل";
            break;
          } else if (normAlias.includes(normalizedQuery)) {
            finalScore = Math.max(finalScore, 80);
            reason = "تطابق جزء من الاسم البديل";
            break;
          }
        }
      }

      // 3. Arabic Alias Matches
      if (finalScore < 90) {
        for (const arAlias of item.arabicAliases) {
          const normArAlias = normalizeSearchText(arAlias);
          if (normArAlias === normalizedQuery) {
            finalScore = Math.max(finalScore, 88);
            reason = "تطابق الاسم المعرب بالكامل";
            break;
          } else if (normArAlias.includes(normalizedQuery)) {
            finalScore = Math.max(finalScore, 78);
            reason = "تطابق جزئي بالاسم المعرب";
            break;
          }
        }
      }

      // 4. Detailed multi-token keyword intersections
      if (finalScore === 0) {
        let matchedTokensCount = 0;
        let cumulativeTokenSimilarity = 0;

        for (const qToken of queryTokens) {
          let bestTokenWeight = 0;

          for (const sToken of item.searchTokens) {
            const wordSimilarity = getFuzzyMatchScore(qToken, sToken);
            if (wordSimilarity > bestTokenWeight) {
              bestTokenWeight = wordSimilarity;
            }
          }

          if (bestTokenWeight > 0.6) {
            matchedTokensCount++;
            cumulativeTokenSimilarity += bestTokenWeight;
          }
        }

        if (matchedTokensCount > 0) {
          // Token intersection ratio combined with confidence coefficients
          const intersectionRatio = matchedTokensCount / queryTokens.length;
          const averageSimilarity = cumulativeTokenSimilarity / matchedTokensCount;
          
          finalScore = Math.min(95, Math.round(intersectionRatio * averageSimilarity * 80));
          reason = `تطابق مفردات البحث (${matchedTokensCount}/${queryTokens.length})`;
          
          // Boost score slightly if brand is matched
          const isBrandPresent = queryTokens.some(qt => qt === item.brandNormalized);
          if (isBrandPresent) {
            finalScore = Math.min(95, finalScore + 10);
            reason += " + تمييز الماركة";
          }
        }
      }

      // Apply boosting weights
      if (finalScore > 0) {
        // Boost for recently searched terms if queries match recent items
        const isRecentlySearched = recentSearches.some(
          (rs) =>
            item.phone.name.toLowerCase().includes(rs.toLowerCase()) ||
            rs.toLowerCase().includes(item.phone.name.toLowerCase())
        );
        if (isRecentlySearched) {
          finalScore = Math.min(100, finalScore + 8);
          reason += " [تم البحث عنه مؤخراً]";
        }

        // Boost for flagship models through popularity weighting
        if (prioritizePopular) {
          const popularityAdjustment = (item.popularityScore - 50) / 10; // -1 to +4.5
          finalScore = Math.min(100, Math.max(1, finalScore + popularityAdjustment));
        }

        results.push({
          phone: item.phone,
          score: Math.round(finalScore),
          matchReason: reason,
        });
      }
    }

    // Rank by matching score desc, then popularity desc
    return results
      .sort((a, b) => {
        if (Math.abs(b.score - a.score) < 2) {
          const popA = this.index.find(p => p.phone.name === a.phone.name)?.popularityScore || 50;
          const popB = this.index.find(p => p.phone.name === b.phone.name)?.popularityScore || 50;
          return popB - popA;
        }
        return b.score - a.score;
      })
      .slice(0, limit);
  }
}
