import { Smartphone, CompareResponse } from "../types";
import { CompareResponseSchema } from "../validators/schemas";
import { 
  calculateMultiComparison, 
  formatComparisonForExport, 
  SmartphoneCalculatedResult, 
  ScoringWeightConfig 
} from "../utils/compareEngine";
import { ObservabilityService } from "./observability.service";

/**
 * Phase 6 — Comparison Service Isolation Layer.
 * Intermediates all client-side queries, weighted computations, and export compiles.
 * Completely shields the UI from raw math and scoring algorithms.
 */
export class ComparisonService {
  /**
   * Performs all deterministic weighted comparison calculations for 2-6 devices.
   */
  static calculate(
    phones: Smartphone[], 
    weights?: ScoringWeightConfig
  ): SmartphoneCalculatedResult[] {
    const startTime = performance.now();
    const results = calculateMultiComparison(phones, weights);
    const duration = performance.now() - startTime;

    // Track internal diagnostics as specified in Phase 8 (Observability)
    if (phones.length > 0) {
      ObservabilityService.trackComparison({
        deviceCount: phones.length,
        durationMs: duration,
        deviceNames: phones.map(p => p.name),
        customWeightsUsed: !!weights
      });
    }

    return results;
  }

  /**
   * Packs smartphone comparison datasets into styled printable markdown for export systems.
   */
  static formatForExport(calculated: SmartphoneCalculatedResult[]): string {
    const markdown = formatComparisonForExport(calculated);
    
    // Track export telemetry in Phase 8 (Observability)
    ObservabilityService.trackExport({
      exportType: "Markdown Clipboard",
      deviceCount: calculated.length,
      bytesGenerated: new TextEncoder().encode(markdown).length
    });

    return markdown;
  }

  /**
   * Performs asynchronous AI/LLM technical reports on specification comparisons.
   */
  static async comparePhones(phoneA: Smartphone, phoneB: Smartphone): Promise<CompareResponse> {
    const startTime = performance.now();
    let success = false;

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneA, phoneB }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "تعذر إكمال محاكاة المواجهة التقنية");
      }

      // Validate schema and return hydrated response
      const validated = CompareResponseSchema.parse({
        markdown: data.markdown,
        analyzedAt: data.analyzedAt || new Date().toISOString(),
      });

      success = true;
      return {
        markdown: validated.markdown,
        analyzedAt: validated.analyzedAt,
      };
    } finally {
      const duration = performance.now() - startTime;
      
      // Log diagnostics in Phase 8 (Observability)
      ObservabilityService.trackAiAnalysis({
        phoneAName: phoneA.name,
        phoneBName: phoneB.name,
        success,
        durationMs: duration
      });
    }
  }
}
