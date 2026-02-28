import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  X,
  Loader2,
  ClipboardCheck,
  FileDown,
  Share2,
  Mail,
  Copy,
  Link,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SUBJECTS = [
  "اللغة العربية",
  "الرياضيات",
  "الإيقاظ العلمي",
  "اللغة الفرنسية",
  "التربية الإسلامية",
  "التاريخ والجغرافيا",
  "التربية المدنية",
  "التربية الفنية",
  "التربية البدنية",
];

const LEVELS = [
  "السنة الأولى ابتدائي",
  "السنة الثانية ابتدائي",
  "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي",
  "السنة الخامسة ابتدائي",
  "السنة السادسة ابتدائي",
  "السنة السابعة (إعدادي)",
  "السنة الثامنة (إعدادي)",
  "السنة التاسعة (إعدادي)",
];

type EvaluationResult = {
  noteGlobale: number;
  appreciation: string;
  criteres: Array<{
    nom: string;
    note: number;
    noteMax: number;
    commentaire: string;
    points: string[];
    ameliorations: string[];
  }>;
  pointsForts: string[];
  pointsAmeliorer: string[];
  recommandations: string;
};

function NoteCircle({ note, max = 20 }: { note: number; max?: number }) {
  const pct = Math.round((note / max) * 100);
  const color =
    pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-3xl font-bold" style={{ color }}>{note}</span>
        <span className="text-xs text-muted-foreground">/ {max}</span>
      </div>
    </div>
  );
}

function CritereCard({ critere, index }: { critere: EvaluationResult["criteres"][0]; index: number }) {
  const [open, setOpen] = useState(false);
  const pct = (critere.note / critere.noteMax) * 100;
  const color = pct >= 75 ? "text-green-600" : pct >= 50 ? "text-amber-500" : "text-red-500";
  const bgColor = pct >= 75 ? "bg-green-50 border-green-200" : pct >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className={`rounded-xl border p-4 cursor-pointer transition-all ${bgColor}`} onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-muted-foreground border">
            {index + 1}
          </div>
          <div>
            <p className="font-semibold text-sm">{critere.nom}</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={pct} className="h-1.5 w-24" />
              <span className={`text-sm font-bold ${color}`}>{critere.note}/{critere.noteMax}</span>
            </div>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">{critere.commentaire}</p>
          {critere.points.length > 0 && (
            <div>
              <p className="font-semibold text-green-700 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> نقاط القوة
              </p>
              <ul className="space-y-1">
                {critere.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-green-700">
                    <span className="mt-0.5">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {critere.ameliorations.length > 0 && (
            <div>
              <p className="font-semibold text-amber-700 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> اقتراحات التحسين
              </p>
              <ul className="space-y-1">
                {critere.ameliorations.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-amber-700">
                    <span className="mt-0.5">•</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EvaluateFiche() {
  const [, navigate] = useLocation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const shareMutation = trpc.assistant.shareEvaluation.useMutation({
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      setShareDialogOpen(true);
      setEmailSent(false);
    },
    onError: (err) => {
      toast.error("خطأ في إنشاء رابط المشاركة", { description: err.message });
    },
  });

  const sendEmailMutation = trpc.assistant.sendEvaluationByEmail.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      setEmailInput("");
      setRecipientName("");
      toast.success("تم إرسال التقرير بنجاح");
    },
    onError: (err) => {
      toast.error("خطأ في إرسال البريد", { description: err.message });
    },
  });

  const handleShare = () => {
    if (!result) return;
    shareMutation.mutate({
      ...result,
      fileName: file?.name,
      subject: subject || undefined,
      level: level || undefined,
      pdfUrl: pdfUrl || undefined,
      origin: window.location.origin,
    });
  };

  const handleSendEmail = () => {
    if (!emailInput || !shareUrl || !result) return;
    sendEmailMutation.mutate({
      recipientEmail: emailInput,
      recipientName: recipientName || undefined,
      shareUrl,
      noteGlobale: result.noteGlobale,
      appreciation: result.appreciation,
      subject: subject || undefined,
      level: level || undefined,
      pdfUrl: pdfUrl || undefined,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("تم نسخ الرابط");
  };

  const exportPDFMutation = trpc.assistant.exportEvaluationPDF.useMutation({
    onSuccess: (data) => {
      // Trigger download
      const a = document.createElement("a");
      a.href = data.url;
      a.download = `rapport-evaluation-${Date.now()}.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("تم تحميل التقرير بنجاح");
    },
    onError: (err) => {
      toast.error("خطأ في إنشاء التقرير", { description: err.message });
    },
  });

  const handleExportPDF = () => {
    if (!result) return;
    exportPDFMutation.mutate(
      {
        ...result,
        fileName: file?.name,
        subject: subject || undefined,
        level: level || undefined,
      },
      {
        onSuccess: (data) => {
          setPdfUrl(data.url);
          const a = document.createElement("a");
          a.href = data.url;
          a.download = `rapport-evaluation-${Date.now()}.pdf`;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("تم تحميل التقرير بنجاح");
        },
      }
    );
  };

  const evaluateMutation = trpc.assistant.evaluateFiche.useMutation({
    onSuccess: (data) => {
      setResult(data.evaluation);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err) => {
      toast.error("خطأ في التقييم", { description: err.message });
    },
  });

  const handleFile = useCallback((f: File) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(f.type) && !["pdf", "doc", "docx", "txt"].includes(ext || "")) {
      toast.error("تنسيق غير مدعوم", { description: "يُرجى رفع ملف PDF أو Word أو نصي" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("الملف كبير جداً", { description: "الحد الأقصى 10 ميغابايت" });
      return;
    }
    setFile(f);
    setResult(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      evaluateMutation.mutate({
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        subject: subject || undefined,
        level: level || undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const appreciationColor = (app: string) => {
    if (app.includes("Très Bien") || app.includes("ممتاز")) return "bg-green-100 text-green-800 border-green-300";
    if (app.includes("Bien") || app.includes("جيد جداً")) return "bg-blue-100 text-blue-800 border-blue-300";
    if (app.includes("Assez") || app.includes("جيد")) return "bg-amber-100 text-amber-800 border-amber-300";
    if (app.includes("Passable") || app.includes("مقبول")) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">تقييم الفيشة البيداغوجية</h1>
              <p className="text-xs text-muted-foreground">وفق الشبكة الرسمية للتفتيش التربوي</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Result section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Score card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <NoteCircle note={result.noteGlobale} />
                  <div className="text-center sm:text-right">
                    <p className="text-violet-200 text-sm mb-1">النتيجة الإجمالية</p>
                    <h2 className="text-3xl font-bold mb-2">{result.noteGlobale} / 20</h2>
                    <Badge className={`text-sm px-3 py-1 border ${appreciationColor(result.appreciation)}`}>
                      {result.appreciation}
                    </Badge>
                    {file && (
                      <p className="text-violet-200 text-xs mt-2 flex items-center gap-1 justify-center sm:justify-start">
                        <FileText className="w-3.5 h-3.5" /> {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Criteria */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-violet-500" />
                التقييم التفصيلي حسب المعايير
              </h3>
              <div className="space-y-3">
                {result.criteres.map((c, i) => (
                  <CritereCard key={i} critere={c} index={i} />
                ))}
              </div>
            </div>

            {/* Strengths & improvements */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> نقاط القوة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.pointsForts.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> نقاط التحسين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.pointsAmeliorer.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="border-violet-200 bg-violet-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-violet-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> توصيات المتفقد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-violet-700 leading-relaxed">{result.recommandations}</p>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                onClick={handleExportPDF}
                disabled={exportPDFMutation.isPending}
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {exportPDFMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ إنشاء التقرير...</>
                ) : (
                  <><FileDown className="w-4 h-4" /> تحميل التقرير PDF</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setResult(null); setFile(null); }}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                تقييم فيشة أخرى
              </Button>
            </div>
          </div>
        )}

        {/* Upload form */}
        {!result && (
          <div className="space-y-6">
            {/* Info banner */}
            <Card className="border-violet-200 bg-violet-50">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-violet-700 leading-relaxed text-center">
                  ارفع فيشتك البيداغوجية (PDF أو Word) وستحصل على تقييم فوري على 20 وفق الشبكة الرسمية للتفتيش التربوي التونسي، مع ملاحظات تفصيلية لكل معيار.
                </p>
              </CardContent>
            </Card>

            {/* Context selectors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">السياق البيداغوجي (اختياري)</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">المادة الدراسية</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">-- اختر المادة --</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">المستوى الدراسي</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">-- اختر المستوى --</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-violet-500 bg-violet-50 scale-[1.01]"
                  : file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-white hover:border-violet-400 hover:bg-violet-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />

              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="w-4 h-4 mr-1" /> إزالة الملف
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">اسحب الملف هنا أو انقر للاختيار</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF، Word (.doc/.docx)، أو نص عادي — حتى 10 ميغابايت</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!file || evaluateMutation.isPending}
              className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2"
            >
              {evaluateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جارٍ التقييم... قد يستغرق بضع ثوانٍ
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-5 h-5" />
                  تقييم الفيشة الآن
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-violet-600" />
              مشاركة تقرير التقييم
            </DialogTitle>
            <DialogDescription>
              شارك هذا التقرير عبر رابط مباشر أو أرسله بالبريد الإلكتروني
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Copy link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Link className="w-4 h-4" /> رابط المشاركة
              </Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="text-xs font-mono bg-slate-50"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                  title="نسخ الرابط"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">هذا الرابط متاح للجميع دون الحاجة لتسجيل الدخول</p>
            </div>

            <div className="border-t pt-4">
              <Label className="flex items-center gap-1.5 text-sm font-medium mb-3">
                <Mail className="w-4 h-4" /> إرسال بالبريد الإلكتروني
              </Label>
              {emailSent ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">تم إرسال التقرير بنجاح</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">اسم المستلم (اختياري)</Label>
                    <Input
                      placeholder="مثلاً: الأستاذ محمد"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">عنوان البريد *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                      />
                      <Button
                        onClick={handleSendEmail}
                        disabled={!emailInput || sendEmailMutation.isPending}
                        className="shrink-0 gap-1.5 bg-violet-600 hover:bg-violet-700"
                      >
                        {sendEmailMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Mail className="w-4 h-4" /> إرسال</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
