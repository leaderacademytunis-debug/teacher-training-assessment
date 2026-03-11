import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

interface ParticipantPDFReportProps {
  batchId: number;
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GRADE_LABELS: Record<string, string> = {
  excellent: "ممتاز",
  good: "جيد",
  acceptable: "مقبول",
  needs_improvement: "يحتاج تحسين",
  insufficient: "غير كافي",
};

const STATUS_LABELS: Record<string, string> = {
  graded: "مُقيّم",
  submitted: "مُسلّم",
  returned: "مُعاد",
  draft: "مسودة",
  not_submitted: "لم يُسلّم",
};

export default function ParticipantPDFReport({ batchId, userId, open, onOpenChange }: ParticipantPDFReportProps) {
  const [generating, setGenerating] = useState(false);

  const reportQuery = trpc.participantReport.getData.useQuery(
    { batchId, userId },
    { enabled: open && !!batchId && !!userId }
  );

  const report = reportQuery.data;

  const generatePDF = () => {
    if (!report) return;
    setGenerating(true);

    try {
      // Build HTML content for printing
      const htmlContent = buildReportHTML(report);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          setGenerating(false);
        };
      } else {
        toast.error("يرجى السماح بالنوافذ المنبثقة لتحميل التقرير");
        setGenerating(false);
      }
    } catch (err) {
      toast.error("فشل إنشاء التقرير");
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            تقرير المشارك
          </DialogTitle>
        </DialogHeader>

        {reportQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : !report ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد بيانات</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Preview */}
            <div className="border rounded-lg p-6 bg-white">
              {/* Header */}
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-blue-800">ليدر أكاديمي</h2>
                <p className="text-sm text-gray-500 mt-1">تقرير تقدم المشارك</p>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg inline-block">
                  <h3 className="text-lg font-bold">{report.participant.name}</h3>
                  <p className="text-sm text-gray-600">{report.participant.email}</p>
                </div>
              </div>

              {/* Batch Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-1">الدفعة: {report.batch.name}</h4>
                {report.batch.description && (
                  <p className="text-xs text-gray-500">{report.batch.description}</p>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-700">{report.summary.totalAssignments}</div>
                  <div className="text-xs text-blue-600">إجمالي الواجبات</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{report.summary.completedAssignments}</div>
                  <div className="text-xs text-green-600">واجبات مُنجزة</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-700">{report.summary.gradedAssignments}</div>
                  <div className="text-xs text-purple-600">واجبات مُقيّمة</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-xl font-bold text-amber-700">{report.summary.overallAvg}%</div>
                  <div className="text-xs text-amber-600">المعدل العام</div>
                </div>
              </div>

              {/* Assignment Results Table */}
              <h4 className="font-medium text-sm mb-3">تفاصيل الواجبات</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-right">الواجب</th>
                      <th className="border p-2 text-center">النوع</th>
                      <th className="border p-2 text-center">الحالة</th>
                      <th className="border p-2 text-center">العلامة</th>
                      <th className="border p-2 text-center">التقدير</th>
                      <th className="border p-2 text-center">التمكن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.assignmentResults.map((a: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">{a.title}</td>
                        <td className="border p-2 text-center text-xs">
                          {a.type === "lesson_plan" ? "جذاذة" : a.type === "exam" ? "اختبار" : a.type === "evaluation" ? "تقييم" : "حر"}
                        </td>
                        <td className="border p-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'graded' ? 'bg-green-100 text-green-700' : a.status === 'submitted' ? 'bg-blue-100 text-blue-700' : a.status === 'returned' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABELS[a.status] || a.status}
                          </span>
                        </td>
                        <td className="border p-2 text-center font-bold">
                          {a.score !== null ? `${a.score}/${a.maxScore}` : "—"}
                        </td>
                        <td className="border p-2 text-center text-xs">
                          {a.grade ? GRADE_LABELS[a.grade] || a.grade : "—"}
                        </td>
                        <td className="border p-2 text-center">
                          {a.masteryScore !== null ? `${a.masteryScore}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Feedback Section */}
              {report.assignmentResults.some((a: any) => a.feedback) && (
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3">ملاحظات التقييم</h4>
                  <div className="space-y-3">
                    {report.assignmentResults.filter((a: any) => a.feedback).map((a: any, idx: number) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="font-medium text-sm text-green-800 mb-1">{a.title}</div>
                        <p className="text-xs text-green-700">{a.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t text-center text-xs text-gray-400">
                <p>تم إنشاء هذا التقرير بتاريخ {new Date(report.generatedAt).toLocaleDateString("ar-TN")} - ليدر أكاديمي</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button onClick={generatePDF} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Printer className="h-4 w-4 ml-2" />}
                طباعة / تحميل PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function buildReportHTML(report: any): string {
  const gradeLabels: Record<string, string> = {
    excellent: "ممتاز", good: "جيد", acceptable: "مقبول",
    needs_improvement: "يحتاج تحسين", insufficient: "غير كافي",
  };
  const statusLabels: Record<string, string> = {
    graded: "مُقيّم", submitted: "مُسلّم", returned: "مُعاد",
    draft: "مسودة", not_submitted: "لم يُسلّم",
  };

  const rows = report.assignmentResults.map((a: any) => `
    <tr>
      <td style="border:1px solid #ddd;padding:8px;font-weight:500;">${a.title}</td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;font-size:12px;">
        ${a.type === "lesson_plan" ? "جذاذة" : a.type === "exam" ? "اختبار" : a.type === "evaluation" ? "تقييم" : "حر"}
      </td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;">
        <span style="padding:2px 8px;border-radius:4px;font-size:11px;background:${a.status === 'graded' ? '#dcfce7' : a.status === 'submitted' ? '#dbeafe' : '#f3f4f6'};color:${a.status === 'graded' ? '#166534' : a.status === 'submitted' ? '#1e40af' : '#6b7280'};">
          ${statusLabels[a.status] || a.status}
        </span>
      </td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;font-weight:bold;">
        ${a.score !== null ? `${a.score}/${a.maxScore}` : "—"}
      </td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;font-size:12px;">
        ${a.grade ? gradeLabels[a.grade] || a.grade : "—"}
      </td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;">
        ${a.masteryScore !== null ? `${a.masteryScore}%` : "—"}
      </td>
    </tr>
  `).join("");

  const feedbackRows = report.assignmentResults
    .filter((a: any) => a.feedback)
    .map((a: any) => `
      <div style="padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:8px;">
        <div style="font-weight:600;font-size:13px;color:#166534;margin-bottom:4px;">${a.title}</div>
        <p style="font-size:12px;color:#15803d;margin:0;line-height:1.6;">${a.feedback}</p>
      </div>
    `).join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير المشارك - ${report.participant.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20mm; color: #1f2937; font-size: 13px; line-height: 1.6; }
    @media print { body { padding: 15mm; } @page { size: A4; margin: 15mm; } }
    h1 { font-size: 22px; color: #1e40af; }
    h2 { font-size: 16px; color: #374151; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; border: 1px solid #ddd; padding: 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:24px;border-bottom:2px solid #3b82f6;padding-bottom:16px;">
    <h1>ليدر أكاديمي</h1>
    <p style="color:#6b7280;font-size:12px;">تقرير تقدم المشارك</p>
    <div style="margin-top:12px;padding:10px;background:#eff6ff;border-radius:8px;display:inline-block;">
      <div style="font-size:18px;font-weight:700;">${report.participant.name}</div>
      <div style="font-size:12px;color:#6b7280;">${report.participant.email}</div>
    </div>
  </div>

  <div style="background:#f9fafb;padding:10px;border-radius:8px;margin-bottom:16px;">
    <strong>الدفعة:</strong> ${report.batch.name}
    ${report.batch.description ? `<br/><span style="font-size:12px;color:#6b7280;">${report.batch.description}</span>` : ""}
  </div>

  <div style="display:flex;gap:12px;margin-bottom:20px;">
    <div style="flex:1;text-align:center;padding:12px;background:#eff6ff;border-radius:8px;">
      <div style="font-size:22px;font-weight:700;color:#1e40af;">${report.summary.totalAssignments}</div>
      <div style="font-size:11px;color:#3b82f6;">إجمالي الواجبات</div>
    </div>
    <div style="flex:1;text-align:center;padding:12px;background:#f0fdf4;border-radius:8px;">
      <div style="font-size:22px;font-weight:700;color:#166534;">${report.summary.completedAssignments}</div>
      <div style="font-size:11px;color:#16a34a;">واجبات مُنجزة</div>
    </div>
    <div style="flex:1;text-align:center;padding:12px;background:#faf5ff;border-radius:8px;">
      <div style="font-size:22px;font-weight:700;color:#7c3aed;">${report.summary.gradedAssignments}</div>
      <div style="font-size:11px;color:#8b5cf6;">واجبات مُقيّمة</div>
    </div>
    <div style="flex:1;text-align:center;padding:12px;background:#fffbeb;border-radius:8px;">
      <div style="font-size:22px;font-weight:700;color:#d97706;">${report.summary.overallAvg}%</div>
      <div style="font-size:11px;color:#f59e0b;">المعدل العام</div>
    </div>
  </div>

  <h2>تفاصيل الواجبات</h2>
  <table>
    <thead>
      <tr>
        <th style="text-align:right;">الواجب</th>
        <th>النوع</th>
        <th>الحالة</th>
        <th>العلامة</th>
        <th>التقدير</th>
        <th>التمكن</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  ${feedbackRows ? `<h2>ملاحظات التقييم</h2>${feedbackRows}` : ""}

  <div style="margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;">
    تم إنشاء هذا التقرير بتاريخ ${new Date(report.generatedAt).toLocaleDateString("ar-TN")} - ليدر أكاديمي
  </div>
</body>
</html>`;
}
