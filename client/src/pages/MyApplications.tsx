import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  FileText, Briefcase, MapPin, Clock, Building2, Send,
  Eye, Users, CheckCircle2, XCircle, Star, ArrowRight,
  Loader2, Calendar, TrendingUp, ChevronLeft, Sparkles,
  Bell, GraduationCap
} from "lucide-react";
import useI18n from "@/i18n";


const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  sent: { label: "مُرسل", icon: Send, color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  viewed: { label: "تم الاطلاع", icon: Eye, color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  shortlisted: { label: "القائمة المختصرة", icon: Star, color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
  interviewed: { label: "تمت المقابلة", icon: Users, color: "text-teal-700", bgColor: "bg-teal-50 border-teal-200" },
  accepted: { label: "مقبول", icon: CheckCircle2, color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  rejected: { label: "مرفوض", icon: XCircle, color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
};

const STEPS = ["sent", "viewed", "shortlisted", "interviewed", "accepted"];

export default function MyApplications() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user } = useAuth();
  const applicationsQuery = trpc.applications.myApplications.useQuery(undefined, { enabled: !!user });
  const countsQuery = trpc.applications.myCounts.useQuery(undefined, { enabled: !!user });
  const matchNotifs = trpc.smartMatch.myNotifications.useQuery(undefined, { enabled: !!user });
  const markRead = trpc.smartMatch.markRead.useMutation({
    onSuccess: () => matchNotifs.refetch(),
  });

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">يرجى تسجيل الدخول</h2>
            <p className="text-slate-500 mb-4">لعرض طلباتك، يرجى تسجيل الدخول أولاً</p>
            <a href={getLoginUrl()}>
              <Button style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>تسجيل الدخول</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applications = applicationsQuery.data || [];
  const counts = countsQuery.data;
  const notifications = matchNotifs.data || [];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A237E 0%, #1565C0 50%, #0D47A1 100%)" }}>
        <div className="container max-w-6xl py-10 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-300" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">طلباتي</h1>
              </div>
              <p className="text-blue-200">تتبع حالة طلبات التوظيف الخاصة بك</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Briefcase className="w-4 h-4" />
                تصفح العروض
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        {/* Stats Cards */}
        {counts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard icon={Send} label="مُرسلة" value={counts.sent} color="blue" />
            <StatCard icon={Eye} label="تم الاطلاع" value={counts.viewed} color="amber" />
            <StatCard icon={Users} label="مقابلات" value={counts.interviewed} color="teal" />
            <StatCard icon={CheckCircle2} label="مقبولة" value={counts.accepted} color="emerald" />
          </div>
        )}

        {/* Smart Match Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              إشعارات المطابقة الذكية
            </h2>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif: any) => (
                <Card key={notif.id} className={`border ${notif.isRead ? "bg-white" : "bg-amber-50 border-amber-200"}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notif.isRead ? "bg-slate-100" : "bg-amber-100"}`}>
                        <Bell className={`w-5 h-5 ${notif.isRead ? "text-slate-500" : "text-amber-600"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {notif.school?.schoolName || "مدرسة"} في {notif.school?.region || notif.job?.region} تبحث عن خبير في مجالك!
                        </p>
                        <p className="text-xs text-slate-500">
                          {notif.job?.title} — نسبة المطابقة: <span className="font-bold text-amber-600">{notif.matchScore}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700">{notif.matchScore}%</Badge>
                      {!notif.isRead && (
                        <Button size="sm" variant="ghost" onClick={() => markRead.mutate({ notificationId: notif.id })}>
                          قراءة
                        </Button>
                      )}
                      <Link href="/jobs">
                        <Button size="sm" variant="outline" className="gap-1">
                          عرض <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Applications List */}
        <h2 className="text-lg font-bold text-slate-800 mb-4">سجل الطلبات ({applications.length})</h2>

        {applicationsQuery.isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!applicationsQuery.isLoading && applications.length === 0 && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">لم تتقدم لأي عرض بعد</h3>
              <p className="text-slate-400 mb-4">تصفح العروض المتاحة وتقدّم بملفك المهني</p>
              <Link href="/jobs">
                <Button className="gap-2" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                  <Briefcase className="w-4 h-4" />
                  تصفح العروض
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {applications.map((app: any) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <Card className={`border ${colors[color] || colors.blue}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="w-6 h-6" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs opacity-70">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({ app }: { app: any }) {
  const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.sent;
  const StatusIcon = config.icon;
  const currentStep = STEPS.indexOf(app.status);
  const isRejected = app.status === "rejected";

  return (
    <Card className="bg-white hover:shadow-md transition-shadow border-slate-100">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* School Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="flex-1">
            {/* Job Title & School */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{app.job?.title || "عرض عمل"}</h3>
                <p className="text-sm text-slate-500">{app.school?.schoolName || "مدرسة شريكة"}</p>
              </div>
              <Badge className={`${config.bgColor} ${config.color} border gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </Badge>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-500">
              {app.job?.subject && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> {app.job.subject}
                </span>
              )}
              {app.job?.region && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {app.job.region}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString("ar-TN")}
              </span>
              {app.matchScore != null && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Star className="w-3 h-3" /> مطابقة {app.matchScore}%
                </span>
              )}
            </div>

            {/* Progress Steps */}
            {!isRejected && (
              <div className="flex items-center gap-1 mt-2">
                {STEPS.map((step, i) => {
                  const stepConfig = STATUS_CONFIG[step];
                  const isActive = i <= currentStep;
                  return (
                    <div key={step} className="flex items-center gap-1 flex-1">
                      <div className={`h-1.5 rounded-full flex-1 transition-all ${isActive ? "bg-blue-500" : "bg-slate-200"}`} />
                      {i === currentStep && (
                        <span className="text-[10px] text-blue-600 font-medium whitespace-nowrap">{stepConfig.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rejection message */}
            {isRejected && app.schoolNotes && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-600">{app.schoolNotes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
