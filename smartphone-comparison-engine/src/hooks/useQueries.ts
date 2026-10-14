import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Smartphone, CompareResponse } from "../types";
import { PhoneService } from "../services/phone.service";
import { AiService } from "../services/ai.service";
import { ComparisonService } from "../services/comparison.service";
import { SearchService } from "../services/search.service";
import { useAiStore } from "../store/ai.store";
import { useSearchStore } from "../store/search.store";

/**
 * Hook to retrieve user reviews with cache and automatic stale-time configurations
 */
export function usePhoneReviewsQuery(phoneName: string) {
  return useQuery({
    queryKey: ["reviews", phoneName],
    queryFn: () => PhoneService.getPhoneReviews(phoneName),
    staleTime: 60 * 1000, // 1 minute stale time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to append phone review utilizing react-query mutations
 */
export function useAddReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phoneName, user, rating, comment }: { phoneName: string; user: string; rating: number; comment: string }) => {
      return PhoneService.addPhoneReview(phoneName, { user, rating, comment });
    },
    onSuccess: (_, variables) => {
      // Invalidate target cache index to force instant refresh
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.phoneName] });
    }
  });
}

/**
 * Hook to execute the main dual-phone technical comparison
 */
export function useComparePhonesMutation() {
  const { setMarkdownResult, setAnalyzedAt } = useAiStore();
  
  return useMutation({
    mutationKey: ["compare-phones"],
    mutationFn: async ({ phoneA, phoneB }: { phoneA: Smartphone; phoneB: Smartphone }) => {
      return await ComparisonService.comparePhones(phoneA, phoneB);
    },
    onSuccess: (data) => {
      setMarkdownResult(data.markdown);
      setAnalyzedAt(data.analyzedAt);
    },
    retry: 1, // Safe retry fallback
  });
}

/**
 * Hook to generate specifications using AI for empty/partially filled phone names
 */
export function useGenerateSpecsMutation() {
  const { setGenStatus, setGenerating } = useAiStore();
  
  return useMutation({
    mutationKey: ["generate-specs"],
    mutationFn: async (phoneName: string) => {
      setGenerating(true);
      setGenStatus("جاري استخلاص وفحص أبعاد الهاتف بالذكاء الاصطناعي...");
      return await AiService.generateSpecs(phoneName);
    },
    onSuccess: (specs) => {
      setGenStatus("تم استخراج البيانات الرقمية وترشيحها بنجاح!");
      setGenerating(false);
      setTimeout(() => setGenStatus(null), 3500);
    },
    onError: (err: any) => {
      setGenStatus(`فشل: ${err.message || "تعذر الاستخلاص التقني حالياً."}`);
      setGenerating(false);
      setTimeout(() => setGenStatus(null), 4000);
    }
  });
}

/**
 * Hook to chat with the AI Advisor chatbot
 */
export function useAdvisorChatMutation() {
  const { addChatMessage, setChatLoading } = useAiStore();
  
  return useMutation({
    mutationKey: ["advisor-chat"],
    mutationFn: async ({
      phoneA,
      phoneB,
      question,
      history
    }: {
      phoneA: Smartphone;
      phoneB: Smartphone;
      question: string;
      history: { role: "user" | "model"; text: string }[];
    }) => {
      setChatLoading(true);
      return await AiService.chatWithAdvisor(phoneA, phoneB, question, history);
    },
    onSuccess: (answer) => {
      addChatMessage({ role: "model", text: answer });
      setChatLoading(false);
    },
    onError: (err: any) => {
      addChatMessage({
        role: "model",
        text: `عذرًا، حدث خطأ أثناء الاتصال بالمستشار: ${err.message || "الرجاء المحاولة لاحقاً."}`
      });
      setChatLoading(false);
    }
  });
}

/**
 * Hook to search/discover recommendation matching custom prompts
 */
export function useDiscoverPhonesMutation() {
  const { setDiscoveredPhones, addSearchHistory } = useSearchStore();
  
  return useMutation({
    mutationKey: ["discover-phones"],
    mutationFn: async (query: string) => {
      return await SearchService.discoverPhones(query);
    },
    onSuccess: (phones, query) => {
      setDiscoveredPhones(phones);
      addSearchHistory(query);
    }
  });
}
