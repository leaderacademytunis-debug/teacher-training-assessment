import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import {
  UserCheck, UserX, Clock, Mail, Phone, Building2, Briefcase,
  MessageSquare, CheckCircle2, XCircle, Loader2, ArrowRight,
  Shield, Eye, EyeOff, Inbox, Send,
} from "lucide-react";
import useI18n from "@/i18n";


const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "في الانتظار", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "تمت الموافقة", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

function ResponseDialog({ requestId, requesterName, onSuccess }: {
  requestId: number; requesterName: string; onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [response, setResponse] = useState("");
  const utils = trpc.useUtils();

  const respondMutation = trpc.careerHub.respondToRequest.useMutation({
    onSuccess: () => {
      toast.success(action === "approved" ? "تمت الموافقة على الطلب" : "تم رفض الطلب");
      utils.careerHub.getMyConnectionRequests.invalidate();
      setOpen(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!action) return;
    respondMutation.mutate({ requestId, action, response: response || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ArrowRight className="w-3.5 h-3.5" />
          الرد على الطلب
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            الرد على طلب {requesterName}
          </DialogTitle>
          <DialogDescription>
            اختر قبول أو رفض طلب التواصل. عند القبول، سيتم الكشف عن معلومات الاتصال.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={action === "approved" ? "default" : "outline"}
              className={`gap-2 ${action === "approved" ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={() => setAction("approved")}
            >
              <UserCheck className="w-4 h-4" />
              قبول
            </Button>
            <Button
              variant={action === "rejected" ? "default" : "outline"}
              className={`gap-2 ${action === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={() => setAction("rejected")}
            >
              <UserX className="w-4 h-4" />
              رفض
            </Button>
          </div>
          {action === "approved" && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <Eye className="w-4 h-4 shrink-0" />
              <span>عند القبول، سيتمكن مقدم الطلب من رؤية معلومات الاتصال الخاصة بك</span>
            </div>
          )}
          {action === "rejected" && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>ستبقى معلومات الاتصال الخاصة بك محمية</span>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">رسالة الرد (اختياري)</label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={action === "approved" ? "شكراً لاهتمامكم، يسعدني التواصل معكم..." : "شكراً لاهتمامكم، لكن لا أبحث عن فرص حالياً..."}
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!action || respondMutation.isPending}
            className={`w-full gap-2 ${action === "approved" ? "bg-green-600 hover:bg-green-700" : action === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}`}
          >
            {respondMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            تأكيد الرد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ConnectionRequests() {
  const { t, lang, isRTL, dir } = useI18n();
  const { data: requests, isLoading } = trpc.careerHub.getMyConnectionRequests.useQuery();

  const pendingCount = requests?.filter((r: any) => r.status === "pending").length || 0;
  const approvedCount = requests?.filter((r: any) => r.status === "approved").length || 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-600" />
            طلبات التوظيف
          </h1>
          <p className="text-gray-500 mt-1">إدارة طلبات التواصل من المؤسسات التعليمية</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">{pendingCount} في الانتظار</Badge>
          )}
          <Badge className="bg-green-100 text-green-700 border-green-200">{approvedCount} موافق عليها</Badge>
        </div>
      </div>

      {/* Privacy Shield Notice */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-700 text-sm">درع الخصوصية نشط</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              معلومات الاتصال الشخصية (الهاتف، البريد) مخفية تلقائياً. يتم الكشف عنها فقط عند الموافقة على طلب التواصل.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-600">لا توجد طلبات حالياً</h3>
            <p className="text-gray-400 mt-2">عندما يتواصل معك مسؤول توظيف عبر ملفك المهني العام، ستظهر الطلبات هنا.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => {
            const config = statusConfig[req.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={req.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Requester Info */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-gray-900">{req.requesterName}</h3>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="w-3 h-3 ms-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{req.requesterEmail}</span>
                        </div>
                        {req.requesterPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{req.requesterPhone}</span>
                          </div>
                        )}
                        {req.requesterOrganization && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>{req.requesterOrganization}</span>
                          </div>
                        )}
                        {req.requesterRole && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                            <span>{req.requesterRole}</span>
                          </div>
                        )}
                      </div>
                      {/* Message */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{req.message}</p>
                      </div>
                      {/* Teacher Response */}
                      {req.teacherResponse && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                          <p className="text-xs font-medium text-amber-700 mb-1">ردك:</p>
                          <p className="text-sm text-amber-800">{req.teacherResponse}</p>
                        </div>
                      )}
                      {/* Date */}
                      <p className="text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString("ar-TN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    {/* Actions */}
                    {req.status === "pending" && (
                      <ResponseDialog requestId={req.id} requesterName={req.requesterName} onSuccess={() => {}} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
