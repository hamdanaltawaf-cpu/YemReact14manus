import { useState, useRef } from "react";
import { Smartphone } from "../types";
import { scorePhone } from "./SpecsRadarChart";
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Image as ImageIcon,
  Palette,
  Info,
  Smartphone as PhoneIcon,
  X,
  Star,
  FileText
} from "lucide-react";
import { exportToPDF } from "../utils/pdfExport";
import { ScoringService } from "../services/scoring.service";
import { MediaService } from "../services/media.service";

interface ShareSocialCardProps {
  phoneA: Smartphone;
  phoneB: Smartphone;
  markdown?: string;
  analyzedAt?: string;
  onClose?: () => void;
}

type CardTheme = "cyberpunk" | "twilight" | "gold" | "emerald-vs-indigo";

export default function ShareSocialCard({ phoneA, phoneB, markdown = "", analyzedAt = "الآن", onClose }: ShareSocialCardProps) {
  const [activeTheme, setActiveTheme] = useState<CardTheme>("emerald-vs-indigo");
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Retrieve calculated scores for both devices
  const scoreA = scorePhone(phoneA);
  const scoreB = scorePhone(phoneB);

  // Resolve unified media images at component root scope for reuse in Preview, Canvas, and PDF export channels
  const mediaA = MediaService.resolvePhoneMedia(phoneA);
  const mediaB = MediaService.resolvePhoneMedia(phoneB);
  const imgUrlA = mediaA?.thumbnailUrl || MediaService.FALLBACK_PHONE_THUMBNAIL;
  const imgUrlB = mediaB?.thumbnailUrl || MediaService.FALLBACK_PHONE_THUMBNAIL;

  // Calculate overall rating
  const avgA = (
    (scoreA.screen + scoreA.performance + scoreA.camera + scoreA.battery + scoreA.charging + scoreA.value) / 6
  ).toFixed(1);

  const avgB = (
    (scoreB.screen + scoreB.performance + scoreB.camera + scoreB.battery + scoreB.charging + scoreB.value) / 6
  ).toFixed(1);

  const floatAvgA = parseFloat(avgA);
  const floatAvgB = parseFloat(avgB);
  const winner = floatAvgA > floatAvgB ? phoneA : floatAvgA < floatAvgB ? phoneB : null;

  // Formatting short, beautiful summary sentences
  const verdictSummary = winner 
    ? `🏆 الفائز الفني هو: ${winner.name} بمتوسط نقاط فنية بلغ ${Math.max(floatAvgA, floatAvgB)} من 10.`
    : `🤝 تعادل هندسي وثيق بنقاط قدرها ${avgA} من 10 لكلا الهاتفين.`;

  // Dynamic category mapping for both Canvas and HTML preview
  const catKeys = [
    { key: "screen", label: "الشاشة" },
    { key: "performance", label: "الأداء" },
    { key: "camera", label: "التصوير" },
    { key: "battery", label: "البطارية" },
    { key: "charging", label: "الشحن" },
    { key: "value", label: "القيمة" }
  ];

  // Dynamic Theme Definitions for CSS Card Preview and Canvas Draw
  const themeStyles = {
    "emerald-vs-indigo": {
      name: "شفق التيتانيوم الرائد",
      bgGradient: "from-slate-950 via-[#0d1527] to-slate-950",
      accentA: "#4f46e5", // Indigo
      accentB: "#10b981", // Emerald
      bgCard: "bg-slate-900/70 border-slate-800/80",
      textA: "text-indigo-400",
      textB: "text-emerald-400"
    },
    twilight: {
      name: "ليل كوني عميق",
      bgGradient: "from-slate-950 via-[#1e1145] to-slate-900",
      accentA: "#ec4899", // Pink
      accentB: "#8b5cf6", // Purple
      bgCard: "bg-purple-950/40 border-purple-900/50",
      textA: "text-pink-400",
      textB: "text-purple-400"
    },
    cyberpunk: {
      name: "سيبربانك الكهربائي",
      bgGradient: "from-gray-950 via-[#180721] to-black",
      accentA: "#06b6d4", // Cyan
      accentB: "#f43f5e", // Rose
      bgCard: "bg-fuchsia-950/25 border-fuchsia-900/60",
      textA: "text-cyan-400",
      textB: "text-rose-400"
    },
    gold: {
      name: "الذهب الإمبراطوري",
      bgGradient: "from-[#0c0a09] via-[#292524] to-[#0c0a09]",
      accentA: "#eab308", // Gold
      accentB: "#a8a29e", // Stone
      bgCard: "bg-stone-900/80 border-amber-900/40",
      textA: "text-amber-400",
      textB: "text-stone-300"
    }
  };

  const activeThemeStyle = themeStyles[activeTheme];

  // Draw on Canvas and trigger download (Asynchronously preloading images for maximum resolution results)
  const handleDownload = async () => {
    setDownloading(true);
    
    // We will draw a brilliant high-res 1200x675 (16:9 Landscape) card
    const canvas = canvasRef.current;
    if (!canvas) {
      setDownloading(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDownloading(false);
      return;
    }

    // Explicit dimensions
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // Fill background gradient (simulate twilight/dark ambient glow)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (activeTheme === "emerald-vs-indigo") {
      bgGrad.addColorStop(0, "#030712");
      bgGrad.addColorStop(0.5, "#0b1329");
      bgGrad.addColorStop(1, "#030712");
    } else if (activeTheme === "twilight") {
      bgGrad.addColorStop(0, "#050212");
      bgGrad.addColorStop(0.5, "#180c35");
      bgGrad.addColorStop(1, "#09041a");
    } else if (activeTheme === "cyberpunk") {
      bgGrad.addColorStop(0, "#030008");
      bgGrad.addColorStop(0.5, "#15021c");
      bgGrad.addColorStop(1, "#000000");
    } else {
      bgGrad.addColorStop(0, "#0a0a0a");
      bgGrad.addColorStop(0.5, "#1c1917");
      bgGrad.addColorStop(1, "#0a0a0a");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic decorative background blur blobs (drawn with canvas arc, alpha and blurred radial gradients)
    const drawBlob = (x: number, y: number, r: number, color1: string, color2: string) => {
      const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    if (activeTheme === "emerald-vs-indigo") {
      drawBlob(200, 150, 250, "rgba(79, 70, 229, 0.12)", "rgba(79, 70, 229, 0)");
      drawBlob(1000, 520, 280, "rgba(16, 185, 129, 0.12)", "rgba(16, 185, 129, 0)");
    } else if (activeTheme === "twilight") {
      drawBlob(200, 150, 250, "rgba(236, 72, 153, 0.12)", "rgba(236, 72, 153, 0)");
      drawBlob(1000, 520, 280, "rgba(139, 92, 246, 0.11)", "rgba(139, 92, 246, 0)");
    } else if (activeTheme === "cyberpunk") {
      drawBlob(200, 150, 220, "rgba(6, 182, 212, 0.13)", "rgba(6, 182, 212, 0)");
      drawBlob(1000, 520, 250, "rgba(244, 63, 94, 0.12)", "rgba(244, 63, 94, 0)");
    } else {
      drawBlob(200, 150, 250, "rgba(234, 179, 8, 0.1)", "rgba(234, 179, 8, 0)");
      drawBlob(1000, 520, 280, "rgba(120, 113, 108, 0.12)", "rgba(120, 113, 108, 0)");
    }

    // Outer framing overlay / glass glass card
    const cardM = 40;
    const cardW = width - cardM * 2;
    const cardH = height - cardM * 2;
    
    // Smooth rounded rectangle clip or fill path for card
    const roundRect = (cxPath: CanvasRenderingContext2D | any, x: number, y: number, w: number, h: number, r: number) => {
      cxPath.beginPath();
      cxPath.moveTo(x + r, y);
      cxPath.lineTo(x + w - r, y);
      cxPath.quadraticCurveTo(x + w, y, x + w, y + r);
      cxPath.lineTo(x + w, y + h - r);
      cxPath.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      cxPath.lineTo(x + r, y + h);
      cxPath.quadraticCurveTo(x, y + h, x, y + h - r);
      cxPath.lineTo(x, y + r);
      cxPath.quadraticCurveTo(x, y, x + r, y);
      cxPath.closePath();
    };

    // Fill glass container
    ctx.save();
    roundRect(ctx, cardM, cardM, cardW, cardH, 24);
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();
    ctx.restore();

    // Setup RTL text direction and fallback fonts
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const arabicFont = "system-ui, -apple-system, sans-serif, 'Segoe UI'";

    // DRAW WATERMARK BRANDING (top layout)
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = `bold 13px ${arabicFont}`;
    ctx.fillText("منصة المقارنة الذكية بذكاء اصطناعي معتمد", width - 80, 80);
    
    ctx.textAlign = "left";
    ctx.font = `bold 14px "JetBrains Mono", monospace`;
    ctx.fillStyle = activeThemeStyle.accentB;
    ctx.fillText("SmartCompare AI", 80, 80);
    ctx.restore();

    // MAIN TITLE
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = `black 28px ${arabicFont}`;
    ctx.fillText("مواجهة العتاد والمواصفات المباشرة", width / 2, 85);
    ctx.restore();

    // DRAW PHONE CARDS side by side
    const cardColY = 140;
    const colWidth = 330;
    const leftColX = 100;
    const rightColX = width - leftColX - colWidth;

    // Resolve dynamic images with MediaService
    const mediaA = MediaService.resolvePhoneMedia(phoneA);
    const mediaB = MediaService.resolvePhoneMedia(phoneB);
    const imgUrlA = mediaA?.thumbnailUrl || MediaService.FALLBACK_PHONE_THUMBNAIL;
    const imgUrlB = mediaB?.thumbnailUrl || MediaService.FALLBACK_PHONE_THUMBNAIL;

    const preloadImage = (url: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 3500); // Fail-safe 3.5s timeout
        img.src = url;
      });
    };

    let imgA: HTMLImageElement | null = null;
    let imgB: HTMLImageElement | null = null;
    try {
      const imagesResolved = await Promise.all([preloadImage(imgUrlA), preloadImage(imgUrlB)]);
      imgA = imagesResolved[0];
      imgB = imagesResolved[1];
    } catch (e) {
      console.warn("Image preloading error:", e);
    }

    // Phone A Card container (Right Side in Arabic Layout, right col)
    ctx.save();
    roundRect(ctx, rightColX, cardColY, colWidth, 420, 18);
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fill();
    ctx.strokeStyle = `${activeThemeStyle.accentA}44`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Phone A info details
    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 24px ${arabicFont}`;
    ctx.fillText(phoneA.name, rightColX + colWidth - 25, cardColY + 45);

    ctx.fillStyle = activeThemeStyle.textA;
    ctx.font = `bold 14px ${arabicFont}`;
    ctx.fillText(phoneA.brand || "Apple", rightColX + colWidth - 25, cardColY + 75);

    // Giant rating value split to the right center instead of box-center to fit image
    ctx.textAlign = "center";
    ctx.font = `bold 54px ${arabicFont}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(avgA, rightColX + 225, cardColY + 160);
    
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("التقييم الفني الكلي", rightColX + 225, cardColY + 210);

    // Draw Image A on the left side of the right column box if preloaded
    const imgW = 95;
    const imgH = 130;
    const imgX_A = rightColX + 25;
    const imgY_A = cardColY + 110;

    if (imgA) {
      ctx.save();
      roundRect(ctx, imgX_A, imgY_A, imgW, imgH, 12);
      ctx.clip();
      ctx.drawImage(imgA, imgX_A, imgY_A, imgW, imgH);
      ctx.restore();

      ctx.save();
      roundRect(ctx, imgX_A, imgY_A, imgW, imgH, 12);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      roundRect(ctx, imgX_A, imgY_A, imgW, imgH, 12);
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = `bold 11px ${arabicFont}`;
      ctx.fillText("📱 صورة الهاتف", imgX_A + imgW/2, imgY_A + imgH/2);
      ctx.restore();
    }

    // Core spec items on right col (Brand, Processor, Battery)
    ctx.textAlign = "right";
    ctx.font = `bold 11px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("• المعالج والنواة:", rightColX + colWidth - 25, cardColY + 260);
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    
    // Handle very long texts cleanly
    const truncateText = (text: string, len: number) => text.length > len ? text.substring(0, len) + ".." : text;
    ctx.fillText(truncateText(phoneA.processor || "-", 32), rightColX + colWidth - 25, cardColY + 282);

    ctx.font = `bold 11px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("• الشاشة والدقة:", rightColX + colWidth - 25, cardColY + 315);
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(truncateText(phoneA.screen || "-", 32), rightColX + colWidth - 25, cardColY + 337);

    ctx.font = `bold 11px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("• الكاميرا الخلفية:", rightColX + colWidth - 25, cardColY + 370);
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(truncateText(phoneA.camera || "-", 32), rightColX + colWidth - 25, cardColY + 392);
    ctx.restore();


    // Phone B Card container (Left Side in Arabic Layout, left col)
    ctx.save();
    roundRect(ctx, leftColX, cardColY, colWidth, 420, 18);
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fill();
    ctx.strokeStyle = `${activeThemeStyle.accentB}44`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Phone B info details text
    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 24px ${arabicFont}`;
    ctx.fillText(phoneB.name, leftColX + colWidth - 25, cardColY + 45);

    ctx.fillStyle = activeThemeStyle.textB;
    ctx.font = `bold 14px ${arabicFont}`;
    ctx.fillText(phoneB.brand || "Samsung", leftColX + colWidth - 25, cardColY + 75);

    // Giant rating value for B on the right side of the left box
    ctx.textAlign = "center";
    ctx.font = `bold 54px ${arabicFont}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(avgB, leftColX + 225, cardColY + 160);
    
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("التقييم الفني الكلي", leftColX + 225, cardColY + 210);

    // Draw Image B on the left side of the left column box if preloaded
    const imgX_B = leftColX + 25;
    const imgY_B = cardColY + 110;

    if (imgB) {
      ctx.save();
      roundRect(ctx, imgX_B, imgY_B, imgW, imgH, 12);
      ctx.clip();
      ctx.drawImage(imgB, imgX_B, imgY_B, imgW, imgH);
      ctx.restore();

      ctx.save();
      roundRect(ctx, imgX_B, imgY_B, imgW, imgH, 12);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      roundRect(ctx, imgX_B, imgY_B, imgW, imgH, 12);
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = `bold 11px ${arabicFont}`;
      ctx.fillText("📱 صورة الهاتف", imgX_B + imgW/2, imgY_B + imgH/2);
      ctx.restore();
    }

    // Core spec items on left col (Processor, Screen, Camera)
    ctx.textAlign = "right";
    ctx.font = `bold 11px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("• المعالج والنواة:", leftColX + colWidth - 25, cardColY + 260);
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(truncateText(phoneB.processor || "-", 32), leftColX + colWidth - 25, cardColY + 282);

    ctx.font = `bold 11px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("• الشاشة والدقة:", leftColX + colWidth - 25, cardColY + 315);
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(truncateText(phoneB.screen || "-", 32), leftColX + colWidth - 25, cardColY + 337);

    ctx.font = `bold 11px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("• الكاميرا الخلفية:", leftColX + colWidth - 25, cardColY + 370);
    ctx.font = `bold 12px ${arabicFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(truncateText(phoneB.camera || "-", 32), leftColX + colWidth - 25, cardColY + 392);
    ctx.restore();


    // CENTER SECTION: Radar Ratings list Comparison Bars (middle col)
    const midX = width / 2;
    const midWidth = 220;
    const barHeight = 6;

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.font = `black 20px ${arabicFont}`;
    ctx.fillText("VS", midX, cardColY + 40);
    ctx.restore();

    catKeys.forEach((cat, idx) => {
      const rowY = cardColY + 110 + idx * 50;
      const valA = scoreA[cat.key as keyof typeof scoreA];
      const valB = scoreB[cat.key as keyof typeof scoreB];

      // Draw middle label
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = `bold 12px ${arabicFont}`;
      ctx.fillText(cat.label, midX, rowY - 12);
      ctx.restore();

      // Bar length math
      const maxBarWidth = 90;
      const wA = (valA / 10) * maxBarWidth;
      const wB = (valB / 10) * maxBarWidth;

      // Draw Bar A (pointing right from center, towards device A on right)
      ctx.save();
      ctx.fillStyle = activeThemeStyle.accentA;
      roundRect(ctx, midX + 15, rowY - barHeight/2, wA, barHeight, 3);
      ctx.fill();

      // Values text
      ctx.textAlign = "left";
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(valA.toFixed(1), midX + maxBarWidth + 24, rowY);
      ctx.restore();

      // Draw Bar B (pointing left from center, towards device B on left)
      ctx.save();
      ctx.fillStyle = activeThemeStyle.accentB;
      roundRect(ctx, midX - 15 - wB, rowY - barHeight/2, wB, barHeight, 3);
      ctx.fill();

      // Values text
      ctx.textAlign = "right";
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(valB.toFixed(1), midX - maxBarWidth - 24, rowY);
      ctx.restore();
    });


    // LOWER VERDICT DECORATIVE BANNER
    const bannerY = 575;
    ctx.save();
    roundRect(ctx, 100, bannerY, width - 200, 48, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#34d399";
    ctx.font = `bold 13px ${arabicFont}`;
    ctx.fillText(`💡 خلاصة التحليل الفني: ${verdictSummary}`, width / 2, bannerY + 24);
    ctx.restore();


    // Convert Canvas to Image stream and click download link
    setTimeout(() => {
      try {
        const imageUri = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `SmartCompare-${phoneA.name.replace(/\s+/g, "_")}-VS-${phoneB.name.replace(/\s+/g, "_")}.png`;
        link.href = imageUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to generate image download:", err);
      } finally {
        setDownloading(false);
      }
    }, 800);
  };

  // Copy shareable custom links representing the device comparison
  const handleCopyLink = () => {
    setCopiedLink(true);
    const textToCopy = `${window.location.protocol}//${window.location.host}?phoneA=${encodeURIComponent(phoneA.name)}&phoneB=${encodeURIComponent(phoneB.name)}`;
    navigator.clipboard.writeText(textToCopy);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy quick Telegram/WhatsApp markdown text summary (Enhanced for rich detail as requested)
  const handleCopySummaryText = () => {
    setCopiedText(true);
    const summaryMsg = `🔥 مقارنة عمالقة العتاد والمواصفات المباشرة 🔥
==================================
📱 هاتف: ${phoneA.name} 
📊 التقييم الكلي: ${avgA}/10

📱 هاتف: ${phoneB.name}
📊 التقييم الكلي: ${avgB}/10
==================================
🏆 نتيجة الفائز وخلاصة التقييم:
${winner ? `👑 الهاتف المتفوق فنياً: ${winner.name} بمتوسط ${Math.max(parseFloat(avgA), parseFloat(avgB))} من 10.` : `🤝 تعادل هندسي وثيق بنصيب متماثل بلغ ${avgA}/10 للهاتفين.`}

⚡ تفصيل حرب نقاط العتاد (من 10):
• الشاشة والعرض:  ${scoreA.screen.toFixed(1)} 🆚 ${scoreB.screen.toFixed(1)}
• الأداء والمعالجة:  ${scoreA.performance.toFixed(1)} 🆚 ${scoreB.performance.toFixed(1)}
• الكاميرا والتصوير:  ${scoreA.camera.toFixed(1)} 🆚 ${scoreB.camera.toFixed(1)}
• سعة وقوة البطارية:  ${scoreA.battery.toFixed(1)} 🆚 ${scoreB.battery.toFixed(1)}
• سرعة الشحن وسعة الطاقة: ${scoreA.charging.toFixed(1)} 🆚 ${scoreB.charging.toFixed(1)}
• القيمة مقابل السعر: ${scoreA.value.toFixed(1)} 🆚 ${scoreB.value.toFixed(1)}

💡 رأي المستشار التقني بالذكاء الاصطناعي:
"${verdictSummary}"

🔗 قارن وطابق الهواتف والعتاد بدقة مجاناً في ثانيتين عبر الرابط:
${window.location.protocol}//${window.location.host}?phoneA=${encodeURIComponent(phoneA.name)}&phoneB=${encodeURIComponent(phoneB.name)}`;

    navigator.clipboard.writeText(summaryMsg);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Trigger beautiful enterprise A4 technical PDF export isolated from UI clutter
  const handlePDFExport = async () => {
    setPdfLoading(true);
    setPdfError("");
    try {
      const scoresA = ScoringService.calculateSingleCategoryScores(phoneA);
      const scoresB = ScoringService.calculateSingleCategoryScores(phoneB);
      
      const ratingANum = parseFloat(avgA) * 10;
      const ratingBNum = parseFloat(avgB) * 10;

      const result = await exportToPDF({
        phoneA,
        phoneB,
        ratingA: ratingANum,
        ratingB: ratingBNum,
        scoresA,
        scoresB,
        markdown,
        analyzedAt
      });

      if (!result.success) {
        setPdfError(result.error || "عذراً فشل تصدير التقرير كـ PDF");
      }
    } catch (err: any) {
      setPdfError(err.message || "حدث خطأ غير متوقع أثناء إعداد ملف الـ PDF");
    } finally {
      // Small timeout to let print overlay launch gracefully before enabling button
      setTimeout(() => setPdfLoading(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-105" dir="rtl">
      
      {/* Invisible Canvas for programatic high-res export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main glass panel layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative" id="share-card-panel">
        
        {/* Absolute Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 left-5 z-20 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-2.5 rounded-full transition-all cursor-pointer shadow-sm border border-white/5"
          id="btn-close-share-modal"
          title="إغلاق التبويب"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-slate-820 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/30">
          <div>
            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
              <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-indigo-500/20 flex items-center gap-1">
                <Sparkles size={11} className="animate-spin text-indigo-400 duration-5000" />
                <span>ميزة المحترفين الاحترافية</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white text-center md:text-right">بطاقة المقارنة الجاهزة للنشر والتواصل الاجتماعي</h2>
            <p className="text-xs text-slate-400 mt-1 text-center md:text-right">أبهر زملاءك وعشاق التقنية! ولد صورة اجتماعية مذهلة ومخصصة بمجموع الأرقام ومزايا الشفق لمشاركتها مباشرة.</p>
          </div>

          {/* Theme Color Presets Selectors */}
          <div className="flex bg-slate-950/90 border border-slate-800 rounded-2xl p-1 gap-1 items-center">
            {(Object.keys(themeStyles) as CardTheme[]).map((tKey) => {
              const info = themeStyles[tKey];
              const isSelected = activeTheme === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => setActiveTheme(tKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={info.name}
                >
                  <Palette size={11} />
                  <span>{info.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Social Card Live Preview Wrapper */}
        <div className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center bg-slate-950/40">
          
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1 text-center">معاينة بطاقة القصة الاجتماعية (16:9 Landscape Layout)</span>
          </div>

          {/* Live Card Render in HTML matching twilight theme config */}
          <div 
            className={`w-full max-w-2xl bg-gradient-to-tr ${activeThemeStyle.bgGradient} border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 saturate-[1.2]`}
            id="social-preview-card"
          >
            {/* Absolute Glass overlay accents */}
            <div className={`absolute -top-10 right-2 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-2xl pointer-events-none`}></div>
            <div className={`absolute -bottom-10 left-2 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full blur-2xl pointer-events-none`}></div>

            {/* Top Brand Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <span className="text-[10px] font-bold text-slate-400">SMARTCOMPARE AI • مراجعة فنية معتمدة</span>
              <span className="bg-white/10 text-white px-2.5 py-0.5 rounded-md text-[10px] font-mono tracking-wider font-extrabold flex items-center gap-1 border border-white/10 shadow-sm backdrop-blur-md">
                <Star size={8} className="text-yellow-400 fill-yellow-400" />
                <span>VERDICT REPORT</span>
              </span>
            </div>

            {/* Twin Columns Specs Grid */}
            <div className="grid grid-cols-7 gap-4 items-center mb-6">
              
              {/* Smartphone B (Left column) */}
              <div className="col-span-2 text-center bg-slate-950/35 p-4 border border-white/5 rounded-2xl relative backdrop-blur-md flex flex-col items-center justify-between min-h-[170px]">
                <div className="w-full">
                  <span className={`text-[10px] font-bold block ${activeThemeStyle.textB} mb-0.5 truncate`}>{phoneB.brand}</span>
                  <h4 className="text-xs font-black text-white truncate" title={phoneB.name}>{phoneB.name}</h4>
                </div>
                
                {/* Micro device picture on card preview */}
                <div className="my-1.5 h-12 w-9 relative overflow-hidden rounded-md border border-white/10 shadow-md shrink-0 bg-slate-900/60 flex items-center justify-center">
                  <img src={imgUrlB} alt={phoneB.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                </div>

                <div className="mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">{avgB}</span>
                  <span className="text-[9px] text-slate-400 block">نقطة تقييم</span>
                </div>
              </div>

              {/* Middle Comparison bars */}
              <div className="col-span-3 space-y-3">
                <div className="text-center">
                  <span className="text-xxs font-mono uppercase tracking-widest text-[#cbd5e1] font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/5">حرب العتاد الفورية</span>
                </div>
                
                {/* Visual score bars mapping */}
                {catKeys.slice(0, 4).map((cKey) => {
                  const valA = scoreA[cKey.key as keyof typeof scoreA];
                  const valB = scoreB[cKey.key as keyof typeof scoreB];
                  return (
                    <div key={cKey.key} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>{cKey.label}</span>
                      </div>
                      <div className="h-1.5 bg-slate-950/70 border border-white/5 rounded-full overflow-hidden flex relative">
                        {/* Bar B on left side going to middle */}
                        <div 
                           className="h-full absolute left-0" 
                          style={{ 
                            width: `${(valB / 10) * 50}%`,
                            background: activeThemeStyle.accentB
                          }} 
                        />
                        {/* Bar A on right side going to middle */}
                        <div 
                           className="h-full absolute right-0" 
                          style={{ 
                            width: `${(valA / 10) * 50}%`,
                            background: activeThemeStyle.accentA
                          }} 
                        />
                        {/* Center divider line */}
                        <div className="absolute left-1/2 -ml-[0.5px] top-0 bottom-0 w-[1px] bg-white/20" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smartphone A (Right column) */}
              <div className="col-span-2 text-center bg-slate-950/35 p-4 border border-white/5 rounded-2xl relative backdrop-blur-md flex flex-col items-center justify-between min-h-[170px]">
                <div className="w-full">
                  <span className={`text-[10px] font-bold block ${activeThemeStyle.textA} mb-0.5 truncate`}>{phoneA.brand}</span>
                  <h4 className="text-xs font-black text-white truncate" title={phoneA.name}>{phoneA.name}</h4>
                </div>

                {/* Micro device picture on card preview */}
                <div className="my-1.5 h-12 w-9 relative overflow-hidden rounded-md border border-white/10 shadow-md shrink-0 bg-slate-900/60 flex items-center justify-center">
                  <img src={imgUrlA} alt={phoneA.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                </div>

                <div className="mt-0.5">
                  <span className="text-2xl font-black text-white font-mono">{avgA}</span>
                  <span className="text-[9px] text-slate-400 block">نقطة تقييم</span>
                </div>
              </div>

            </div>

            {/* Verdict Note */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-right">
              <span className="text-[10px] text-[#34d399] leading-6 block font-bold truncate">
                💡 خلاصة التحليل الفني: {verdictSummary}
              </span>
            </div>

          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-6 md:p-8 border-t border-slate-820 bg-slate-950/50 flex flex-col gap-4">
          
          {pdfError && (
            <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
              <span className="shrink-0 animate-pulse text-red-500">⏳</span>
              <span>{pdfError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm min-h-[44px]"
                id="btn-share-link"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400">تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} className="text-slate-400" />
                    <span>نسخ رابط المقارنة</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopySummaryText}
                className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm min-h-[44px]"
                id="btn-copy-summary"
              >
                {copiedText ? (
                  <>
                    <Check size={14} className="text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400">تم نسخ التلخيص!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-400" />
                    <span>نسخ ملخص السوشيال</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePDFExport}
                disabled={pdfLoading}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 shadow-lg relative min-h-[44px] cursor-pointer transition-all ${
                  pdfLoading
                    ? "bg-slate-800 pointer-events-none text-slate-400 border-none"
                    : "bg-slate-950/90 hover:bg-slate-950 shadow-indigo-950/20"
                }`}
                id="btn-download-technical-pdf"
              >
                {pdfLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                ) : (
                  <FileText size={14} className="text-indigo-400 shrink-0" />
                )}
                <span>{pdfLoading ? "جاري تجهيز تقرير الطباعة..." : "حفظ التقرير الفني كـ PDF"}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-lg relative min-h-[44px] cursor-pointer ${
                  downloading
                    ? "bg-slate-800 pointer-events-none"
                    : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-900/10"
                }`}
                id="btn-download-social-image"
              >
                {downloading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Download size={14} className="text-white shrink-0" />
                )}
                <span>{downloading ? "جاري تحضير بطاقة PNG..." : "تحميل بطاقة المقارنة PNG"}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
