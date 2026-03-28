import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, CheckCircle2, XCircle, Clock, Briefcase, Shield, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import useI18n from "@/i18n";


export default function AdminPartners() {
  const { t, lang, isRTL, dir } = useI18n();
  const [activeTab, setActiveTab] = useState("pending");
  const stats = trpc.adminPartners.getStats.useQuery();
  const pendingSchools = trpc.adminPartners.listPendingSchools.useQuery();
  const allSchools = trpc.adminPartners.listAllSchools.useQuery();
  const jobPostings = trpc.adminPartners.listJobPostings.useQuery();
  const utils = trpc.useUtils();

  const approveMutation = trpc.adminPartners.approveSchool.useMutation({
    onSuccess: () => {
      toast.success("تم اعتماد المدرسة بنجاح");
      utils.adminPartners.invalidate();
    },
    onError: () => toast.error("حدث خطأ أثناء اعتماد المدرسة"),
  });

  const rejectMutation = trpc.adminPartners.rejectSchool.useMutation({
    onSuccess: () => {
      toast.success("تم رفض طلب المدرسة");
      utils.adminPartners.invalidate();
    },
    onError: () => toast.error("حدث خطأ أثناء رفض الطلب"),
  });

  const toggleJobMutation = trpc.adminPartners.toggleJobActive.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة العرض");
      utils.adminPartners.invalidate();
    },
  });

  const statusBadge = (isVerified: boolean) => {
    if (isVerified) return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 ms-1" />معتمدة</Badge>;
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 ms-1" />قيد المراجعة</Badge>;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              لوحة اعتماد المدارس الشريكة
            </h1>
            <p className="text-slate-500 mt-1">إدارة طلبات التسجيل ومراقبة عروض العمل</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              لوحة الإدارة
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white border-blue-100">
            <CardContent className="p-4 text-center">
              <Building2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{stats.data?.totalSchools || 0}</p>
              <p className="text-xs text-slate-500">إجمالي المدارس</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-amber-100">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-700">{stats.data?.pendingSchools || 0}</p>
              <p className="text-xs text-slate-500">قيد المراجعة</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-emerald-100">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{stats.data?.approvedSchools || 0}</p>
              <p className="text-xs text-slate-500">معتمدة</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-purple-100">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{stats.data?.totalJobs || 0}</p>
              <p className="text-xs text-slate-500">إجمالي العروض</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-teal-100">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-teal-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-teal-700">{stats.data?.activeJobs || 0}</p>
              <p className="text-xs text-slate-500">عروض نشطة</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border w-full md:w-auto">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              طلبات معلقة ({pendingSchools.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Building2 className="w-4 h-4" />
              جميع المدارس
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="w-4 h-4" />
              عروض العمل
            </TabsTrigger>
          </TabsList>

          {/* Pending Schools */}
          <TabsContent value="pending" className="space-y-4">
            {pendingSchools.data?.length === 0 && (
              <Card className="bg-white">
                <CardContent className="p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                  <p className="text-lg">لا توجد طلبات معلقة حالياً</p>
                </CardContent>
              </Card>
            )}
            {pendingSchools.data?.map((school: any) => (
              <Card key={school.id} className="bg-white border-amber-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-slate-800">{school.schoolName}</h3>
                        {statusBadge(school.isVerified)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                        <span>النوع: {school.schoolType === 'private' ? 'خاصة' : school.schoolType === 'public' ? 'عمومية' : school.schoolType === 'international' ? 'دولية' : 'أخرى'}</span>
                        <span>المنطقة: {school.region || '-'}</span>
                        <span>المسؤول: {school.contactPersonName || '-'}</span>
                        <span>الهاتف: {school.phone || '-'}</span>
                      </div>
                      {school.address && <p className="text-sm text-slate-500 mt-1">{school.address}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveMutation.mutate({ schoolId: school.id })}
                        disabled={approveMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        اعتماد
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectMutation.mutate({ schoolId: school.id })}
                        disabled={rejectMutation.isPending}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* All Schools */}
          <TabsContent value="all" className="space-y-4">
            {allSchools.data?.map((school: any) => (
              <Card key={school.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-slate-800">{school.schoolName}</h3>
                        {statusBadge(school.isVerified)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                        <span>النوع: {school.schoolType === 'private' ? 'خاصة' : school.schoolType === 'public' ? 'عمومية' : school.schoolType === 'international' ? 'دولية' : 'أخرى'}</span>
                        <span>المنطقة: {school.region || '-'}</span>
                        <span>البريد: {school.email || '-'}</span>
                        <span>تاريخ التسجيل: {new Date(school.createdAt).toLocaleDateString('ar-TN')}</span>
                      </div>
                    </div>
                    {!school.isVerified && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveMutation.mutate({ schoolId: school.id })} className="bg-emerald-600 hover:bg-emerald-700">اعتماد</Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate({ schoolId: school.id })}>رفض</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Job Postings */}
          <TabsContent value="jobs" className="space-y-4">
            {jobPostings.data?.length === 0 && (
              <Card className="bg-white">
                <CardContent className="p-8 text-center text-slate-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg">لا توجد عروض عمل حالياً</p>
                </CardContent>
              </Card>
            )}
            {jobPostings.data?.map((job: any) => (
              <Card key={job.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-blue-600">{job.subject}</Badge>
                        <Badge variant="outline" className="text-purple-600">{job.region}</Badge>
                        {job.grade && <Badge variant="outline" className="text-teal-600">{job.grade}</Badge>}
                        <Badge variant="outline" className={job.isActive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}>
                          {job.isActive ? "نشط" : "معطل"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">المدرسة: {job.school?.schoolName || '-'}</p>
                      {job.matchedTeacherIds && job.matchedTeacherIds.length > 0 && (
                        <p className="text-sm text-amber-600 mt-1">مطابقات ذكية: {job.matchedTeacherIds.length} معلم</p>
                      )}
                    </div>
                    <Button
                      variant={job.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleJobMutation.mutate({ jobId: job.id, isActive: !job.isActive })}
                    >
                      {job.isActive ? "تعطيل" : "تفعيل"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
