import { Smartphone } from "../types";
import { Layers, Battery, Clock, Zap, Sparkles } from "lucide-react";
import { useState } from "react";

interface SpecsRadarChartProps {
  phoneA: Smartphone;
  phoneB: Smartphone;
}

export function scorePhone(phone: Smartphone) {
  // 1. Performance (out of 10)
  let performance = 6.5;
  const proc = (phone.processor || "").toLowerCase();
  const storage = (phone.storage || "").toLowerCase();
  const name = (phone.name || "").toLowerCase();
  
  if (proc.includes("snapdragon 8 gen 3") || proc.includes("a17 pro") || proc.includes("a18") || name.includes("16 pro") || name.includes("s24 ultra")) performance = 9.8;
  else if (proc.includes("snapdragon 8") || proc.includes("a16") || proc.includes("dimensity 9") || name.includes("15 pro")) performance = 9.2;
  else if (proc.includes("tensor g3") || proc.includes("a15") || proc.includes("dimensity 8") || name.includes("pixel 8")) performance = 8.5;
  else if (proc.includes("tensor") || proc.includes("snapdragon 7") || proc.includes("exynos")) performance = 7.5;
  
  if (storage.includes("16 جيجا") || storage.includes("16gb") || storage.includes("16 رام")) performance = Math.min(10, performance + 0.5);
  if (storage.includes("12 جيجا") || storage.includes("12gb") || storage.includes("12 رام")) performance = Math.min(10, performance + 0.2);

  // 2. Battery (out of 10)
  let batteryScore = 7.0;
  const batText = (phone.battery || "").toLowerCase();
  const mahMatch = batText.match(/(\d{4})\s*مللي|(\d{4})\s*mah/);
  if (mahMatch) {
    const mah = parseInt(mahMatch[1] || mahMatch[2]);
    if (mah >= 5500) batteryScore = 10.0;
    else if (mah >= 5000) batteryScore = 9.2;
    else if (mah >= 4500) batteryScore = 8.2;
    else if (mah >= 4000) batteryScore = 7.2;
    else batteryScore = 6.0;
  } else {
    if (batText.includes("5400") || batText.includes("5500")) batteryScore = 9.8;
    else if (batText.includes("5000")) batteryScore = 9.2;
    else if (batText.includes("4500") || batText.includes("4441")) batteryScore = 8.0;
  }

  // 3. Screen (out of 10)
  let screenScore = 7.0;
  const scr = (phone.screen || "").toLowerCase();
  if (scr.includes("120hz") || scr.includes("120 هرتز") || scr.includes("120 hertz")) screenScore = 8.5;
  if (scr.includes("ltpo") || scr.includes("dynamic amoled") || scr.includes("super retina")) screenScore = 9.5;
  if (scr.includes("4500 شمعة") || scr.includes("2600 شمعة") || scr.includes("4500 nits") || scr.includes("brightness")) screenScore = 9.9;
  if (scr.includes("2k") || scr.includes("qhd")) screenScore = Math.min(10, screenScore + 0.2);

  // 4. Camera (out of 10)
  let cameraScore = 7.2;
  const cam = (phone.camera || "").toLowerCase();
  if (cam.includes("200 م") || cam.includes("200mp") || cam.includes("بيريسكوب")) cameraScore = 9.8;
  else if (cam.includes("hasselblad") || cam.includes("leica") || cam.includes("zeiss")) cameraScore = 9.6;
  else if (cam.includes("تقريب بصري 5x") || cam.includes("5x optical") || cam.includes("5x zoom")) cameraScore = 9.4;
  else if (cam.includes("48 م") || cam.includes("50 م") || cam.includes("48mp") || cam.includes("50mp")) cameraScore = 8.8;

  // 5. Charging (out of 10)
  let chargingScore = 5.0;
  const chg = (phone.charging || "").toLowerCase();
  const wattMatch = chg.match(/(\d+)\s*واط|(\d+)\s*w/);
  if (wattMatch) {
    const watt = parseInt(wattMatch[1] || wattMatch[2]);
    if (watt >= 100) chargingScore = 9.9;
    else if (watt >= 80) chargingScore = 9.5;
    else if (watt >= 65) chargingScore = 9.0;
    else if (watt >= 45) chargingScore = 8.2;
    else if (watt >= 30) chargingScore = 7.2;
    else if (watt >= 20) chargingScore = 6.2;
  } else {
    if (chg.includes("100") || chg.includes("120")) chargingScore = 9.9;
    else if (chg.includes("80") || chg.includes("67")) chargingScore = 9.0;
    else if (chg.includes("45")) chargingScore = 8.0;
    else if (chg.includes("30") || chg.includes("25")) chargingScore = 7.0;
  }

  // 6. Value for money (out of 10)
  let valueScore = 7.5;
  const priceText = (phone.price_range || "").replace(/[^0-9]/g, "");
  if (priceText) {
    const price = parseInt(priceText);
    if (price <= 300) valueScore = 9.6;
    else if (price <= 500) valueScore = 9.0;
    else if (price <= 800) valueScore = 8.2;
    else if (price <= 1000) valueScore = 7.5;
    else if (price > 1200) valueScore = 6.8;
  }
  
  if (phone.brand === "OnePlus" || phone.brand === "Xiaomi" || phone.brand === "Poco" || phone.brand === "Realme" || phone.brand === "Google") {
    valueScore = Math.min(10, valueScore + 0.8);
  }

  return {
    performance,
    battery: batteryScore,
    screen: screenScore,
    camera: cameraScore,
    charging: chargingScore,
    value: valueScore,
  };
}

export function estimateBatteryMetrics(phone: Smartphone) {
  const batText = (phone.battery || "").toLowerCase();
  const scrText = (phone.screen || "").toLowerCase();
  const procText = (phone.processor || "").toLowerCase();
  const nameText = (phone.name || "").toLowerCase();

  // Extract capacity
  let capacity = 5000; // default
  const mahMatch = batText.match(/(\d{4})\s*مللي|(\d{4})\s*mah/);
  if (mahMatch) {
    capacity = parseInt(mahMatch[1] || mahMatch[2], 10);
  } else {
    const numMatch = batText.match(/\b(3\d{3}|4\d{3}|5\d{3}|6\d{3})\b/);
    if (numMatch) {
      capacity = parseInt(numMatch[1], 10);
    } else {
      if (phone.brand === "Apple") {
        if (nameText.includes("max") || nameText.includes("plus")) capacity = 4600;
        else capacity = 3560;
      } else if (phone.brand === "Samsung") {
        if (nameText.includes("ultra")) capacity = 5000;
        else if (nameText.includes("plus")) capacity = 4700;
        else capacity = 4000;
      } else if (phone.brand === "Google") {
        if (nameText.includes("xl") || nameText.includes("pro max")) capacity = 5060;
        else capacity = 4700;
      }
    }
  }

  // Calculate efficiency multiplier (higher is more energy efficient)
  let efficiency = 1.0;
  
  if (procText.includes("a18") || nameText.includes("16 pro") || nameText.includes("16 plus") || nameText.includes("16 ultr")) {
    efficiency = 1.45;
  } else if (procText.includes("a17") || nameText.includes("15 pro")) {
    efficiency = 1.35;
  } else if (procText.includes("a16") || nameText.includes("15 ") || nameText.includes("14 pro")) {
    efficiency = 1.25;
  } else if (procText.includes("snapdragon 8 gen 4")) {
    efficiency = 1.40;
  } else if (procText.includes("snapdragon 8 gen 3")) {
    efficiency = 1.30;
  } else if (procText.includes("snapdragon 8 gen 2")) {
    efficiency = 1.15;
  } else if (procText.includes("dimensity 9300") || procText.includes("dimensity 9400") || procText.includes("dimensity 9")) {
    efficiency = 1.25;
  } else if (procText.includes("tensor g4") || procText.includes("tensor g3")) {
    efficiency = 1.10;
  } else if (procText.includes("exynos 2400")) {
    efficiency = 1.12;
  }

  // Screen characteristics
  const isLtpo = scrText.includes("ltpo") || scrText.includes("تحديث متغير") || nameText.includes("ultra") || nameText.includes("pro max");
  const isOled = scrText.includes("oled") || scrText.includes("amoled") || scrText.includes("retina");

  // Define milliwatt/hour equivalents or mAh drain per hour
  let readingDrain = 280; 
  if (isLtpo) readingDrain -= 75; 
  if (!isOled) readingDrain += 40; 
  readingDrain /= efficiency;

  let browsingDrain = 380; 
  if (isLtpo) browsingDrain -= 45;
  if (!isOled) browsingDrain += 30; 
  browsingDrain /= efficiency;

  let videoDrain = 340; 
  if (isOled) videoDrain -= 35; 
  videoDrain /= efficiency;

  let socialDrain = 480; 
  if (isLtpo) socialDrain -= 35;
  socialDrain /= efficiency;

  let gamingDrain = 950; 
  gamingDrain /= efficiency;

  return {
    capacity,
    reading: Math.max(3, parseFloat((capacity / readingDrain).toFixed(1))),
    browsing: Math.max(3, parseFloat((capacity / browsingDrain).toFixed(1))),
    video: Math.max(4, parseFloat((capacity / videoDrain).toFixed(1))),
    social: Math.max(3, parseFloat((capacity / socialDrain).toFixed(1))),
    gaming: Math.max(1.5, parseFloat((capacity / gamingDrain).toFixed(1))),
  };
}

export default function SpecsRadarChart({ phoneA, phoneB }: SpecsRadarChartProps) {
  const scoresA = scorePhone(phoneA);
  const scoresB = scorePhone(phoneB);

  const metricsA = estimateBatteryMetrics(phoneA);
  const metricsB = estimateBatteryMetrics(phoneB);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"radar" | "battery">("radar");

  // 6 Radar Categories
  const categories = [
    { key: "screen", label: "الشاشة 📺" },
    { key: "performance", label: "الأداء ⚡" },
    { key: "camera", label: "التصوير 📸" },
    { key: "battery", label: "البطارية 🔋" },
    { key: "charging", label: "الشحن 🔌" },
    { key: "value", label: "القيمة لـ $ 💰" }
  ];

  const cx = 160;
  const cy = 160;
  const maxRadius = 100;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    const radius = (Math.min(10, Math.max(0, value)) / 10) * maxRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { x, y };
  };

  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
    const points = Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      const radius = scale * maxRadius;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    });
    return points.join(" ");
  });

  const pointsA = categories.map((cat, idx) => {
    const val = scoresA[cat.key as keyof typeof scoresA];
    const coords = getCoordinates(idx, val);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  const pointsB = categories.map((cat, idx) => {
    const val = scoresB[cat.key as keyof typeof scoresB];
    const coords = getCoordinates(idx, val);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // 5 Battery Activities
  const batteryActivities = [
    { label: "قراءة", icon: "📖", key: "reading" as keyof typeof metricsA, desc: "تحديث شاشة وبكمون منخفض" },
    { label: "تصفح ويب", icon: "🌐", key: "browsing" as keyof typeof metricsA, desc: "خلفيات بيضاء ورفع بيانات" },
    { label: "بث فيديو", icon: "🎬", key: "video" as keyof typeof metricsA, desc: "تشغيل متصل وفك عتاد" },
    { label: "تواصل اجتماعي", icon: "👥", key: "social" as keyof typeof metricsA, desc: "تحديث صور وتمرير مستمر" },
    { label: "ألعاب ثقيلة", icon: "🎮", key: "gaming" as keyof typeof metricsA, desc: "حمل عالي وتردد شاشة أقصى" }
  ];

  const maxVal = Math.max(
    metricsA.reading, metricsB.reading,
    metricsA.browsing, metricsB.browsing,
    metricsA.video, metricsB.video,
    metricsA.social, metricsB.social,
    metricsA.gaming, metricsB.gaming
  );
  const maxY = Math.ceil(maxVal / 5) * 5;

  const getLineX = (index: number) => 40 + index * 80;
  const getLineY = (hours: number) => 160 - (hours / maxY) * 140;

  const pointsLineA = batteryActivities.map((act, idx) => {
    const hours = metricsA[act.key] as number;
    return `${getLineX(idx)},${getLineY(hours)}`;
  }).join(" ");

  const pointsLineB = batteryActivities.map((act, idx) => {
    const hours = metricsB[act.key] as number;
    return `${getLineX(idx)},${getLineY(hours)}`;
  }).join(" ");

  const areaPointsA = `${batteryActivities.map((act, idx) => {
    const hours = metricsA[act.key] as number;
    return `${getLineX(idx)},${getLineY(hours)}`;
  }).join(" ")} 360,160 40,160`;

  const areaPointsB = `${batteryActivities.map((act, idx) => {
    const hours = metricsB[act.key] as number;
    return `${getLineX(idx)},${getLineY(hours)}`;
  }).join(" ")} 360,160 40,160`;

  return (
    <div className="bg-white/80 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-5 sm:p-6 font-sans shadow-md" id="analytical-visual-charts-section">
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/5 mb-5 overflow-x-auto whitespace-nowrap scrollbar-none gap-2" dir="rtl">
        <button
          onClick={() => setActiveTab("radar")}
          className={`pb-3 px-4 font-black transition-all border-b-2 text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${
            activeTab === "radar"
              ? "border-indigo-600 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          type="button"
          id="tab-radar-chart"
        >
          <Layers size={14} />
          <span>رادار الميزات والسمات الفنية 📊</span>
        </button>
        <button
          onClick={() => setActiveTab("battery")}
          className={`pb-3 px-4 font-black transition-all border-b-2 text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${
            activeTab === "battery"
              ? "border-indigo-600 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          type="button"
          id="tab-battery-chart"
        >
          <Battery size={14} />
          <span>أداء الساعات وعينات تشغيل الشاشة (SOT) 🔋</span>
        </button>
      </div>

      <div className="animate-fade-in text-right">
        {activeTab === "radar" && (
          /* Radar Chart Panel */
          <div className="bg-white/45 dark:bg-slate-950/20 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col items-center gap-6" id="specs-radar-chart-container">
            
            <div className="w-full flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2 mb-1">
              <Layers className="text-indigo-650 dark:text-indigo-400 shrink-0" size={16} />
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">تحليل رادار مقارنة عتاد ومميزات الهواتف</h4>
            </div>

            {/* SVG Radar */}
            <div className="relative w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] flex-shrink-0" id="radar-svg-wrapper">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 320">
                {gridRings.map((ringPoints, i) => (
                  <polygon
                    key={i}
                    points={ringPoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth={i === 4 ? 1.5 : 1}
                    strokeDasharray={i < 4 ? "3,3" : "none"}
                  />
                ))}

                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
                  const x = cx + maxRadius * Math.cos(angle);
                  const y = cy + maxRadius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-250 dark:text-slate-800"
                      strokeWidth={1}
                    />
                  );
                })}

                <polygon
                  points={pointsA}
                  fill="rgba(79, 70, 229, 0.22)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  className="transition-all duration-500 drop-shadow-[0_0_4px_rgba(79,70,229,0.3)]"
                />

                <polygon
                  points={pointsB}
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  className="transition-all duration-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                />

                {categories.map((cat, idx) => {
                  const val = scoresA[cat.key as keyof typeof scoresA];
                  const coords = getCoordinates(idx, val);
                  return (
                    <circle
                      key={`a-${idx}`}
                      cx={coords.x}
                      cy={coords.y}
                      r={4}
                      fill="#4f46e5"
                      stroke="#fff"
                      strokeWidth={1}
                      className="transition-all duration-500"
                    />
                  );
                })}

                {categories.map((cat, idx) => {
                  const val = scoresB[cat.key as keyof typeof scoresB];
                  const coords = getCoordinates(idx, val);
                  return (
                    <circle
                      key={`b-${idx}`}
                      cx={coords.x}
                      cy={coords.y}
                      r={4}
                      fill="#10b981"
                      stroke="#fff"
                      strokeWidth={1}
                      className="transition-all duration-500"
                    />
                  );
                })}

                {categories.map((cat, idx) => {
                  const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                  const textRadius = maxRadius + 22;
                  const x = cx + textRadius * Math.cos(angle);
                  const y = cy + textRadius * Math.sin(angle);
                  
                  let textAnchor: "start" | "end" | "middle" = "middle";
                  if (Math.cos(angle) > 0.1) textAnchor = "start";
                  if (Math.cos(angle) < -0.1) textAnchor = "end";

                  return (
                    <text
                      key={idx}
                      x={x}
                      y={y + 4}
                      textAnchor={textAnchor}
                      className="fill-slate-700 dark:fill-slate-350 font-sans font-extrabold text-[12px] select-none"
                    >
                      {cat.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4" id="radar-scoring-badges-grid">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-150/25 dark:border-indigo-900/10">
                <span className="text-xs font-black text-indigo-755 dark:text-indigo-300 block mb-2.5 font-mono truncate">{phoneA.name || "هاتف A"}</span>
                <div className="space-y-1.5 animate-fade-in">
                  {categories.map((cat) => (
                    <div key={cat.key} className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-extrabold">{cat.label.split(" ")[0]}</span>
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{scoresA[cat.key as keyof typeof scoresA]}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/40 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-150/25 dark:border-emerald-900/10">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block mb-2.5 font-mono truncate">{phoneB.name || "هاتف B"}</span>
                <div className="space-y-1.5 animate-fade-in">
                  {categories.map((cat) => (
                    <div key={cat.key} className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-extrabold">{cat.label.split(" ")[0]}</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{scoresB[cat.key as keyof typeof scoresB]}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "battery" && (
          /* Battery Longevity Line Chart Panel */
          <div className="bg-white/45 dark:bg-slate-950/20 border border-slate-205/65 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between gap-5" id="battery-longevity-chart-container">
            
            <div className="w-full flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Battery className="text-emerald-500 dark:text-emerald-400 shrink-0" size={16} />
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">تحليل كفاءة البطارية ومُعامل تشغيل الشاشة (SOT)</h4>
              </div>
              <span className="bg-emerald-50 text-emerald-705 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                <Sparkles size={10} />
                مُحسَب بدقة تقريبية
              </span>
            </div>

            {/* SVG Line Chart */}
            <div className="relative w-full h-[200px]" id="battery-line-chart-wrapper">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="area-gradient-a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="area-gradient-b" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.33, 0.66, 1].map((ratio) => {
                  const hours = ratio * maxY;
                  const y = getLineY(hours);
                  return (
                    <g key={ratio} className="opacity-70 dark:opacity-30">
                      <line
                        x1={40}
                        y1={y}
                        x2={360}
                        y2={y}
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                      />
                      <text
                        x={370}
                        y={y + 3}
                        className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px] font-bold"
                        textAnchor="start"
                      >
                        {Math.round(hours)} س
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area Below Line A */}
                <polygon
                  points={areaPointsA}
                  fill="url(#area-gradient-a)"
                  className="transition-all duration-500"
                />

                {/* Shaded Area Below Line B */}
                <polygon
                  points={areaPointsB}
                  fill="url(#area-gradient-b)"
                  className="transition-all duration-500"
                />

                {/* Path Line A (Phone A, Indigo) */}
                <polyline
                  points={pointsLineA}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 drop-shadow-[0_1px_3px_rgba(79,70,229,0.3)]"
                />

                {/* Path Line B (Phone B, Emerald) */}
                <polyline
                  points={pointsLineB}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 drop-shadow-[0_1px_3px_rgba(16,185,129,0.3)]"
                />

                {/* Vertical dotted hovered highlights cursor */}
                {hoveredIndex !== null && (
                  <line
                    x1={getLineX(hoveredIndex)}
                    y1={20}
                    x2={getLineX(hoveredIndex)}
                    y2={160}
                    stroke="currentColor"
                    className="text-indigo-500/40 dark:text-indigo-400/30"
                    strokeWidth={1.5}
                    strokeDasharray="2,2"
                  />
                )}

                {/* Vertex Markers Phone A */}
                {batteryActivities.map((act, idx) => {
                  const hours = metricsA[act.key] as number;
                  return (
                    <circle
                      key={`v-a-${idx}`}
                      cx={getLineX(idx)}
                      cy={getLineY(hours)}
                      r={hoveredIndex === idx ? 6 : 4}
                      fill="#4f46e5"
                      stroke="#fff"
                      strokeWidth={hoveredIndex === idx ? 2 : 1}
                      className="transition-all duration-200"
                    />
                  );
                })}

                {/* Vertex Markers Phone B */}
                {batteryActivities.map((act, idx) => {
                  const hours = metricsB[act.key] as number;
                  return (
                    <circle
                      key={`v-b-${idx}`}
                      cx={getLineX(idx)}
                      cy={getLineY(hours)}
                      r={hoveredIndex === idx ? 6 : 4}
                      fill="#10b981"
                      stroke="#fff"
                      strokeWidth={hoveredIndex === idx ? 2 : 1}
                      className="transition-all duration-200"
                    />
                  );
                })}

                {/* X Axis labels */}
                {batteryActivities.map((act, idx) => {
                  const x = getLineX(idx);
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={180}
                      textAnchor="middle"
                      className={`font-sans font-extrabold text-[10px] select-none transition-all ${hoveredIndex === idx ? "fill-indigo-600 dark:fill-indigo-400 text-xs scale-105" : "fill-slate-500 dark:fill-slate-400"}`}
                    >
                      {act.label}
                    </text>
                  );
                })}

                {/* Interactive invisible columns to ease hover selection */}
                {batteryActivities.map((_, idx) => {
                  const x = getLineX(idx);
                  return (
                    <rect
                      key={idx}
                      x={x - 25}
                      y={15}
                      width={50}
                      height={155}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Interactive detail highlight display */}
            <div className="bg-slate-100/40 dark:bg-slate-950/20 border border-slate-205/60 dark:border-slate-800 p-3.5 rounded-2xl font-sans">
              {hoveredIndex === null ? (
                <div className="flex items-center gap-2 justify-center text-slate-500 dark:text-slate-400 text-xs py-1.5">
                  <span className="animate-pulse">👈</span>
                  <span className="font-extrabold">مرر مؤشر الماوس فوق أعمدة النشاط أعلاه للمقارنة الزمنية الدقيقة</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-rose-200/10 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>{batteryActivities[hoveredIndex].icon}</span>
                      <span>مقارنة التشغيل في سيناريو: {batteryActivities[hoveredIndex].label}</span>
                    </span>
                    <span className="text-[10px] text-slate-405 dark:text-slate-500 font-extrabold font-sans">
                      {batteryActivities[hoveredIndex].desc}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-0.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-[#4f46e5]/90 truncate max-w-[110px]">{phoneA.name || "أبل"}</span>
                      <span className="font-mono font-black text-indigo-755 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg">
                        {metricsA[batteryActivities[hoveredIndex].key]} ساعات
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-[#10b981]/90 truncate max-w-[110px]">{phoneB.name || "سامسونج"}</span>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg">
                        {metricsB[batteryActivities[hoveredIndex].key]} ساعات
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-0.5">
              <div className="bg-indigo-50/10 dark:bg-indigo-950/10 p-3 rounded-xl border border-indigo-100/10 dark:border-indigo-950/30">
                <div className="flex justify-between items-center text-[11px] font-sans">
                  <span className="text-slate-500 dark:text-slate-450 font-extrabold">السعة المقدرة لـ {phoneA.brand}</span>
                  <span className="font-mono font-black text-indigo-755 dark:text-indigo-400">{metricsA.capacity} mAh</span>
                </div>
              </div>
              <div className="bg-emerald-50/10 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100/10 dark:border-emerald-955/30">
                <div className="flex justify-between items-center text-[11px] font-sans">
                  <span className="text-slate-500 dark:text-slate-450 font-extrabold">السعة المقدرة لـ {phoneB.brand}</span>
                  <span className="font-mono font-black text-emerald-650 dark:text-emerald-400">{metricsB.capacity} mAh</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
