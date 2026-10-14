export class ObservabilityService {
  static trackSearch(data: { query: string; resultsCount: number }): void {
    console.log("[Observability] Search event track:", data);
  }

  static trackComparison(data: {
    deviceCount: number;
    durationMs: number;
    deviceNames: string[];
    customWeightsUsed: boolean;
  }): void {
    console.log("[Observability] Comparison event track:", data);
  }

  static trackExport(data: {
    exportType: string;
    deviceCount: number;
    bytesGenerated: number;
  }): void {
    console.log("[Observability] Export event track:", data);
  }

  static trackAiAnalysis(data: any): void {
    console.log("[Observability] AI Analysis event track:", data);
  }
}
