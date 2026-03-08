import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  "اللغة العربية",
  "الرياضيات",
  "الإيقاظ العلمي",
  "التربية الإسلامية",
  "التربية المدنية",
  "اللغة الفرنسية",
  "التربية التشكيلية",
  "التربية الموسيقية",
  "التربية البدنية",
];

const LEVELS = [
  "السنة الأولى ابتدائي",
  "السنة الثانية ابتدائي",
  "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي",
  "السنة الخامسة ابتدائي",
  "السنة السادسة ابتدائي",
];

const TRIMESTERS = [
  "الثلاثي الأول",
  "الثلاثي الثاني",
  "الثلاثي الثالث",
];

const DURATIONS = [
  "30 دقيقة",
  "45 دقيقة",
  "60 دقيقة",
  "90 دقيقة",
];

// ─── Criteria Badge ────────────────────────────────────────────────────────────

function CriteriaBadge({ code, label, color }: { code: string; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${color}`}>
      <span className="font-bold text-sm font-mono">{code}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ExamBuilder() {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [trimester, setTrimester] = useState("");
  const [duration, setDuration] = useState("45 دقيقة");
  const [totalScore, setTotalScore] = useState(20);
  const [topics, setTopics] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [generatedExam, setGeneratedExam] = useState("");
  const [copied, setCopied] = useState(false);

  const generateExam = trpc.edugpt.generateExam.useMutation({
    onSuccess: (data) => {
      setGeneratedExam(data.exam);
      toast.success("تم إنشاء الاختبار بنجاح!");
    },
    onError: (err) => {
      toast.error(`حدث خطأ: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    if (!subject || !level || !trimester) {
      toast.error("يُرجى تحديد المادة والمستوى والثلاثي");
      return;
    }
    setGeneratedExam("");
    generateExam.mutate({
      subject,
      level,
      trimester,
      duration,
      totalScore,
      topics: topics.trim() || undefined,
      additionalInstructions: additionalInstructions.trim() || undefined,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedExam);
    setCopied(true);
    toast.success("تم نسخ الاختبار إلى الحافظة");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>اختبار - ${subject} - ${level}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          body { font-family: 'Amiri', serif; direction: rtl; padding: 20px; font-size: 14px; line-height: 1.8; }
          h1, h2, h3 { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #333; padding: 6px 10px; text-align: right; }
          th { background: #f0f0f0; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div style="white-space: pre-wrap;">${generatedExam.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 border-b border-blue-700 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
            📝
          </div>
          <div>
            <h1 className="text-xl font-bold">المتفقد المميز للتربية</h1>
            <p className="text-blue-200 text-sm">بناء اختبارات رسمية وفق المقاربة بالكفايات — المرحلة الابتدائية التونسية</p>
          </div>
          <div className="mr-auto">
            <Badge variant="outline" className="border-blue-400 text-blue-200 text-xs">
              خبرة 30 عاماً في هندسة التقييم
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Panel: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Criteria Info */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                <span>🎯</span> نظام المعايير المعتمد
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <CriteriaBadge code="مع1" label="التملك الأساسي للموارد" color="bg-green-900/30 border-green-700/50 text-green-300" />
              <CriteriaBadge code="مع2" label="التوظيف السليم للموارد" color="bg-blue-900/30 border-blue-700/50 text-blue-300" />
              <CriteriaBadge code="مع3" label="التميز والدقة (الإدماج)" color="bg-purple-900/30 border-purple-700/50 text-purple-300" />
              <CriteriaBadge code="مع4" label="جودة التقديم والخط" color="bg-amber-900/30 border-amber-700/50 text-amber-300" />
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <span>⚙️</span> معطيات الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-xs">المادة *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر المادة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-xs">المستوى *</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر المستوى..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trimester */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-xs">الثلاثي *</Label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر الثلاثي..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTERS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration + Score */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-xs">المدة</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-blue-200 text-xs">المجموع (نقطة)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={40}
                    value={totalScore}
                    onChange={e => setTotalScore(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Topics */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-xs">المحاور المقررة (اختياري)</Label>
                <Textarea
                  value={topics}
                  onChange={e => setTopics(e.target.value)}
                  placeholder="مثال: الأعداد الصحيحة، الكسور، الضرب..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none h-20"
                />
              </div>

              {/* Additional Instructions */}
              <div className="space-y-1.5">
                <Label className="text-blue-200 text-xs">تعليمات إضافية (اختياري)</Label>
                <Textarea
                  value={additionalInstructions}
                  onChange={e => setAdditionalInstructions(e.target.value)}
                  placeholder="مثال: أضف تمريناً على الهندسة، ركز على الإدماج..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none h-20"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generateExam.isPending || !subject || !level || !trimester}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 text-base"
              >
                {generateExam.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> جارٍ بناء الاختبار...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>📝</span> بناء الاختبار
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Result */}
        <div className="lg:col-span-3">
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <span>📄</span> الاختبار المُنتَج
                {generatedExam && (
                  <Badge className="bg-green-600 text-white text-xs mr-2">جاهز للطباعة</Badge>
                )}
              </CardTitle>
              {generatedExam && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    {copied ? "✅ تم النسخ" : "📋 نسخ"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePrint}
                    className="bg-green-700 hover:bg-green-600 text-white text-xs"
                  >
                    🖨️ طباعة
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!generatedExam && !generateExam.isPending && (
                <div className="flex flex-col items-center justify-center h-80 text-center text-white/40 gap-4">
                  <div className="text-6xl">📝</div>
                  <div>
                    <p className="font-semibold text-white/60">أدخل معطيات الاختبار</p>
                    <p className="text-sm mt-1">حدد المادة والمستوى والثلاثي ثم اضغط "بناء الاختبار"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-white/50 max-w-sm">
                    <div className="bg-white/5 rounded-lg p-3 text-right">
                      <div className="font-semibold text-white/70 mb-1">✅ وضعيات مشكلة</div>
                      <div>3–4 سندات واقعية محفزة</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-right">
                      <div className="font-semibold text-white/70 mb-1">✅ نظام المعايير</div>
                      <div>مع1 → مع2 → مع3 → مع4</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-right">
                      <div className="font-semibold text-white/70 mb-1">✅ تدرج الصعوبة</div>
                      <div>من السهل إلى الأصعب</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-right">
                      <div className="font-semibold text-white/70 mb-1">✅ جدول الإسناد</div>
                      <div>توزيع الدرجات بالمعايير</div>
                    </div>
                  </div>
                </div>
              )}

              {generateExam.isPending && (
                <div className="flex flex-col items-center justify-center h-80 text-center gap-4">
                  <div className="text-5xl animate-bounce">⏳</div>
                  <div>
                    <p className="font-semibold text-blue-300">المتفقد المميز يبني الاختبار...</p>
                    <p className="text-sm text-white/50 mt-1">يُطبّق نظام المعايير والمقاربة بالكفايات</p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {generatedExam && (
                <div
                  className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed overflow-auto max-h-[700px] pr-2"
                  style={{ direction: "rtl" }}
                >
                  <Streamdown>{generatedExam}</Streamdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
