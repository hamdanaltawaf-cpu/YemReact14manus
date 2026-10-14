import { useState, useRef, useEffect } from "react";
import { useCompareStore } from "../store/compare.store";
import { useAiStore } from "../store/ai.store";
import { useSearchStore } from "../store/search.store";
import { useAdvisorChatMutation, useDiscoverPhonesMutation } from "../hooks/useQueries";
import { 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Send, 
  Compass, 
  HelpCircle, 
  DollarSign, 
  Camera, 
  Gamepad2, 
  Cpu, 
  Battery, 
  Layout, 
  ArrowRight,
  ChevronDown,
  Check,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AIAdvisorChat() {
  const { phoneA, phoneB, setPhoneA, setPhoneB } = useCompareStore();
  const { chatMessages, isChatLoading, addChatMessage } = useAiStore();
  const { searchQuery, setSearchQuery, discoveredPhones, setDiscoveredPhones } = useSearchStore();
  
  const advisorChatMutation = useAdvisorChatMutation();
  const discoverMutation = useDiscoverPhonesMutation();
  
  const [activeTab, setActiveTab] = useState<"chat" | "recommend">("chat");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Selected preset values for guided recommendation
  const [budget, setBudget] = useState("300$ - 600$ (الفئة المتوسطة)");
  const [cameraNeed, setCameraNeed] = useState("احترافية عالية الدقة لصناع المحتوى");
  const [gamingNeed, setGamingNeed] = useState("ألعاب ثقيلة ومعدلات إطارات عالية ومستمرة");
  const [batteryNeed, setBatteryNeed] = useState("شحن خارق فائق السرعة وبطارية ممتازة");
  const [screenNeed, setScreenNeed] = useState("عملاقة سينمائية لمشاهدة الميديا والألعاب");
  const [customNotes, setCustomNotes] = useState("");

  const budgetOptions = [
    "تحت 300$ (اقتصادي متوازن)",
    "300$ - 600$ (الفئة المتوسطة القوية)",
    "600$ - 1000$ (الفئة الرائدة شبه المكتملة)",
    "فوق 1000$ (الرائد الفائق والخارج عن المنافسة)"
  ];

  const cameraOptions = [
    "عدسات عادية للاستخدام اليومي والتوثيق البسيط",
    "احترافية عالية الدقة لصناع المحتوى والفلوغرز",
    "منظومة تكبير بصري وزوم فائقة وتصوير ليلي ممتاز"
  ];

  const gamingOptions = [
    "تصفح عادي واستخدام يومي (ألعاب خفيفة)",
    "ألعاب ثقيلة ومعدلات إطارات عالية ومستمرة",
  ];

  const batteryOptions = [
    "عمر بطارية طويل جداً وشاحن اقتصادي متزن",
    "شحن خارق فائق السرعة وبطارية تصمد يوم كامل"
  ];

  const screenOptions = [
    "مدمجة لسهولة التحكم المطلق باليد الواحدة",
    "عملاقة سينمائية لمشاهدة الميديا والألعاب"
  ];

  // Suggested prompt ideas for smartphone shopping
  const suggestedQueries = [
    "أيهما أفضل لتشغيل الألعاب الثقيلة؟",
    "هل يعاني أي من الهاتفين من مشاكل حرارة؟",
    "هل كاميرا هذا الهاتف أفضل في التصوير الليلي؟",
    "أيهما أسرع في الشحن الحقيقي وصحة البطارية؟",
    "أيهما يمثل قيمة حقيقية أفضل مقابل السعر؟"
  ];

  // Auto scroll chat to bottom when loaded
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isChatLoading) return;

    // Add User comment instantly
    addChatMessage({ role: "user", text: trimmed });
    setInput("");

    const chatHistory = chatMessages.map((m) => ({
      role: m.role,
      text: m.text
    }));

    // Trigger asynchronous React Query mutation
    advisorChatMutation.mutate({
      phoneA,
      phoneB,
      question: trimmed,
      history: chatHistory
    });
  };

  const handleGuidedRecommend = () => {
    let promptText = `أريد ترشيحاً لثلاثة هواتف ذكية وفق المعايير والظروف التالية: 
- الميزانية المحددة: ${budget}
- احتياج التصوير والكاميرات: ${cameraNeed}
- أداء الألعاب وتشغيل الألعاب الثقيلة: ${gamingNeed}
- عمر البطارية وسرعة الشحن: ${batteryNeed}
- حجم ونوع شاشة الهاتف: ${screenNeed}`;

    if (customNotes.trim()) {
      promptText += `\n- متطلبات إضافية خاصة بالمستخدم: ${customNotes.trim()}`;
    }

    discoverMutation.mutate(promptText);
  };

  const isDiscovering = discoverMutation.isPending;

  return (
    <div className="flex flex-col h-full font-sans bg-transparent" id="unified-ai-advisor-container">
      
      {/* 1. Header with custom Switch Tabs */}
      <div className="shrink-0 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center mb-4">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            activeTab === "chat"
              ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-md"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          id="tab-ai-chat"
        >
          <Bot size={14} />
          <span>اسأل المساعد 💬</span>
        </button>
        <button
          onClick={() => setActiveTab("recommend")}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            activeTab === "recommend"
              ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-md"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          id="tab-ai-recommend"
        >
          <Compass size={14} />
          <span>رشّح لي هاتفاً 📱</span>
        </button>
      </div>

      {/* 2. Main Tab Viewports */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-0.5" id="tab-views-scroll-area">
        <AnimatePresence mode="wait">
          
          {/* Active Tab A: FREE-FORM CHAT */}
          {activeTab === "chat" && (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col h-full justify-between"
            >
              <div className="flex-1 space-y-3.5 mb-4 max-h-[420px] overflow-y-auto pl-1 scrollbar-thin">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[88%] ${msg.role === "user" ? "mr-auto items-start" : "ml-auto items-end"}`}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-0.5 font-bold">
                      {msg.role === "user" ? (
                        <>
                          <User size={9} />
                          <span>أنت</span>
                        </>
                      ) : (
                        <>
                          <Bot size={9} className="text-indigo-600 dark:text-indigo-400" />
                          <span>المستشار الذكي</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[11px] sm:text-xs leading-relaxed shadow-xs ${
                        msg.role === "user"
                          ? "bg-slate-100 text-slate-850 dark:bg-slate-800 dark:text-slate-100 rounded-tr-none"
                          : "bg-indigo-600 text-white rounded-tl-none font-medium"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex flex-col max-w-[80%] ml-auto items-end">
                    <div className="flex items-center gap-1 text-[9px] text-indigo-650 dark:text-indigo-400 mb-0.5 font-bold">
                      <Bot size={9} className="animate-spin" />
                      <span>المستشار يدرس مراجعات السوق...</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-xs text-[10.5px] text-slate-500 flex items-center gap-2 font-bold animate-pulse">
                      <Loader2 size={12} className="animate-spin text-indigo-650 dark:text-indigo-400" />
                      <span>جاري الصياغة الفنية للمقارنة...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Helper suggestions */}
              {!isChatLoading && (
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 mb-3">
                  <span className="text-[9.5px] text-slate-400 dark:text-slate-505 font-black block mb-1.5">أسئلة تحليلية شائعة ومباشرة:</span>
                  <div className="flex flex-wrap gap-1 max-h-[75px] overflow-y-auto pr-0.5 scrollbar-thin">
                    {suggestedQueries.map((queryText, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => handleSendMessage(queryText)}
                        className="bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900/40 dark:hover:bg-indigo-950/20 text-slate-650 dark:text-slate-350 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/50 dark:border-slate-800 px-2 py-1 rounded-lg text-[9.5px] font-bold text-right cursor-pointer transition-all truncate"
                      >
                        {queryText}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat form fields */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex gap-1.5 shrink-0"
                id="drawer-advisor-message-form"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل المستشار أي سؤال فني أو مقارن..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right font-sans transition-all"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isChatLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 px-3.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} className="scale-x-[-1]" />
                </button>
              </form>
            </motion.div>
          )}

          {/* Active Tab B: GUIDED SMART RECOMMENDATION */}
          {activeTab === "recommend" && (
            <motion.div
              key="recommend-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              
              {/* If we have recommended devices, present them */}
              {discoveredPhones ? (
                <div className="space-y-3.5" id="drawer-discovered-container">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                    <span className="text-[10.5px] font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                      <Sparkles size={12} className="animate-pulse" />
                      <span>ترشيحاتنا الذكية المحسوبة لك:</span>
                    </span>
                    <button
                      onClick={() => setDiscoveredPhones(null)}
                      className="text-[9.5px] font-black text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={10} />
                      <span>تعديل المعايير</span>
                    </button>
                  </div>

                  <div className="space-y-3" id="drawer-discovered-list">
                    {discoveredPhones.map((phone, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/55 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 p-3 rounded-2xl relative flex flex-col justify-between"
                      >
                        {/* Compact Rank Tag */}
                        <div className="absolute top-2 left-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded px-1.5 py-0.5 text-[8.5px] font-black">
                          ترشيح #{idx + 1}
                        </div>

                        <div className="text-right space-y-1.5">
                          <div>
                            <span className="text-[8px] font-black text-indigo-650 dark:text-indigo-450 font-mono block mb-0.5">{phone.brand}</span>
                            <h5 className="text-[11.5px] font-black text-slate-850 dark:text-white truncate">{phone.name}</h5>
                          </div>

                          <div className="bg-amber-50/20 dark:bg-amber-950/10 p-1.5 rounded-lg border border-amber-200/20 text-[9px] font-bold text-amber-800 dark:text-amber-300 leading-snug">
                            🔥 ميزته الأقوى: {phone.other_specs}
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9.5px] text-slate-500 dark:text-slate-450 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <p className="truncate">📺 شاشة: {phone.screen}</p>
                            <p className="truncate">⚡ معالج: {phone.processor}</p>
                            <p className="truncate font-bold text-indigo-600 dark:text-indigo-400 col-span-2">💰 السعر المقدر: {phone.price_range}</p>
                          </div>
                        </div>

                        {/* Direct action loads inside the drawer */}
                        <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[9.5px]">
                          <button
                            onClick={() => setPhoneA(phone)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250/20 p-1.5 rounded-xl font-black text-center cursor-pointer transition-all flex items-center justify-center gap-0.5"
                          >
                            <span>تثبيت كـ A 🟢</span>
                            {phoneA.name === phone.name && <Check size={10} className="stroke-[3]" />}
                          </button>
                          <button
                            onClick={() => setPhoneB(phone)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-250/20 p-1.5 rounded-xl font-black text-center cursor-pointer transition-all flex items-center justify-center gap-0.5"
                          >
                            <span>تثبيت كـ B 🔵</span>
                            {phoneB.name === phone.name && <Check size={10} className="stroke-[3]" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Guided selectors form options */
                <div className="space-y-3.5" id="drawer-recommend-form">
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-205/10 mb-1">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      💡 حدد تفضيلاتك باستخدام الأزرار التفاعلية بالأسفل، وسيعمل معالج الترشيح على تصفية واستخلاص الهواتف العادلة والمطابقة تماماً.
                    </p>
                  </div>

                  {/* 1. Budget selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 font-black block flex items-center gap-1">
                      <DollarSign size={10} />
                      <span>الميزانية المالية المناسبة:</span>
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {budgetOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBudget(opt)}
                          className={`text-right p-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                            budget === opt
                              ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-600 dark:text-indigo-300 font-extrabold"
                              : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 text-slate-600 dark:text-slate-405"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Camera needs */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 font-black block flex items-center gap-1">
                      <Camera size={10} />
                      <span>قوة التصوير والعدسات:</span>
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {cameraOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCameraNeed(opt)}
                          className={`text-right p-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                            cameraNeed === opt
                              ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-600 dark:text-indigo-300 font-extrabold"
                              : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 text-slate-600 dark:text-slate-405"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Gaming Need */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 font-black block flex items-center gap-1">
                      <Gamepad2 size={10} />
                      <span>أداء الألعاب والثبات:</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                      {gamingOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setGamingNeed(opt)}
                          className={`text-center p-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                            gamingNeed === opt
                              ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm font-black"
                              : "text-slate-500"
                          }`}
                        >
                          {opt.split(" ")[0] + " " + (opt.split(" ")[1] || "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Battery Need */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 font-black block flex items-center gap-1">
                      <Battery size={10} />
                      <span>البطارية وسرعة الشحن المعماري:</span>
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {batteryOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBatteryNeed(opt)}
                          className={`text-right p-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                            batteryNeed === opt
                              ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-600 dark:text-indigo-300 font-extrabold"
                              : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800 text-slate-600 dark:text-slate-405"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Screen size */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 font-black block flex items-center gap-1">
                      <Layout size={10} />
                      <span>حجم الشاشة وبيئة العرض:</span>
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {screenOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setScreenNeed(opt)}
                          className={`text-right p-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                            screenNeed === opt
                              ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-600 dark:text-indigo-300 font-extrabold"
                              : "bg-slate-50/50 border-slate-200 dark:bg-slate-905/20 dark:border-slate-800 text-slate-605 dark:text-slate-405"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Note input */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 font-black block">إضافة ملاحظات أو ماركات مفضلة (اختياري):</span>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder='مثال: "أفضل هواتف سامسونج أو شاومي فقط..."'
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-805 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-right"
                    />
                  </div>

                  {/* Action trigger button */}
                  <button
                    onClick={handleGuidedRecommend}
                    disabled={isDiscovering}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDiscovering ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>جاري صب وتحليل التوصيات الفنية...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>تحليل الترشيحات بالذكاء الاصطناعي 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
