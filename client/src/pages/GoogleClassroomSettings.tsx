import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Link2, Unlink, ArrowLeft, BookOpen, GraduationCap, Clock, AlertTriangle, ChevronRight, Wifi, WifiOff } from "lucide-react";

export default function GoogleClassroomSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Get connection status
  const connectionQuery = trpc.googleClassroom.getConnection.useQuery(undefined, {
    enabled: !!user && isAdmin,
  });

  // Get batches for mapping
  const batchesQuery = trpc.batchManager.list.useQuery(undefined, {
    enabled: !!user && isAdmin,
  });

  // Mutations
  const getAuthUrl = trpc.googleClassroom.getAuthUrl.useMutation();
  const handleCallback = trpc.googleClassroom.handleCallback.useMutation();
  const disconnect = trpc.googleClassroom.disconnect.useMutation();

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const code = params.get("code");
    if (code && user && isAdmin) {
      handleCallback.mutate(
        { code, redirectUri: `${window.location.origin}/admin/google-classroom` },
        {
          onSuccess: (data) => {
            toast.success(`تم الربط بنجاح مع ${data.email}`);
            connectionQuery.refetch();
            // Clean URL
            setLocation("/admin/google-classroom", { replace: true });
          },
          onError: (err) => {
            toast.error(`فشل الربط: ${err.message}`);
            setLocation("/admin/google-classroom", { replace: true });
          },
        }
      );
    }
  }, [searchString, user]);

  // Connect to Google
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await getAuthUrl.mutateAsync({
        redirectUri: `${window.location.origin}/admin/google-classroom`,
      });
      window.location.href = result.url;
    } catch (err: any) {
      toast.error(err.message || "فشل في إنشاء رابط الربط");
      setIsConnecting(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync();
      toast.success("تم فصل الحساب بنجاح");
      connectionQuery.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
            <p className="text-muted-foreground">هذه الصفحة متاحة فقط للمسؤولين</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connection = connectionQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/batches">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 ml-1" />
                العودة لإدارة الدفعات
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ربط Google Classroom</h1>
                <p className="text-xs text-muted-foreground">مزامنة الواجبات والدرجات تلقائياً</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl mx-auto space-y-6">
        {/* Connection Status Card */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 ${connection ? "bg-gradient-to-l from-green-400 to-emerald-500" : "bg-gradient-to-l from-amber-400 to-orange-500"}`} />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {connection ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-amber-600" />
                  )}
                  حالة الاتصال
                </CardTitle>
                <CardDescription>
                  {connection
                    ? `متصل بحساب Google: ${connection.googleEmail}`
                    : "لم يتم ربط حساب Google Classroom بعد"}
                </CardDescription>
              </div>
              <Badge variant={connection ? "default" : "secondary"} className={connection ? "bg-green-100 text-green-800" : ""}>
                {connection ? "متصل" : "غير متصل"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {connection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                    <p className="font-medium text-sm">{connection.googleEmail}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">تاريخ الربط</p>
                    <p className="font-medium text-sm">{new Date(connection.createdAt).toLocaleDateString("ar-TN")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleConnect} disabled={isConnecting}>
                    <RefreshCw className={`w-4 h-4 ml-1 ${isConnecting ? "animate-spin" : ""}`} />
                    إعادة الربط
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDisconnect} disabled={disconnect.isPending}>
                    <Unlink className="w-4 h-4 ml-1" />
                    فصل الحساب
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">كيفية الربط:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>اضغط على زر "ربط حساب Google" أدناه</li>
                    <li>سجل الدخول بحساب Google المرتبط بـ Google Classroom</li>
                    <li>وافق على الأذونات المطلوبة</li>
                    <li>سيتم إعادة توجيهك تلقائياً</li>
                  </ol>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-900 text-sm">متطلبات مسبقة:</h4>
                      <p className="text-xs text-amber-800 mt-1">
                        يجب أن يكون لديك مشروع Google Cloud Console مع تفعيل Classroom API وبيانات OAuth2 (Client ID و Client Secret). تواصل مع المسؤول التقني لإعداد هذا.
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={handleConnect} disabled={isConnecting} className="bg-gradient-to-l from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4 ml-2" />
                  )}
                  ربط حساب Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Mappings */}
        {connection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                ربط الدفعات بالفصول الدراسية
              </CardTitle>
              <CardDescription>
                اربط كل دفعة بفصل Google Classroom لمزامنة الواجبات والدرجات تلقائياً
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batchesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : batchesQuery.data && batchesQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {batchesQuery.data.map((batch: any) => (
                    <BatchMappingCard
                      key={batch.id}
                      batch={batch}
                      connectionId={connection.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>لا توجد دفعات بعد. أنشئ دفعة أولاً من إدارة الدفعات.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sync Logs */}
        {connection && (
          <SyncLogsCard connectionId={connection.id} />
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>كيف تعمل المزامنة؟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: "📝", title: "إنشاء الواجب", desc: "أنشئ واجباً في Leader Academy وسيتم نشره تلقائياً في Google Classroom" },
                { icon: "🤖", title: "التقييم الآلي", desc: "يقيّم الذكاء الاصطناعي التسليمات وفق المعايير التونسية ويمنح درجة الإتقان" },
                { icon: "📊", title: "مزامنة الدرجات", desc: "تُرسل الدرجات تلقائياً إلى Google Classroom وتُعاد للطلاب" },
              ].map((step, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Batch Mapping Card Component
function BatchMappingCard({ batch, connectionId }: { batch: any; connectionId: number }) {
  const [showCourses, setShowCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null);

  const mappingsQuery = trpc.googleClassroom.getBatchMappings.useQuery(
    { batchId: batch.id },
    { enabled: true }
  );

  const coursesQuery = trpc.googleClassroom.listCourses.useQuery(
    { connectionId },
    { enabled: showCourses }
  );

  const mapBatch = trpc.googleClassroom.mapBatchToCourse.useMutation();
  const removeMapping = trpc.googleClassroom.removeBatchMapping.useMutation();

  const handleMap = async (courseId: string, courseName: string) => {
    try {
      await mapBatch.mutateAsync({
        batchId: batch.id,
        connectionId,
        googleCourseId: courseId,
        googleCourseName: courseName,
      });
      toast.success(`تم ربط "${batch.name}" بـ "${courseName}"`);
      mappingsQuery.refetch();
      setShowCourses(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (mappingId: number) => {
    try {
      await removeMapping.mutateAsync({ mappingId });
      toast.success("تم إلغاء الربط");
      mappingsQuery.refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const mappings = mappingsQuery.data || [];

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: batch.color || "#3b82f6" }} />
          <span className="font-semibold">{batch.name}</span>
          <Badge variant="secondary" className="text-xs">{batch.tag}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCourses(!showCourses)}>
          <Link2 className="w-3.5 h-3.5 ml-1" />
          {showCourses ? "إلغاء" : "ربط بفصل"}
        </Button>
      </div>

      {/* Existing mappings */}
      {mappings.length > 0 && (
        <div className="space-y-2 mb-3">
          {mappings.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between bg-green-50 rounded-md p-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{m.googleCourseName || m.googleCourseId}</span>
                {m.lastSyncAt && (
                  <span className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline ml-1" />
                    آخر مزامنة: {new Date(m.lastSyncAt).toLocaleDateString("ar-TN")}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 h-7"
                onClick={() => handleRemove(m.id)}
                disabled={removeMapping.isPending}
              >
                <XCircle className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Course selection */}
      {showCourses && (
        <div className="border-t pt-3 mt-3">
          {coursesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري تحميل الفصول من Google Classroom...
            </div>
          ) : coursesQuery.data && coursesQuery.data.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {coursesQuery.data.map((course: any) => (
                <button
                  key={course.id}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/50 text-sm transition-colors"
                  onClick={() => handleMap(course.id, course.name)}
                  disabled={mapBatch.isPending}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>{course.name}</span>
                    {course.section && <span className="text-xs text-muted-foreground">({course.section})</span>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              لا توجد فصول نشطة في Google Classroom. تأكد من إنشاء فصل أولاً.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Sync Logs Card
function SyncLogsCard({ connectionId }: { connectionId: number }) {
  const logsQuery = trpc.googleClassroom.getSyncLogs.useQuery(
    { connectionId, limit: 10 },
    { enabled: true }
  );

  const logs = logsQuery.data || [];

  const actionLabels: Record<string, string> = {
    push_assignment: "نشر واجب",
    sync_grades: "مزامنة درجات",
    pull_roster: "جلب قائمة الطلاب",
    full_sync: "مزامنة كاملة",
  };

  const statusColors: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          سجل المزامنة
        </CardTitle>
        <CardDescription>آخر عمليات المزامنة مع Google Classroom</CardDescription>
      </CardHeader>
      <CardContent>
        {logsQuery.isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[log.status] || ""} variant="secondary">
                    {log.status === "success" ? "نجح" : log.status === "failed" ? "فشل" : "قيد التنفيذ"}
                  </Badge>
                  <span>{actionLabels[log.action] || log.action}</span>
                  {log.itemsProcessed > 0 && (
                    <span className="text-muted-foreground">({log.itemsProcessed} عنصر)</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("ar-TN")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">لا توجد عمليات مزامنة بعد</p>
        )}
      </CardContent>
    </Card>
  );
}
