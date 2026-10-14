import { Smartphone } from "../types";
import { processSpecPipeline, saveSpecsToCache } from "../utils/normalizationPipeline";
import { SearchService } from "./search.service";

export class AiService {
  /**
   * Database-First Specification Retrieval.
   * Pulls from our relational DB backend via secure API, falling back to server-side AI generation ONLY when missing from database catalogs.
   */
  static async generateSpecs(name: string): Promise<Smartphone> {
    if (!name || name.trim() === "") {
      throw new Error("اسم الهاتف فارغ");
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      // Step 1: Database-First lookup via local backend server API
      console.log(`[SpecPipeline] DATABASE-FIRST lookup of "${trimmedName}" via backend...`);
      const response = await fetch(`/api/phones/${encodeURIComponent(slug)}`);
      
      if (!response.ok) {
        throw new Error("Phone not found in database catalog");
      }

      const data = await response.json();
      if (data.success && data.phone) {
        console.log(`[SpecPipeline] DATABASE HIT - Resolved specifications for "${trimmedName}" from relational DB.`);
        
        // Save to client spec pipeline cache
        const processed = processSpecPipeline(data.phone);
        saveSpecsToCache(trimmedName, processed);
        
        // Background sync fuzzy engine index
        SearchService.syncWithDatabase();
        
        return processed;
      }
      
      throw new Error("Response did not contain valid phone entity");
    } catch (dbError) {
      console.warn(`[SpecPipeline] DB Miss or Fetch Error for "${trimmedName}", trigger generation API:`, dbError);

      // Step 2: Use AI specification generation fallback endpoint on backend
      try {
        const response = await fetch("/api/generate-specs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "فشل في تعبئة المواصفات بالذكاء الاصطناعي");
        }

        if (!data.specs) {
          throw new Error("لم يتم إرجاع مواصفات صحيحة للهاتف من الذكاء الاصطناعي.");
        }

        const processedSpecs = processSpecPipeline(data.specs);
        saveSpecsToCache(trimmedName, processedSpecs);
        
        // Background sync search engine with newly added device
        SearchService.syncWithDatabase();

        return processedSpecs;
      } catch (apiError: any) {
        console.error(`[SpecPipeline] Critical Fallback - AI generation failed:`, apiError);

        // STAGE 3: Absolute local offline-tolerant fallback structure
        const brandWords = trimmedName.split(" ");
        const inferredBrand = brandWords[0] || "غير معروف";

        const fallbackSpecs: Smartphone = {
          name: trimmedName,
          brand: inferredBrand,
          screen: "6.5 بوصة OLED كلاسيكية بدقة FHD+، لتوفير المحتوى (تقديري)",
          processor: "معالج ثماني النواة موازن للمهام اليومية والألعاب الخفيفة (تقديري)",
          camera: "كاميرا أساسية بدقة 50 ميجابكسل مع دعم التصوير الليلي الأساسي (تقديري)",
          battery: "5000 مللي أمبير تدعم العمل طوال اليوم بكفاءة ممتازة (تقديري)",
          charging: "شحن سلكي سريع بقدرة 25 واط لشحن آمن ومدمج (تقديري)",
          storage: "ذاكرة داخلية 128 جيجابايت مع 8 جيجابايت رام للأداء اليومي (تقديري)",
          price_range: "$350",
          other_specs: "هيكل متين مقاوم للرذاذ الخفيف، نظام أندرويد أحدث، ومستشعر بصمة مدمج (تقديري)"
        };

        const processedFallback = processSpecPipeline(fallbackSpecs);
        if (processedFallback.confidence) {
          processedFallback.confidence.overallScore = 40;
          if (!processedFallback.confidence.estimatedFields.includes("overall")) {
            processedFallback.confidence.estimatedFields.push("all_fields_fallback");
          }
        }

        saveSpecsToCache(trimmedName, processedFallback);
        return processedFallback;
      }
    }
  }

  /**
   * Converse with the AI Technical Advisor
   */
  static async chatWithAdvisor(
    phoneA: Smartphone,
    phoneB: Smartphone,
    question: string,
    history: { role: "user" | "model"; text: string }[]
  ): Promise<string> {
    const response = await fetch("/api/advisor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneA,
        phoneB,
        question,
        history,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "تعذر صياغة رد مناسب من المستشار الذكي.");
    }

    return data.answer || "عذرًا، لم أتمكن من الحصول على إجابة مفصلة.";
  }
}
