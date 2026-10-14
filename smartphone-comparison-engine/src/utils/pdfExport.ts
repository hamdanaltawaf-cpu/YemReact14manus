import { Smartphone } from "../types";
import { MediaService } from "../services/media.service";
import { CategoryScores } from "../services/scoring.service";

interface PDFExportParams {
  phoneA: Smartphone;
  phoneB: Smartphone;
  ratingA: number; // overall 100-scale score
  ratingB: number;
  scoresA: CategoryScores;
  scoresB: CategoryScores;
  markdown: string;
  analyzedAt: string;
}

/**
 * Parses markdown to printed HTML cleanly with RTL list items and typography.
 */
function parseMarkdownToPrintHtml(md: string): string {
  if (!md) return "";
  let html = md;

  // Headers conversion
  html = html.replace(/^### (.*?)$/gm, "<h4 style='font-size: 15px; font-weight: bold; color: #1e293b; margin-top: 14px; margin-bottom: 6px;'>$1</h4>");
  html = html.replace(/^## (.*?)$/gm, "<h3 style='font-size: 17px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px;'>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2 style='font-size: 20px; font-weight: 900; color: #020617; border-bottom: 3px solid #cbd5e1; padding-bottom: 8px; margin-top: 28px; margin-bottom: 16px; text-align: center;'>$1</h2>");

  // Bold text conversion
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong style='font-weight: bold; color: #0f172a;'>$1</strong>");

  // Bullet list conversion
  html = html.replace(/^\s*[\*\-]\s+(.*?)$/gm, "<li style='font-size: 12.5px; color: #334155; line-height: 1.7; margin-bottom: 6px; padding-right: 20px; list-style-type: square;'>$1</li>");

  // Format paragraphs
  const blocks = html.split(/\n\n+/);
  return blocks.map(block => {
    const trimmed = block.trim();
    if (trimmed.startsWith("<h") || trimmed.startsWith("<li")) {
      return trimmed;
    }
    return `<p style="font-size: 13px; color: #475569; line-height: 1.75; margin-bottom: 12px; text-align: justify;">${trimmed.replace(/\n/g, "<br/>")}</p>`;
  }).join("");
}

/**
 * Triggers a beautifully formatted comparison PDF export by compiling an isolated iframe document.
 * This guarantees 100% platform-native compatibility on both desktop and mobile iOS/Android
 * browsers, bypassing complex canvas font and library sizing bugs.
 */
export async function exportToPDF({
  phoneA,
  phoneB,
  ratingA,
  ratingB,
  scoresA,
  scoresB,
  markdown,
  analyzedAt
}: PDFExportParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Resolve images
    const mediaA = MediaService.resolvePhoneMedia(phoneA);
    const mediaB = MediaService.resolvePhoneMedia(phoneB);

    const imgA = mediaA?.thumbnailUrl || MediaService.FALLBACK_PHONE_THUMBNAIL;
    const imgB = mediaB?.thumbnailUrl || MediaService.FALLBACK_PHONE_THUMBNAIL;

    // Calculate winner
    const avgA = (ratingA / 10).toFixed(1);
    const avgB = (ratingB / 10).toFixed(1);

    const isWinnerA = ratingA > ratingB;
    const isWinnerB = ratingB > ratingA;
    const isDraw = ratingA === ratingB;

    const winnerName = isWinnerA ? phoneA?.name : isWinnerB ? phoneB?.name : null;
    const winnerScore = isWinnerA ? avgA : isWinnerB ? avgB : avgA;

    // Prepare ratings to render progress bars
    const categoriesToRender = [
      { name: "تجربة الشاشة والعرض", key: "display", label: "الشاشة", scoreA: scoresA.display, scoreB: scoresB.display },
      { name: "الأداء وسرعة المعالج", key: "performance", label: "الأداء", scoreA: scoresA.performance, scoreB: scoresB.performance },
      { name: "قوة الكاميرات والتصوير", key: "camera", label: "التصوير", scoreA: scoresA.camera, scoreB: scoresB.camera },
      { name: "سعة البطارية ومعدل التشغيل", key: "battery", label: "البطارية", scoreA: scoresA.battery, scoreB: scoresB.battery },
      { name: "سرعة الشحن وإمداد الطاقة", key: "charging", label: "الشحن", scoreA: scoresA.charging, scoreB: scoresB.charging },
      { name: "الذاكرة العشوائية والتخزين", key: "storage", label: "التخزين", scoreA: scoresA.storage, scoreB: scoresB.storage },
      { name: "القيمة الكلية مقابل السعر", key: "value", label: "القيمة", scoreA: scoresA.value, scoreB: scoresB.value }
    ];

    // Build print HTML document with Arabic RTL formatting and perfect margins
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير فني معتمد: ${phoneA.name} ضد ${phoneB.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
          
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          
          body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 0;
            direction: rtl;
            text-align: right;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-container {
            max-width: 800px;
            margin: 0 auto;
          }

          /* Header style */
          .header-table {
            width: 100%;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          
          .header-brand {
            font-size: 24px;
            font-weight: 900;
            color: #4f46e5;
            letter-spacing: -0.5px;
          }
          
          .header-subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
            font-weight: bold;
          }
          
          .header-meta {
            text-align: left;
            font-size: 11px;
            color: #64748b;
          }

          /* Comparison Showcase Columns */
          .devices-grid {
            display: table;
            width: 100%;
            margin-bottom: 24px;
            border-spacing: 12px 0px;
          }
          
          .device-column {
            display: table-cell;
            width: 50%;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 16px;
            vertical-align: top;
            box-sizing: border-box;
          }

          .device-column.winner {
            border-color: #10b981;
            background-color: rgba(16, 185, 129, 0.02);
          }

          .winner-tag {
            background: linear-gradient(135deg, #eab308, #ca8a04);
            color: #ffffff;
            font-size: 10px;
            font-weight: 900;
            padding: 2px 8px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 8px;
          }
          
          .device-brand {
            font-size: 11px;
            font-weight: bold;
            color: #6366f1;
            margin: 0 0 2px 0;
          }
          
          .device-name {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 12px 0;
          }
          
          .device-image-container {
            width: 110px;
            height: 140px;
            margin: 0 auto 12px auto;
            border-radius: 12px;
            overflow: hidden;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .device-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .device-score-badge {
            background-color: #1e293b;
            color: #ffffff;
            border-radius: 10px;
            padding: 6px 14px;
            text-align: center;
            font-weight: 900;
            font-size: 14px;
            margin-top: 10px;
          }
          
          .device-score-badge span {
            font-size: 20px;
            color: #10b981;
          }

          /* Winner Summary Banner */
          .winner-banner {
            background-color: #fef08a;
            border: 1px solid #fef08a;
            border-radius: 12px;
            padding: 14px 18px;
            text-align: center;
            margin-bottom: 24px;
            color: #854d0e;
            font-weight: bold;
            font-size: 14px;
          }

          /* Quick specs table */
          .section-title {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            border-right: 4px solid #4f46e5;
            padding-right: 8px;
            margin: 24px 0 14px 0;
          }

          .scores-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }

          .scores-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: bold;
            font-size: 11px;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
          }

          .scores-table td {
            font-size: 12px;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
          }

          .bar-container {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
          }

          .bar-bg {
            flex-grow: 1;
            height: 8px;
            background-color: #e2e8f0;
            border-radius: 4px;
            position: relative;
            overflow: hidden;
          }

          .bar-fill {
            height: 100%;
            border-radius: 4px;
          }

          .bar-fill.a {
            background-color: #6366f1;
          }

          .bar-fill.b {
            background-color: #10b981;
          }

          .verdict-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 24px;
          }

          .verdict-text {
            font-size: 13px;
            color: #334155;
            line-height: 1.8;
          }

          .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
          }

          @media print {
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          
          <!-- BRAND HEADER -->
          <table class="header-table">
            <tr>
              <td>
                <div class="header-brand">SmartCompare AI</div>
                <div class="header-subtitle">منصة المقارنة الفنية الفورية بالذكاء الاصطناعي</div>
              </td>
              <td class="header-meta">
                <div>تاريخ التقرير: <strong>${analyzedAt}</strong></div>
                <div>مرجع التوثيق: <strong>MCR-${Math.floor(100000 + Math.random() * 900000)}</strong></div>
                <div>الحالة: <strong>تقرير فني معتمد وجاهز للإصدار 📄</strong></div>
              </td>
            </tr>
          </table>

          <!-- MAIN TITLE -->
          <h2 style="font-size: 21px; font-weight: 900; text-align: center; color: #0f172a; margin: 15px 0 20px 0;">
            تقرير فحص المواصفات وتقييم العتاد والمقارنة التفصيلية
          </h2>

          <!-- MAIN DEVS OUTLINE GRID -->
          <div class="devices-grid">
            
            <!-- PHONE A (Emerald / Right block in RTL view, isWinner highlights) -->
            <div class="device-column ${isWinnerA ? "winner" : ""}">
              ${isWinnerA ? '<div class="winner-tag">🏆 الفائز فنيًا</div>' : ""}
              <p class="device-brand">${phoneA?.brand || ""}</p>
              <h3 class="device-name">${phoneA?.name || ""}</h3>
              
              <div class="device-image-container">
                <img class="device-image" src="${imgA}" alt="${phoneA?.name || ""}" referrerPolicy="no-referrer" />
              </div>

              <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
                <strong>المواصفات الرئيسية السريعة:</strong><br/>
                • المعالج: ${(phoneA?.processor || "").substring(0, 45)}...<br/>
                • الشاشة: ${(phoneA?.screen || "").substring(0, 40)}...<br/>
                • الكاميرا: ${(phoneA?.camera || "").substring(0, 40)}...
              </div>

              <div class="device-score-badge">
                التقييم الفني الكلي: <span>${avgA}</span> / 10
              </div>
            </div>

            <!-- PHONE B -->
            <div class="device-column ${isWinnerB ? "winner" : ""}">
              ${isWinnerB ? '<div class="winner-tag">🏆 الفائز فنيًا</div>' : ""}
              <p class="device-brand">${phoneB?.brand || ""}</p>
              <h3 class="device-name">${phoneB?.name || ""}</h3>
              
              <div class="device-image-container">
                <img class="device-image" src="${imgB}" alt="${phoneB?.name || ""}" referrerPolicy="no-referrer" />
              </div>

              <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
                <strong>المواصفات الرئيسية السريعة:</strong><br/>
                • المعالج: ${(phoneB?.processor || "").substring(0, 45)}...<br/>
                • الشاشة: ${(phoneB?.screen || "").substring(0, 40)}...<br/>
                • الكاميرا: ${(phoneB?.camera || "").substring(0, 40)}...
              </div>

              <div class="device-score-badge">
                التقييم الفني الكلي: <span>${avgB}</span> / 10
              </div>
            </div>

          </div>

          <!-- WINNER SUMMARY BANNER -->
          <div class="winner-banner">
            ${isDraw 
              ? `🤝 نتيجة المقارنة: تعادل هندسي وثيق بنصيب متماثل بلغ ${avgA} نقاط تقييم كفاءة من 10 للهاتفين.`
              : `💡 التوجيه الفني الموصى به: يتوجب ${winnerName} بطلًا للمواجهة مع متوسط نقاط إجمالية يبلغ ${winnerScore}/10 مستندًا على تفوق عتادي واضح.`
            }
          </div>

          <!-- RATINGS BARS TABLE -->
          <div class="section-title">مصفوفة تباين درجات العتاد والمقاييس</div>
          <table class="scores-table">
            <thead>
              <tr>
                <th style="text-align: right; width: 25%;">المقياس الفني</th>
                <th style="text-align: center; width: 33%;">${phoneA?.name || ""}</th>
                <th style="text-align: center; width: 9%;">&nbsp;</th>
                <th style="text-align: center; width: 33%;">${phoneB?.name || ""}</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesToRender.map(cat => {
                const pctA = (cat.scoreA / 10) * 100;
                const pctB = (cat.scoreB / 10) * 100;
                
                let highlightStyleA = cat.scoreA > cat.scoreB ? "font-weight: 900; color: #4f46e5;" : "color: #64748b;";
                let highlightStyleB = cat.scoreB > cat.scoreA ? "font-weight: 900; color: #10b981;" : "color: #64748b;";
                if (cat.scoreA === cat.scoreB) {
                  highlightStyleA = "color: #1e293b;";
                  highlightStyleB = "color: #1e293b;";
                }

                return `
                  <tr>
                    <td style="font-weight: bold; color: #334155;">${cat.name}</td>
                    <td>
                      <div class="bar-container">
                        <span style="font-family: monospace; font-size: 12px; ${highlightStyleA}">${cat.scoreA.toFixed(1)}</span>
                        <div class="bar-bg">
                          <div class="bar-fill a" style="width: ${pctA}%"></div>
                        </div>
                      </div>
                    </td>
                    <td style="text-align: center; font-weight: bold; color: #94a3b8; font-size: 10px;">ضد</td>
                    <td>
                      <div class="bar-container">
                        <div class="bar-bg">
                          <div class="bar-fill b" style="width: ${pctB}%"></div>
                        </div>
                        <span style="font-family: monospace; font-size: 12px; ${highlightStyleB}">${cat.scoreB.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          <!-- PAGE BREAK FOR AI ANALYSIS EXTRACTION -->
          <div class="page-break"></div>

          <!-- SECTION: DEEP AI ANALYSIS REPORT -->
          <table class="header-table" style="margin-top: 15px; border-bottom-color: #10b981;">
            <tr>
              <td>
                <div class="header-brand" style="color: #10b981;">SmartCompare AI Verdict</div>
                <div class="header-subtitle">ملحق التحليل الفني العميق واستشارات الاستخدام الفعلي</div>
              </td>
              <td class="header-meta">
                <div>الطرف الأول: <strong>${phoneA?.name || ""}</strong></div>
                <div>الطرف الثاني: <strong>${phoneB?.name || ""}</strong></div>
              </td>
            </tr>
          </table>

          <div class="section-title" style="border-right-color: #10b981;">رأي المستشار التقني والتحليل الفصلي المعمق بذكاء اصطناعي</div>
          
          <div class="verdict-box">
            <div class="verdict-text">
              ${parseMarkdownToPrintHtml(markdown)}
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            هذا المستند الفني مخصص لغايات التثقيف ومطابقة العتاد، وتم إصداره بالاعتماد على محركات المحاكاة والبيانات الفنية المجمعة لعام 2026.
            <br/>
            نشكر استخدامكم منصة المقارنة الذكية. تم الإنشاء والطباعة كـ PDF في ثوانٍ معدودة.
          </div>

        </div>
        
        <script>
          // Automatic loader wait and native print trigger
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
      </html>
    `;

    // Write to a temporary isolated printable iframe
    const iframeId = "pdf-direct-export-iframe";
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (iframe) {
      document.body.removeChild(iframe);
    }

    iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.style.position = "fixed";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.right = "-9999px";
    iframe.style.bottom = "-9999px";
    
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      return { success: false, error: "فشل تهيئة نظام الطباعة التابع للمتصفح" };
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Clean up printable frame dynamically after some time
    setTimeout(() => {
      try {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (e) {
        console.error("Clean up print frame error:", e);
      }
    }, 10000);

    return { success: true };
  } catch (err: any) {
    console.error("Error generating comparison PDF report:", err);
    return { success: false, error: err.message || "فشلت عملية حفظ التقرير كـ PDF" };
  }
}
