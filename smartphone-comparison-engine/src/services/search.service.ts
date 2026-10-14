import { Smartphone } from "../types";
import { SmartphoneFuzzyEngine, SearchResult, SearchOptions } from "../utils/searchIndex";
import { processSpecPipeline, saveSpecsToCache } from "../utils/normalizationPipeline";
import { ObservabilityService } from "./observability.service";

/**
 * Client-side Cache of Smartphone catalogs synced from our Relational DB
 */
let liveCatalog: Smartphone[] = [];
let fuzzyEngineInstance: SmartphoneFuzzyEngine | null = null;
const localSearchCache = new Map<string, SearchResult[]>();
const MAX_CACHE_SIZE = 120;

export class SearchService {
  /**
   * Triggers a background fetch to sync the client-side search cache with our primary Relational DB truth.
   */
  static async syncWithDatabase(): Promise<void> {
    try {
      console.log("[SearchService] Syncing client cache with relational database...");
      const response = await fetch("/api/phones");
      if (response.ok) {
        const data = await response.json();
        if (data.phones && Array.isArray(data.phones)) {
          liveCatalog = data.phones;
          // Rebuild fuzzy indexing engine on the fly with live records
          fuzzyEngineInstance = new SmartphoneFuzzyEngine(liveCatalog);
          localSearchCache.clear();
          console.log(`[SearchService] Sycned successfully. Fuzzy engine loaded ${liveCatalog.length} devices.`);
        }
      }
    } catch (err) {
      console.warn("[SearchService] Sync failed, maintaining standard dataset:", err);
    }
  }

  /**
   * Lazily retrieve the active indexing engine, falling back to an on-the-fly indexer.
   */
  private static getEngine(): SmartphoneFuzzyEngine {
    if (!fuzzyEngineInstance) {
      // Background-fetch trigger
      this.syncWithDatabase();
      
      // Seed with empty/standard array initially
      fuzzyEngineInstance = new SmartphoneFuzzyEngine([]);
    }
    return fuzzyEngineInstance;
  }

  /**
   * Execute real-time search across the live synced relational device index.
   */
  static searchPhones(query: string, options: SearchOptions = {}): SearchResult[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const cacheKey = `${trimmed.toLowerCase()}_${JSON.stringify(options)}`;
    
    // 1. Client Cache-First optimization
    if (localSearchCache.has(cacheKey)) {
      return localSearchCache.get(cacheKey)!;
    }

    // 2. Perform local fuzzy database indexing query
    const results = this.getEngine().search(trimmed, options);

    // Track diagnostic search telemetry
    ObservabilityService.trackSearch({
      query: trimmed,
      resultsCount: results.length
    });

    // 3. Prevent memory leak by capping search cache size
    if (localSearchCache.size >= MAX_CACHE_SIZE) {
      const firstKey = localSearchCache.keys().next().value;
      if (firstKey !== undefined) {
        localSearchCache.delete(firstKey);
      }
    }
    localSearchCache.set(cacheKey, results);
    return results;
  }

  /**
   * Real-time autocomplete suggestions helper
   */
  static getAutocompleteSuggestions(query: string): SearchResult[] {
    return this.searchPhones(query, {
      limit: 6,
      typoToleranceThreshold: 0.75,
      popularPrioritization: true
    });
  }

  /**
   * AI-powered Natural Language Discovery Engine routing directly to our API Contract
   */
  static async discoverPhones(query: string): Promise<Smartphone[]> {
    const response = await fetch("/api/discover-phones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "فشل ذكاء الاكتشاف في تحديد الهواتف المطلوبة.");
    }

    if (data.phones && Array.isArray(data.phones)) {
      // Process, normalize and save into cache
      const processedList = data.phones.map((p: any) => {
        const processed = processSpecPipeline(p);
        if (processed.name) {
          saveSpecsToCache(processed.name, processed);
        }
        return processed;
      });

      // Background trigger to sync local state with backend database modifications
      this.syncWithDatabase();

      return processedList;
    }

    throw new Error("لم يتم إعطاء ترشيحات مطابقة للمواصفات المدخلة.");
  }
}

// Perform background async synchronization immediately upon module load to provide zero latency to users
setTimeout(() => {
  SearchService.syncWithDatabase();
}, 500);
