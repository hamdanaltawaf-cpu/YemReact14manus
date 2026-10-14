import { useEffect } from "react";
import { useCompareStore } from "../store/compare.store";
import { useAiStore } from "../store/ai.store";
import { useAppStore } from "../store/app.store";
import { useComparePhonesMutation } from "./useQueries";

export function useSmartphoneCompare() {
  const {
    phoneA,
    phoneB,
    setPhoneA,
    setPhoneB,
    swapPhones,
    selectTemplate,
    battles,
    voteInBattle,
  } = useCompareStore();

  const {
    markdownResult,
    analyzedAt,
    loadingStep,
    loadingStepsText,
    setLoadingStep,
    incrementLoadingStep,
    setMarkdownResult,
  } = useAiStore();

  const {
    appError,
    setAppError,
    initTheme,
  } = useAppStore();

  // On mount, align DOM body background theme classes safely
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Hook up TanStack Query comparison mutation
  const compareMutation = useComparePhonesMutation();

  const executeComparison = () => {
    setMarkdownResult(null);
    setAppError(null);
    setLoadingStep(0);

    // Increment visual step indicators during AI processing
    const interval = setInterval(() => {
      incrementLoadingStep();
    }, 2500);

    compareMutation.mutate(
      { phoneA, phoneB },
      {
        onSuccess: () => {
          clearInterval(interval);
        },
        onError: (err: any) => {
          clearInterval(interval);
          setAppError(
            err.message || 
            "فشل الاتصال بالخادم لإجراء المقارنة المتقدمة. يرجى مراجعة اتصال الشبكة والـ API key."
          );
        },
      }
    );
  };

  return {
    phoneA,
    setPhoneA,
    phoneB,
    setPhoneB,
    markdownResult,
    setMarkdownResult,
    analyzedAt,
    isLoading: compareMutation.isPending,
    errorMsg: appError,
    setErrorMsg: setAppError,
    loadingStep,
    loadingStepsText,
    battles,
    handleVote: voteInBattle,
    handleTemplateSelect: (idx: number) => {
      selectTemplate(idx);
      setMarkdownResult(null);
      setAppError(null);
    },
    handleSwapPhones: () => {
      swapPhones();
      setMarkdownResult(null);
      setAppError(null);
    },
    executeComparison,
  };
}
