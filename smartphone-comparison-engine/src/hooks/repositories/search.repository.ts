import { RelationalDatabase } from "../../db/database";
import { Smartphone } from "../../types";
import { SmartphoneFuzzyEngine, SearchResult, SearchOptions } from "../../utils/searchIndex";

export class SearchRepository {
  private db = RelationalDatabase.getInstance();

  /**
   * Performs dynamic, typo-tolerant search strictly over the live relational database records
   */
  public search(query: string, options: SearchOptions = {}): SearchResult[] {
    // 1. Fetch live records from the relational DB
    let livePhones: Smartphone[] = Array.from(this.db.phones.keys())
      .map(slug => this.db.getMergedSmartphone(slug))
      .filter((p): p is Smartphone => p !== null);

    // If qualityFilter is "duplicates", we need the full map first
    let nameBrandMap: Map<string, number> | null = null;
    if (options.qualityFilter === "duplicates") {
      nameBrandMap = new Map<string, number>();
      for (const p of livePhones) {
        const key = `${p.name.toLowerCase().trim()}_${p.brand.toLowerCase().trim()}`;
        nameBrandMap.set(key, (nameBrandMap.get(key) || 0) + 1);
      }
    }

    // Apply Advanced Filters
    livePhones = livePhones.filter(p => {
      // 1. Brand Filter
      if (options.brand && options.brand !== "all" && p.brand.toLowerCase() !== options.brand.toLowerCase()) {
        return false;
      }

      // 2. Release Year
      if (options.releaseYearFrom && p.releaseYear) {
        if (Number(p.releaseYear) < Number(options.releaseYearFrom)) return false;
      }
      if (options.releaseYearTo && p.releaseYear) {
        if (Number(p.releaseYear) > Number(options.releaseYearTo)) return false;
      }

      // 3. OS
      if (options.os && options.os !== "all" && p.os) {
        if (!p.os.toLowerCase().includes(options.os.toLowerCase())) return false;
      }

      // 4. Processor
      if (options.processor && options.processor !== "all" && p.processor) {
        if (!p.processor.toLowerCase().includes(options.processor.toLowerCase())) return false;
      }

      // 5. RAM
      if (options.ram && options.ram !== "all" && p.storage) {
        const match = options.ram.match(/(\d+)GB/i);
        if (match) {
          const reqRam = Number(match[1]);
          const pRamMatch = p.storage.match(/(\d+)\s*(?:GB|جيجابايت|رام)/i);
          if (pRamMatch) {
            const pRam = Number(pRamMatch[1]);
            if (pRam < reqRam) return false;
          } else {
             // Cannot determine RAM, maybe exclude or include? Let's exclude for strictness
             return false;
          }
        }
      }

      // 6. Storage
      if (options.storage && options.storage !== "all" && p.storage) {
        if (!p.storage.toLowerCase().includes(options.storage.toLowerCase())) return false;
      }

      // 7. Battery
      if ((options.batteryMin !== undefined || options.batteryMax !== undefined) && p.battery) {
        const match = p.battery.match(/(\d{3,4})/);
        if (match) {
          const capacity = Number(match[1]);
          if (options.batteryMin !== undefined && capacity < options.batteryMin) return false;
          if (options.batteryMax !== undefined && capacity > options.batteryMax) return false;
        } else {
          return false;
        }
      }

      // 8. Images
      if (options.hasImages) {
        const hasImg = !!(p as any).thumbnail;
        if (options.hasImages === "yes" && !hasImg) return false;
        if (options.hasImages === "no" && hasImg) return false;
      }

      // 9. Status (currently unsupported explicitly, but let's assume it maps to "published" vs "draft" if any field exists, else ignore)
      
      // 10. Quality Filter
      if (options.qualityFilter && options.qualityFilter !== "all") {
        if (options.qualityFilter === "missing_specs") {
          if (p.processor && p.screen && p.battery && p.price_range) return false;
        } else if (options.qualityFilter === "missing_image") {
          if ((p as any).thumbnail) return false;
        } else if (options.qualityFilter === "needs_review") {
          if (p.processor && p.camera && p.battery && p.os !== "غير متوفر") return false;
        } else if (options.qualityFilter === "duplicates" && nameBrandMap) {
          const key = `${p.name.toLowerCase().trim()}_${p.brand.toLowerCase().trim()}`;
          if ((nameBrandMap.get(key) || 0) <= 1) return false;
        }
      }

      return true;
    });

    // 2. Feed alive listings to our high-performance fuzzy matching engine in real-time
    const liveEngine = new SmartphoneFuzzyEngine(livePhones);

    // 3. Return scored search results. If query is empty, just return all as dummy results.
    let results: SearchResult[] = [];
    if (!query.trim()) {
       results = livePhones.map(p => ({
         phone: p,
         score: 100,
         matchReason: "Advanced Filters"
       }));
    } else {
       results = liveEngine.search(query, options);
    }

    // Apply Sorting
    if (options.sortBy) {
      results = results.sort((a, b) => {
        switch (options.sortBy) {
          case "az": return a.phone.name.localeCompare(b.phone.name);
          case "za": return b.phone.name.localeCompare(a.phone.name);
          case "newest": return Number(b.phone.releaseYear || 0) - Number(a.phone.releaseYear || 0);
          case "oldest": return Number(a.phone.releaseYear || 0) - Number(b.phone.releaseYear || 0);
          default: return 0;
        }
      });
    }

    return results;
  }
}
