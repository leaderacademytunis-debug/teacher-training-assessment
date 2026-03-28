import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  FileDown,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useI18n from "@/i18n";


function NoteCircle({ note }: { note: number }) {
  const pct = (note / 20) * 100;
  const color = pct >= 75 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="white" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{note}</span>
        <span className="text-white/70 text-xs">/20</span>
      </div>
    </div>
  );
}

function getNoteColor(note: number, max: number) {
  const pct = (note / max) * 100;
  if (pct >= 75) return "text-green-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-600";
}

function getBarColor(note: number, max: number) {
  const pct = (note / max) * 100;
  if (pct >= 75) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function appreciationColor(app: string) {
  if (app.includes("Très Bien") || app.includes("ممتاز")) return "bg-green-100 text-green-800 border-green-300";
  if (app.includes("Bien") || app.includes("جيد جداً")) return "bg-blue-100 text-blue-800 border-blue-300";
  if (app.includes("Assez") || app.includes("جيد")) return "bg-amber-100 text-amber-800 border-amber-300";
  if (app.includes("Passable") || app.includes("مقبول")) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
}

export default function SharedEvaluationView() {
  const { t, lang, isRTL, dir } = useI18n();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const { data, isLoading, error } = trpc.assistant.getSharedEvaluation.useQuery(
    { token: token ?? "" },
    { enabled: !!token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto" />
          <p className="text-muted-foreground">جارٍ تحميل التقرير...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">التقرير غير موجود</h2>
          <p className="text-muted-foreground text-sm">هذا الرابط غير صالح أو انتهت صلاحيته.</p>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="gap-2">
            <ExternalLink className="w-4 h-4" /> الذهاب إلى ليدر أكاديمي
          </Button>
        </div>
      </div>
    );
  }

  const evalData = data.evaluationData;
  const noteGlobale = Number(data.noteGlobale);
  const createdDate = new Date(data.createdAt).toLocaleDateString("ar-TN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-800 text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">ليدر أكاديمي</h1>
              <p className="text-violet-200 text-sm">تقرير تقييم الفيشة البيداغوجية</p>
            </div>
            {data.pdfUrl && (
              <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="gap-1.5 border-white/30 text-white hover:bg-white/10">
                  <FileDown className="w-4 h-4" /> تحميل PDF
                </Button>
              </a>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm text-violet-200">
            {data.userName && <span>المدرس: <strong className="text-white">{data.userName}</strong></span>}
            {data.subject && <span>المادة: <strong className="text-white">{data.subject}</strong></span>}
            {data.level && <span>المستوى: <strong className="text-white">{data.level}</strong></span>}
            {data.fileName && <span>الملف: <strong className="text-white">{data.fileName}</strong></span>}
            <span>تاريخ التقييم: <strong className="text-white">{createdDate}</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Score card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <NoteCircle note={noteGlobale} />
              <div className="text-center sm:text-end">
                <p className="text-violet-200 text-sm mb-1">النتيجة الإجمالية</p>
                <h2 className="text-3xl font-bold mb-2">{noteGlobale} / 20</h2>
                <Badge className={`text-sm px-3 py-1 border ${appreciationColor(data.appreciation)}`}>
                  {data.appreciation}
                </Badge>
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
            {evalData.criteres.map((c, i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{c.nom}</span>
                    </div>
                    <span className={`font-bold text-lg shrink-0 ${getNoteColor(c.note, c.noteMax)}`}>
                      {c.note}/{c.noteMax}
                    </span>
                  </div>
                  <Progress value={(c.note / c.noteMax) * 100} className={`h-1.5 mb-2 [&>div]:${getBarColor(c.note, c.noteMax)}`} />
                  <p className="text-xs text-muted-foreground mb-2">{c.commentaire}</p>
                  {c.points.length > 0 && (
                    <div className="space-y-0.5">
                      {c.points.map((p, j) => (
                        <p key={j} className="text-xs text-green-700 flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" /> {p}
                        </p>
                      ))}
                    </div>
                  )}
                  {c.ameliorations.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {c.ameliorations.map((a, j) => (
                        <p key={j} className="text-xs text-amber-700 flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {a}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
                {evalData.pointsForts.map((p, i) => (
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
                {evalData.pointsAmeliorer.map((p, i) => (
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
            <p className="text-sm text-violet-700 leading-relaxed">{evalData.recommandations}</p>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center py-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">هل تريد تقييم فيشتك البيداغوجية؟</p>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <ExternalLink className="w-4 h-4" />
              انضم إلى ليدر أكاديمي
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
