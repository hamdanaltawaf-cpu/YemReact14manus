import { Smartphone, CompareResponse } from "../types";

/**
 * Service to handle all API communications with TechCompare Backend
 */
export class ApiService {
  /**
   * Generates or researches specifications for any smartphone name
   */
  static async generateSpecs(name: string): Promise<Smartphone> {
    const response = await fetch("/api/generate-specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "فشل في العثور على المواصفات");
    }

    if (!data.specs) {
      throw new Error("لم يتم إرجاع مواصفات صحيحة للهاتف.");
    }

    return data.specs;
  }

  /**
   * Compares two smartphone specifications and returns AI technical report
   */
  static async comparePhones(phoneA: Smartphone, phoneB: Smartphone): Promise<CompareResponse> {
    const response = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneA, phoneB }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "فشل في إكمال المقارنة");
    }

    return {
      markdown: data.markdown,
      analyzedAt: data.analyzedAt || new Date().toISOString(),
    };
  }

  /**
   * Searches/Discovers smartphones matching custom requirements dynamically
   */
  static async discoverPhones(query: string): Promise<Smartphone[]> {
    const response = await fetch("/api/discover-phones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "فشل الاتصال بالذكاء الاصطناعي لاكتشاف الهواتف.");
    }

    if (data.phones && Array.isArray(data.phones)) {
      return data.phones;
    }

    throw new Error("لم يتم العثور على توصيات بالذكاء الاصطناعي حالياً.");
  }

  /**
   * Converses with the AI Advisor chatbot about active smartphone slots
   */
  static async chatWithAdvisor(
    phoneA: Smartphone,
    phoneB: Smartphone,
    question: string,
    history: { role: "user" | "model"; text: string }[]
  ): Promise<string> {
    const chatHistory = history.map((h) => ({
      role: h.role,
      text: h.text,
    }));

    const response = await fetch("/api/advisor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneA,
        phoneB,
        question,
        history: chatHistory,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "تعذر صياغة رد مناسب.");
    }

    return data.answer || "عذرًا، لم أتمكن من إيجاد رد دقيق في هذا الوقت.";
  }
}
