import { create } from "zustand";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AiState {
  // Analytical compare outputs
  markdownResult: string | null;
  analyzedAt: string;
  loadingStep: number;
  loadingStepsText: string[];
  
  // Chat Advisor thread
  chatMessages: Message[];
  isChatLoading: boolean;
  
  // Spec Generation logs
  genStatus: string | null;
  isGenerating: boolean;

  setMarkdownResult: (result: string | null) => void;
  setAnalyzedAt: (timestamp: string) => void;
  setLoadingStep: (step: number) => void;
  incrementLoadingStep: () => void;
  
  // Chat methods
  addChatMessage: (msg: Message) => void;
  setChatMessages: (messages: Message[]) => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;
  
  // Generation status methods
  setGenStatus: (status: string | null) => void;
  setGenerating: (generating: boolean) => void;
}

export const useAiStore = create<AiState>((set, get) => ({
  markdownResult: null,
  analyzedAt: "",
  loadingStep: 0,
  loadingStepsText: [
    "جاري فحص ومراجعة مدخلات الـ JSON للهاتفين...",
    "جاري مقارنة المعالجات وعدد الأنوية وحجم ترانزستور النانومتر...",
    "جاري تقييم قدرات مستشعرات الكاميرات وعينات المعالجة الرقيمة...",
    "جاري فحص كفاءة كيميائية الخلايا وسرعات تدفق الطاقة واستهلاك الشاشة...",
    "جاري طباعة المراجعة الحيادية وصياغة كتل التحليلات العميقة بالذكاء الاصطناعي..."
  ],

  chatMessages: [
    {
      role: "model",
      text: "أهلاً بك! أنا مستشارك الفني الذكي. اطرح عليّ أي سؤال بخصوص موازنة العتاد، المقارنة الحركية، كفاءة الألعاب والبطارية، أو الهواتف النشطة أعلاه وسأجيبك فوراً بحياد واحترافية."
    }
  ],
  isChatLoading: false,

  genStatus: null,
  isGenerating: false,

  setMarkdownResult: (result) => set({ markdownResult: result }),
  setAnalyzedAt: (timestamp) => set({ analyzedAt: timestamp }),
  setLoadingStep: (step) => set({ loadingStep: step }),
  incrementLoadingStep: () => {
    const current = get().loadingStep;
    if (current < get().loadingStepsText.length - 1) {
      set({ loadingStep: current + 1 });
    }
  },

  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setChatLoading: (loading) => set({ isChatLoading: loading }),
  clearChat: () => set({
    chatMessages: [
      {
        role: "model",
        text: "أهلاً بك! أنا مستشارك الفني الذكي. اطرح عليّ أي سؤال بخصوص موازنة العتاد وسأجيبك فوراً بحياد واحترافية."
      }
    ]
  }),

  setGenStatus: (status) => set({ genStatus: status }),
  setGenerating: (generating) => set({ isGenerating: generating }),
}));
