/**
 * PDF Generation helpers for Learning Support Reports
 * Generates professional Arabic HTML that can be converted to PDF
 */
import { htmlToPdf } from "./htmlToPdf";

const DIFFICULTY_LABELS: Record<string, string> = {
  dyslexia: "عسر القراءة", dysgraphia: "عسر الكتابة", dyscalculia: "عسر الحساب",
  dysphasia: "عسر النطق", adhd: "فرط النشاط ونقص الانتباه", asd: "طيف التوحد",
  slow_learning: "بطء التعلم", intellectual_disability: "إعاقة ذهنية",
};
const PROGRESS_LABELS: Record<string, string> = {
  significant_improvement: "تحسن ملحوظ", moderate_improvement: "تحسن متوسط",
  slight_improvement: "تحسن طفيف", stable: "مستقر",
  slight_decline: "تراجع طفيف", needs_attention: "يحتاج اهتماماً خاصاً",
};
const SKILL_LABELS: Record<string, string> = {
  reading: "القراءة", writing: "الكتابة", math: "الرياضيات",
  attention: "الانتباه", social: "التفاعل الاجتماعي", motivation: "الدافعية",
};

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; direction: rtl; color: #1a1a2e; line-height: 1.8; padding: 20px; background: #fff; }
  .header { background: linear-gradient(135deg, #6C3483 0%, #8E44AD 50%, #BB8FCE 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 25px; text-align: center; }
  .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
  .header .subtitle { font-size: 13px; opacity: 0.9; }
  .header .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 20px; font-size: 13px; margin-top: 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
  .info-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 16px; }
  .info-card .label { font-size: 11px; color: #6c757d; margin-bottom: 2px; }
  .info-card .value { font-size: 15px; font-weight: 700; color: #2d3436; }
  .section { margin-bottom: 25px; }
  .section-title { font-size: 17px; font-weight: 700; color: #6C3483; border-bottom: 3px solid #6C3483; padding-bottom: 8px; margin-bottom: 15px; }
  .scores-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  .scores-table th { background: #6C3483; color: white; padding: 10px; font-size: 13px; text-align: center; }
  .scores-table td { padding: 10px; text-align: center; border: 1px solid #dee2e6; font-size: 14px; }
  .scores-table tr:nth-child(even) { background: #f8f9fa; }
  .score-bar { height: 8px; border-radius: 4px; background: #e9ecef; overflow: hidden; margin-top: 4px; }
  .score-fill { height: 100%; border-radius: 4px; }
  .list-item { padding: 8px 12px; margin-bottom: 6px; background: #f8f9fa; border-radius: 6px; border-right: 4px solid; font-size: 14px; }
  .strength { border-color: #27ae60; } .challenge { border-color: #e74c3c; } .recommendation { border-color: #3498db; }
  .footer { text-align: center; padding: 20px; border-top: 2px solid #e9ecef; margin-top: 30px; font-size: 12px; color: #6c757d; }
  .footer .brand { font-weight: 700; color: #6C3483; }
`;

function getScoreColor(score: number): string {
  if (score >= 8) return "#27ae60";
  if (score >= 6) return "#2ecc71";
  if (score >= 4) return "#f39c12";
  if (score >= 2) return "#e67e22";
  return "#e74c3c";
}

interface FollowUpReportPdfData {
  studentName: string; difficultyType: string; gradeLevel?: string; studentAge?: number;
  severityLevel?: string; reportPeriod?: string;
  readingScore?: number; writingScore?: number; mathScore?: number;
  attentionScore?: number; socialScore?: number; motivationScore?: number;
  reportTitle?: string; strengths?: string[]; challenges?: string[];
  recommendations?: any[]; detailedAnalysis?: string; actionPlan?: string;
  parentGuidance?: string; executiveSummary?: string;
}

interface ProgressEvaluationPdfData {
  studentName: string; difficultyType: string; gradeLevel?: string;
  analysisTitle?: string; overallProgress?: string; progressPercentage?: number;
  evaluationStartDate?: string; evaluationEndDate?: string;
  assessmentData?: { date: string; label: string; scores: Record<string, number> }[];
  strengths?: string[]; challenges?: string[]; recommendations?: string[];
  detailedAnalysis?: string; actionPlan?: string; predictiveInsights?: string;
}

export async function generateFollowUpReportPdf(data: FollowUpReportPdfData): Promise<string> {
  const scores = [
    { label: "القراءة", value: data.readingScore || 0 },
    { label: "الكتابة", value: data.writingScore || 0 },
    { label: "الرياضيات", value: data.mathScore || 0 },
    { label: "الانتباه", value: data.attentionScore || 0 },
    { label: "التفاعل الاجتماعي", value: data.socialScore || 0 },
    { label: "الدافعية", value: data.motivationScore || 0 },
  ];
  const periodLabels: Record<string, string> = { weekly: "أسبوعي", monthly: "شهري", trimesterly: "ثلاثي", yearly: "سنوي" };

  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>${BASE_STYLES}</style></head><body>
  <div class="header">
    <h1>${data.reportTitle || "تقرير المتابعة الفردي"}</h1>
    <div class="subtitle">Leader Academy — أدوات مرافقة ذوي صعوبات التعلم</div>
    <div class="badge">${DIFFICULTY_LABELS[data.difficultyType] || data.difficultyType}</div>
  </div>
  <div class="info-grid">
    <div class="info-card"><div class="label">اسم التلميذ</div><div class="value">${data.studentName}</div></div>
    <div class="info-card"><div class="label">نوع الصعوبة</div><div class="value">${DIFFICULTY_LABELS[data.difficultyType] || data.difficultyType}</div></div>
    ${data.gradeLevel ? `<div class="info-card"><div class="label">المستوى الدراسي</div><div class="value">${data.gradeLevel}</div></div>` : ""}
    ${data.studentAge ? `<div class="info-card"><div class="label">العمر</div><div class="value">${data.studentAge} سنة</div></div>` : ""}
    ${data.severityLevel ? `<div class="info-card"><div class="label">درجة الحدة</div><div class="value">${data.severityLevel}</div></div>` : ""}
    ${data.reportPeriod ? `<div class="info-card"><div class="label">فترة التقرير</div><div class="value">${periodLabels[data.reportPeriod] || data.reportPeriod}</div></div>` : ""}
  </div>
  ${data.executiveSummary ? `<div class="section"><div class="section-title">ملخص تنفيذي</div><p style="font-size:14px;line-height:1.9;background:#f8f9fa;padding:15px;border-radius:8px;">${data.executiveSummary}</p></div>` : ""}
  <div class="section"><div class="section-title">تقييم المهارات</div>
    <table class="scores-table"><thead><tr><th>المهارة</th><th>الدرجة / 10</th><th>المستوى</th></tr></thead><tbody>
      ${scores.map(s => `<tr><td style="font-weight:600;">${s.label}</td><td><strong style="color:${getScoreColor(s.value)}">${s.value}</strong>/10</td><td><div class="score-bar"><div class="score-fill" style="width:${s.value * 10}%;background:${getScoreColor(s.value)}"></div></div></td></tr>`).join("")}
    </tbody></table></div>
  ${data.detailedAnalysis ? `<div class="section"><div class="section-title">التحليل المفصل</div><p style="font-size:14px;line-height:1.9;">${data.detailedAnalysis}</p></div>` : ""}
  ${data.strengths?.length ? `<div class="section"><div class="section-title" style="color:#27ae60;border-color:#27ae60;">نقاط القوة</div>${data.strengths.map(s => `<div class="list-item strength">${s}</div>`).join("")}</div>` : ""}
  ${data.challenges?.length ? `<div class="section"><div class="section-title" style="color:#e74c3c;border-color:#e74c3c;">التحديات</div>${data.challenges.map(c => `<div class="list-item challenge">${c}</div>`).join("")}</div>` : ""}
  ${data.recommendations?.length ? `<div class="section"><div class="section-title" style="color:#3498db;border-color:#3498db;">التوصيات</div>${data.recommendations.map((r: any) => `<div class="list-item recommendation">${typeof r === "string" ? r : r.recommendation || JSON.stringify(r)}</div>`).join("")}</div>` : ""}
  ${data.parentGuidance ? `<div class="section"><div class="section-title">توجيهات للأولياء</div><p style="font-size:14px;line-height:1.9;background:#fff3cd;padding:15px;border-radius:8px;border-right:4px solid #ffc107;">${data.parentGuidance}</p></div>` : ""}
  ${data.actionPlan ? `<div class="section"><div class="section-title">خطة العمل</div><p style="font-size:14px;line-height:1.9;">${data.actionPlan}</p></div>` : ""}
  <div class="footer"><div class="brand">Leader Academy</div><div>تقرير مولّد بالذكاء الاصطناعي — ${new Date().toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })}</div></div>
</body></html>`;
}

export async function generateProgressEvaluationPdf(data: ProgressEvaluationPdfData): Promise<string> {
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>${BASE_STYLES}
  .progress-badge { display: inline-block; padding: 6px 20px; border-radius: 20px; font-weight: 700; font-size: 16px; }
  .progress-positive { background: #d4edda; color: #155724; }
  .progress-neutral { background: #d1ecf1; color: #0c5460; }
  .progress-negative { background: #f8d7da; color: #721c24; }
</style></head><body>
  <div class="header" style="background:linear-gradient(135deg,#1565C0 0%,#42A5F5 50%,#90CAF9 100%);">
    <h1>${data.analysisTitle || "تقييم التقدم"}</h1>
    <div class="subtitle">Leader Academy — تحليل تطور التلميذ عبر الزمن</div>
    <div class="badge">${DIFFICULTY_LABELS[data.difficultyType] || data.difficultyType}</div>
  </div>
  <div class="info-grid">
    <div class="info-card"><div class="label">اسم التلميذ</div><div class="value">${data.studentName}</div></div>
    <div class="info-card"><div class="label">نوع الصعوبة</div><div class="value">${DIFFICULTY_LABELS[data.difficultyType] || data.difficultyType}</div></div>
    ${data.gradeLevel ? `<div class="info-card"><div class="label">المستوى</div><div class="value">${data.gradeLevel}</div></div>` : ""}
    ${data.evaluationStartDate && data.evaluationEndDate ? `<div class="info-card"><div class="label">فترة التقييم</div><div class="value">${data.evaluationStartDate} — ${data.evaluationEndDate}</div></div>` : ""}
  </div>
  ${data.overallProgress || data.progressPercentage != null ? `<div class="section" style="text-align:center;padding:20px;background:#f8f9fa;border-radius:12px;margin-bottom:25px;">
    ${data.overallProgress ? `<div class="progress-badge ${["significant_improvement","moderate_improvement","slight_improvement"].includes(data.overallProgress) ? "progress-positive" : data.overallProgress === "stable" ? "progress-neutral" : "progress-negative"}">${PROGRESS_LABELS[data.overallProgress] || data.overallProgress}</div>` : ""}
    ${data.progressPercentage != null ? `<div style="font-size:48px;font-weight:800;color:#1565C0;margin-top:10px;">${data.progressPercentage}%</div><div style="font-size:14px;color:#6c757d;">نسبة التقدم</div>` : ""}
  </div>` : ""}
  ${data.assessmentData?.length ? `<div class="section"><div class="section-title" style="color:#1565C0;border-color:#1565C0;">سجل التقييمات</div>
    <table class="scores-table"><thead><tr><th>الفترة</th>${Object.keys(SKILL_LABELS).map(k => `<th>${SKILL_LABELS[k]}</th>`).join("")}</tr></thead><tbody>
      ${data.assessmentData.map(a => `<tr><td style="font-weight:600;">${a.label || a.date}</td>${Object.keys(SKILL_LABELS).map(k => `<td style="color:${getScoreColor(a.scores[k] || 0)};font-weight:700;">${a.scores[k] || 0}</td>`).join("")}</tr>`).join("")}
    </tbody></table></div>` : ""}
  ${data.detailedAnalysis ? `<div class="section"><div class="section-title" style="color:#1565C0;border-color:#1565C0;">التحليل المفصل</div><p style="font-size:14px;line-height:1.9;">${data.detailedAnalysis}</p></div>` : ""}
  ${data.predictiveInsights ? `<div class="section"><div class="section-title" style="color:#1565C0;border-color:#1565C0;">رؤى تنبؤية</div><p style="font-size:14px;line-height:1.9;background:#e3f2fd;padding:15px;border-radius:8px;border-right:4px solid #1565C0;">${data.predictiveInsights}</p></div>` : ""}
  ${data.strengths?.length ? `<div class="section"><div class="section-title" style="color:#27ae60;border-color:#27ae60;">نقاط القوة</div>${data.strengths.map(s => `<div class="list-item strength">${s}</div>`).join("")}</div>` : ""}
  ${data.challenges?.length ? `<div class="section"><div class="section-title" style="color:#e74c3c;border-color:#e74c3c;">التحديات</div>${data.challenges.map(c => `<div class="list-item challenge">${c}</div>`).join("")}</div>` : ""}
  ${data.recommendations?.length ? `<div class="section"><div class="section-title" style="color:#3498db;border-color:#3498db;">التوصيات</div>${data.recommendations.map(r => `<div class="list-item recommendation">${r}</div>`).join("")}</div>` : ""}
  ${data.actionPlan ? `<div class="section"><div class="section-title" style="color:#1565C0;border-color:#1565C0;">خطة العمل</div><p style="font-size:14px;line-height:1.9;">${data.actionPlan}</p></div>` : ""}
  <div class="footer"><div class="brand">Leader Academy</div><div>تقييم مولّد بالذكاء الاصطناعي — ${new Date().toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })}</div></div>
</body></html>`;
}

export async function exportFollowUpReportPdf(data: FollowUpReportPdfData): Promise<{ url: string; isPdf: boolean }> {
  const html = await generateFollowUpReportPdf(data);
  const rand = Math.random().toString(36).slice(2, 8);
  return htmlToPdf(html, `reports/follow-up-${rand}.pdf`);
}

export async function exportProgressEvaluationPdf(data: ProgressEvaluationPdfData): Promise<{ url: string; isPdf: boolean }> {
  const html = await generateProgressEvaluationPdf(data);
  const rand = Math.random().toString(36).slice(2, 8);
  return htmlToPdf(html, `reports/progress-eval-${rand}.pdf`);
}
