import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, GraduationCap, Image, Award, BarChart3, ScanLine,
  MessageSquare, BookOpen, Loader2, User, School, MapPin,
  Briefcase, TrendingUp, ShieldCheck,
} from "lucide-react";

// Radar Chart (same as TeacherPortfolio)
function RadarChart({ data, size = 260 }: { data: Record<string, number>; size?: number }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  if (labels.length < 3) return null;

  const maxVal = Math.max(...values, 1);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / labels.length;
  const levels = [0.25, 0.5, 0.75, 1];

  const gridPaths = levels.map((level) => {
    const points = labels.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + radius * level * Math.cos(angle)},${cy + radius * level * Math.sin(angle)}`;
    });
    return points.join(" ");
  });

  const dataPoints = values.map((val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / maxVal) * radius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  const labelPositions = labels.map((label, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return { label, x: cx + (radius + 25) * Math.cos(angle), y: cy + (radius + 25) * Math.sin(angle) };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] mx-auto">
      {gridPaths.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {labels.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      <polygon points={dataPoints.join(" ")} fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth="2" />
      {values.map((val, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const r = (val / maxVal) * radius;
        return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="4" fill="#2563eb" />;
      })}
      {labelPositions.map((lp, i) => (
        <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-gray-600" fontFamily="sans-serif">
          {lp.label.length > 12 ? lp.label.slice(0, 12) + "…" : lp.label}
        </text>
      ))}
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: {
  icon: typeof FileText; label: string; value: number; color: string; bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center`}>
      <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

export default function PublicPortfolio() {
  const [, params] = useRoute("/public-portfolio/:token");
  const token = params?.token || "";

  const { data: portfolio, isLoading, error } = trpc.portfolio2.getPublicPortfolio.useQuery(
    { token },
    { enabled: !!token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">الملف المهني غير متاح</h2>
            <p className="text-gray-600">هذا الملف المهني غير موجود أو غير عام.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjectBreakdown = (portfolio.subjectBreakdown || {}) as Record<string, number>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="container max-w-5xl py-10">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <span className="text-sm text-blue-200">ملف مهني معتمد من Leader Academy</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
              {(portfolio.userName || "م")?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{portfolio.userName || "معلم"}</h1>
              {portfolio.currentSchool && (
                <div className="flex items-center gap-2 mt-2 text-blue-200">
                  <School className="w-4 h-4" />
                  <span>{portfolio.currentSchool}</span>
                </div>
              )}
              {portfolio.region && (
                <div className="flex items-center gap-2 mt-1 text-blue-200">
                  <MapPin className="w-4 h-4" />
                  <span>{portfolio.region}</span>
                </div>
              )}
              {portfolio.specializations && (portfolio.specializations as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(portfolio.specializations as string[]).map((s: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-white/20 text-white border-0">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* Bio */}
        {portfolio.bio && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                نبذة مهنية
              </h3>
              <p className="text-gray-600 leading-relaxed">{portfolio.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            الإنجازات الرقمية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="جذاذة" value={portfolio.totalLessonPlans} color="text-blue-600" bgColor="bg-blue-50" />
            <StatCard icon={GraduationCap} label="اختبار" value={portfolio.totalExams} color="text-purple-600" bgColor="bg-purple-50" />
            <StatCard icon={Image} label="صورة تعليمية" value={portfolio.totalImages} color="text-green-600" bgColor="bg-green-50" />
            <StatCard icon={Award} label="شهادة" value={portfolio.totalCertificates} color="text-amber-600" bgColor="bg-amber-50" />
            <StatCard icon={BarChart3} label="تقييم" value={portfolio.totalEvaluations} color="text-orange-600" bgColor="bg-orange-50" />
            <StatCard icon={ScanLine} label="وثيقة مرقمنة" value={portfolio.totalDigitizedDocs} color="text-teal-600" bgColor="bg-teal-50" />
            <StatCard icon={MessageSquare} label="محادثة ذكية" value={portfolio.totalConversations} color="text-indigo-600" bgColor="bg-indigo-50" />
            <StatCard icon={BookOpen} label="مادة" value={Object.keys(subjectBreakdown).length} color="text-rose-600" bgColor="bg-rose-50" />
          </div>
        </div>

        {/* Radar Chart */}
        {Object.keys(subjectBreakdown).length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                مخطط الكفاءات
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RadarChart data={subjectBreakdown} />
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t">
          <p className="text-sm text-gray-400">
            تم إنشاء هذا الملف المهني بواسطة <span className="font-semibold text-blue-600">Leader Academy</span> — المساعد البيداغوجي الذكي
          </p>
        </div>
      </div>
    </div>
  );
}
