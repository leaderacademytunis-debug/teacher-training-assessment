import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle, ClipboardCheck, ChevronDown, ChevronUp, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Criterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
  indicators: string[];
  category: "structure" | "content" | "evaluation" | "differentiation";
}

interface CriterionScore {
  score: number;
  comment: string;
}

// ─── Criteria based on official Tunisian inspection grid ─────────────────────
const CRITERIA: Criterion[] = [
  {
    id: "c1",
    label: "البيانات الإدارية والكفايات",
    description: "وجود الكفاية الختامية الرسمية، الكفاية المستهدفة، الأهداف التعلمية، مؤشرات التملك، الزمن الإجمالي",
    maxScore: 4,
    indicators: [
      "الكفاية الختامية مذكورة حرفياً من البرنامج الرسمي",
      "الأهداف التعلمية بأفعال سلوكية قابلة للقياس",
      "مؤشرات التملك محددة وقابلة للملاحظة",
      "الزمن الإجمالي محدد ومنسجم مع الحصة",
    ],
    category: "structure",
  },
  {
    id: "c2",
    label: "الوضعية الاستكشافية",
    description: "وجود وضعية مشكلة دالة تُثير الحاجة للتعلم وتستدعي المعارف السابقة",
    maxScore: 3,
    indicators: [
      "وضعية مشكلة دالة ومحفزة",
      "ربط بالمعارف السابقة",
      "دور المعلم والمتعلم محدد",
      "زمن محدد (5-10 دق)",
    ],
    category: "structure",
  },
  {
    id: "c3",
    label: "التعلم المنهجي",
    description: "تدرج الأنشطة من المحسوس إلى المجرد، تنوع صيغ العمل، ربط الأنشطة بالمعايير",
    maxScore: 4,
    indicators: [
      "تدرج منطقي من السهل إلى الصعب",
      "تنوع صيغ العمل (فردي، ثنائي، جماعي)",
      "كل نشاط مرتبط بمعيار تقييم محدد",
      "زمن دقيق لكل نشاط",
    ],
    category: "content",
  },
  {
    id: "c4",
    label: "الوضعية الإدماجية",
    description: "وضعية جديدة ودالة تستدعي توظيف الكفاية المستهدفة بشكل مستقل",
    maxScore: 3,
    indicators: [
      "وضعية جديدة غير مطابقة لأنشطة التعلم",
      "تستدعي توظيف الكفاية المستهدفة",
      "إنجاز فردي مستقل",
      "دالة من الحياة اليومية",
    ],
    category: "content",
  },
  {
    id: "c5",
    label: "شبكة التقييم المعيارية",
    description: "شبكة تقييم كاملة بمعايير واضحة ومؤشرات قابلة للقياس وسلم أعداد",
    maxScore: 3,
    indicators: [
      "5 معايير على الأقل (فهم، دقة، تعليل، تعبير، استقلالية)",
      "مؤشر تملك لكل معيار",
      "سلم أعداد واضح (على 20 أو 10)",
      "تطبيق قاعدة الثلثين",
    ],
    category: "evaluation",
  },
  {
    id: "c6",
    label: "التمايز التربوي",
    description: "أنشطة دعم للمتعثرين وأنشطة تميز للمتفوقين",
    maxScore: 3,
    indicators: [
      "أنشطة علاجية للمتعثرين",
      "أنشطة دعم للمتوسطين",
      "أنشطة تميز للمتفوقين",
    ],
    category: "differentiation",
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  structure: { label: "الهيكلة", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  content: { label: "المحتوى", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  evaluation: { label: "التقييم", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  differentiation: { label: "التمايز", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

// ─── Score circle ─────────────────────────────────────────────────────────────
function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/ {max}</span>
      </div>
    </div>
  );
}

// ─── Appreciation badge ───────────────────────────────────────────────────────
function AppreciationBadge({ pct }: { pct: number }) {
  if (pct >= 90) return <Badge className="bg-emerald-600 text-white">ممتاز</Badge>;
  if (pct >= 75) return <Badge className="bg-green-600 text-white">جيد جداً</Badge>;
  if (pct >= 60) return <Badge className="bg-amber-500 text-white">جيد</Badge>;
  if (pct >= 50) return <Badge className="bg-orange-500 text-white">مقبول</Badge>;
  return <Badge className="bg-red-500 text-white">يحتاج تطوير</Badge>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SelfEvaluationTemplate() {
  const totalMax = CRITERIA.reduce((s, c) => s + c.maxScore, 0);
  const [scores, setScores] = useState<Record<string, CriterionScore>>(
    Object.fromEntries(CRITERIA.map(c => [c.id, { score: 0, comment: "" }]))
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalScore = Object.values(scores).reduce((s, v) => s + v.score, 0);
  const pct = Math.round((totalScore / totalMax) * 100);

  const setScore = (id: string, score: number) =>
    setScores(prev => ({ ...prev, [id]: { ...prev[id], score } }));
  const setComment = (id: string, comment: string) =>
    setScores(prev => ({ ...prev, [id]: { ...prev[id], comment } }));

  const handleReset = () => {
    setScores(Object.fromEntries(CRITERIA.map(c => [c.id, { score: 0, comment: "" }])));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success("تم حفظ التقييم الذاتي", {
      description: `مجموع النقاط: ${totalScore} / ${totalMax} — ${pct}%`,
    });
  };

  const handleExport = () => {
    const lines = [
      "شبكة التقييم الذاتي للمذكرة البيداغوجية",
      "=".repeat(50),
      "",
      ...CRITERIA.map(c => {
        const s = scores[c.id];
        return [
          `${c.label}: ${s.score} / ${c.maxScore}`,
          s.comment ? `  ملاحظة: ${s.comment}` : "",
        ].filter(Boolean).join("\n");
      }),
      "",
      "=".repeat(50),
      `المجموع: ${totalScore} / ${totalMax} (${pct}%)`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "تقييم-ذاتي-مذكرة.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ClipboardCheck className="w-5 h-5" />
            شبكة التقييم الذاتي للمذكرة البيداغوجية
          </CardTitle>
          <p className="text-sm text-blue-600">
            وفق معايير التفتيش التربوي التونسي — قيّم مذكرتك قبل تقديمها للمتفقد
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 flex-wrap">
            <ScoreCircle score={totalScore} max={totalMax} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{totalScore} / {totalMax}</span>
                <AppreciationBadge pct={pct} />
              </div>
              <Progress value={pct} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {pct >= 75
                  ? "✅ مذكرتك جاهزة للتقديم للمتفقد"
                  : pct >= 50
                  ? "⚠️ مذكرتك تحتاج بعض التحسينات قبل التقديم"
                  : "❌ مذكرتك تحتاج مراجعة شاملة"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria */}
      {CRITERIA.map(criterion => {
        const s = scores[criterion.id];
        const catStyle = CATEGORY_LABELS[criterion.category];
        const critPct = criterion.maxScore > 0 ? (s.score / criterion.maxScore) * 100 : 0;
        const isExpanded = expanded[criterion.id];

        return (
          <Card key={criterion.id} className={`border ${catStyle.bg} transition-all`}>
            <CardContent className="pt-4 pb-3">
              {/* Header row */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(prev => ({ ...prev, [criterion.id]: !prev[criterion.id] }))}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className={`text-xs ${catStyle.color} border-current`}>
                    {catStyle.label}
                  </Badge>
                  <span className="font-semibold text-sm">{criterion.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {critPct >= 75
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : critPct >= 50
                    ? <AlertCircle className="w-4 h-4 text-amber-500" />
                    : <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="font-bold text-sm min-w-[3rem] text-right">
                    {s.score} / {criterion.maxScore}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Progress bar */}
              <Progress value={critPct} className="h-1.5 mt-2" />

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">{criterion.description}</p>

                  {/* Indicators checklist */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">المؤشرات</p>
                    {criterion.indicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 text-muted-foreground">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>

                  {/* Score slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">النقطة</span>
                      <span className="font-bold text-blue-700">{s.score} / {criterion.maxScore}</span>
                    </div>
                    <Slider
                      min={0}
                      max={criterion.maxScore}
                      step={0.5}
                      value={[s.score]}
                      onValueChange={([v]) => setScore(criterion.id, v)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 — غائب</span>
                      <span>{(criterion.maxScore * 0.5).toFixed(1)} — جزئي</span>
                      <span>{criterion.maxScore} — كامل</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <Textarea
                    placeholder="ملاحظة اختيارية (نقاط القوة / ما يجب تحسينه)..."
                    value={s.comment}
                    onChange={e => setComment(criterion.id, e.target.value)}
                    className="text-sm min-h-[60px] resize-none"
                    dir="rtl"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Recommendations */}
      {submitted && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="pt-4">
            <p className="font-semibold text-sm mb-3">📋 توصيات التطوير</p>
            <div className="space-y-2">
              {CRITERIA.filter(c => {
                const s = scores[c.id];
                return s.score / c.maxScore < 0.75;
              }).map(c => (
                <div key={c.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>
                    <strong>{c.label}</strong>: {c.description}
                  </span>
                </div>
              ))}
              {CRITERIA.filter(c => scores[c.id].score / c.maxScore < 0.75).length === 0 && (
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  مذكرتك تستوفي جميع المعايير الرئيسية. يمكن تقديمها للمتفقد.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={handleSubmit} className="flex-1 bg-blue-700 hover:bg-blue-800 gap-2">
          <ClipboardCheck className="w-4 h-4" />
          حفظ التقييم الذاتي
        </Button>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          تصدير
        </Button>
        <Button variant="ghost" onClick={handleReset} className="gap-2 text-muted-foreground">
          <RotateCcw className="w-4 h-4" />
          إعادة تعيين
        </Button>
      </div>
    </div>
  );
}
