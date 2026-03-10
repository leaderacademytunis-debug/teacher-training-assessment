import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Upload, Sparkles, BookOpen, GraduationCap,
  FileText, Tag, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const CONTENT_TYPES = [
  { value: "lesson_plan", label: "جذاذة درس" },
  { value: "exam", label: "اختبار" },
  { value: "evaluation", label: "تقييم" },
  { value: "drama_script", label: "نص مسرحي" },
  { value: "annual_plan", label: "مخطط سنوي" },
  { value: "digitized_doc", label: "وثيقة مرقمنة" },
  { value: "other", label: "أخرى" },
];

const SUBJECTS = [
  "اللغة العربية", "الرياضيات", "الإيقاظ العلمي", "اللغة الفرنسية",
  "التربية الإسلامية", "التربية التكنولوجية", "التربية المدنية",
  "التربية البدنية", "التربية الفنية", "التاريخ والجغرافيا",
  "اللغة الإنجليزية", "الإعلامية"
];

const GRADES = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
];

const DIFFICULTIES = [
  { value: "easy", label: "سهل" },
  { value: "medium", label: "متوسط" },
  { value: "hard", label: "صعب" },
];

export default function MarketplacePublish() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [period, setPeriod] = useState("");
  const [trimester, setTrimester] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [published, setPublished] = useState(false);
  const [sourceId, setSourceId] = useState<number | undefined>(undefined);
  const [prefilled, setPrefilled] = useState(false);

  // Pre-fill from URL params (when coming from library pages)
  useEffect(() => {
    if (prefilled) return;
    const params = new URLSearchParams(window.location.search);
    const pType = params.get("type");
    const pTitle = params.get("title");
    const pSubject = params.get("subject");
    const pGrade = params.get("grade");
    const pSourceId = params.get("sourceId");
    if (pType) setContentType(pType);
    if (pTitle) setTitle(pTitle);
    if (pSubject) setSubject(pSubject);
    if (pGrade) setGrade(pGrade);
    if (pSourceId) setSourceId(Number(pSourceId));
    if (pType || pTitle) setPrefilled(true);
  }, [prefilled]);

  const publishMutation = trpc.marketplace.publish.useMutation({
    onSuccess: () => {
      setPublished(true);
      toast.success("تم النشر بنجاح! تم نشر المحتوى في سوق المحتوى الذهبي.");
    },
    onError: (err) => {
      toast.error("خطأ: " + err.message);
    },
  });

  const handlePublish = () => {
    if (!title || !contentType || !subject || !grade || !content) {
      toast.error("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    publishMutation.mutate({
      title,
      description: description || undefined,
      contentType: contentType as any,
      subject,
      grade,
      difficulty: difficulty as any,
      period: period || undefined,
      trimester: trimester || undefined,
      content,
      tags: tags.length > 0 ? tags : undefined,
      sourceType: sourceId ? contentType : undefined,
      sourceId: sourceId || undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">يجب تسجيل الدخول</h2>
            <p className="text-muted-foreground">يجب تسجيل الدخول لنشر محتوى في السوق.</p>
            <a href={getLoginUrl()}>
              <Button className="bg-amber-600 hover:bg-amber-700">تسجيل الدخول</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (published) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700">تم النشر بنجاح!</h2>
            <p className="text-muted-foreground">
              تم نشر المحتوى في سوق المحتوى الذهبي. سيكون متاحاً للمعلمين الآخرين.
            </p>
            <p className="text-sm text-amber-600">
              تم إضافة علامة حماية الحقوق تلقائياً: "تم الإنتاج عبر Leader Academy"
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/marketplace")} className="bg-amber-600 hover:bg-amber-700 gap-2">
                <BookOpen className="h-4 w-4" />
                عرض السوق
              </Button>
              <Button variant="outline" onClick={() => { setPublished(false); setTitle(""); setDescription(""); setContent(""); setTagsInput(""); }}>
                نشر محتوى آخر
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/marketplace">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة إلى السوق
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="bg-amber-100 rounded-xl p-2">
                <Upload className="h-6 w-6 text-amber-700" />
              </div>
              نشر محتوى في السوق
            </CardTitle>
            <p className="text-muted-foreground">
              شارك أفضل أعمالك مع المعلمين الآخرين. سيتم إضافة علامة حماية الحقوق تلقائياً.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                عنوان المحتوى <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="مثال: جذاذة درس الأعداد ذات 5 أرقام - رياضيات سنة 5"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف مختصر</label>
              <Textarea
                placeholder="وصف مختصر للمحتوى (اختياري)..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Type, Subject, Grade in grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  نوع المحتوى <span className="text-red-500">*</span>
                </label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                  المادة <span className="text-red-500">*</span>
                </label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-amber-600" />
                  المستوى <span className="text-red-500">*</span>
                </label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Difficulty, Period, Trimester */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">مستوى الصعوبة</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الفترة</label>
                <Input placeholder="مثال: الفترة 3" value={period} onChange={e => setPeriod(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الثلاثي</label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger><SelectValue placeholder="اختر الثلاثي" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الثلاثي الأول">الثلاثي الأول</SelectItem>
                    <SelectItem value="الثلاثي الثاني">الثلاثي الثاني</SelectItem>
                    <SelectItem value="الثلاثي الثالث">الثلاثي الثالث</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                المحتوى <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="الصق محتوى الجذاذة أو الاختبار هنا..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-600" />
                الوسوم (مفصولة بفواصل)
              </label>
              <Input
                placeholder="مثال: أعداد, حساب, سنة خامسة"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
              />
              {tagsInput && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tagsInput.split(",").map((t, i) => t.trim() && (
                    <Badge key={i} variant="secondary" className="text-xs">{t.trim()}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Watermark notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 text-sm">حماية الحقوق الفكرية</p>
                <p className="text-amber-700 text-xs mt-1">
                  سيتم إضافة علامة تلقائية: "تم الإنتاج عبر Leader Academy بواسطة {user?.arabicName || user?.name || "المعلم"}{user?.schoolName ? ` - ${user.schoolName}` : ""}"
                </p>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending || !title || !contentType || !subject || !grade || !content}
              className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700 gap-2"
            >
              <Upload className="h-5 w-5" />
              {publishMutation.isPending ? "جاري النشر..." : "نشر في السوق"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
