import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function EnrollmentApprovals() {
  const { data: pendingEnrollments, refetch } = trpc.enrollmentApproval.listPending.useQuery();

  const approve = trpc.enrollmentApproval.approve.useMutation({
    onSuccess: () => {
      toast.success("تمت الموافقة على الطلب");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const reject = trpc.enrollmentApproval.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض الطلب");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">طلبات التسجيل المعلقة</h2>
        <p className="text-gray-600">راجع وافق على طلبات التسجيل في الدورات</p>
      </div>

      {pendingEnrollments && pendingEnrollments.length > 0 ? (
        <div className="grid gap-4">
          {pendingEnrollments.map((item) => (
            <Card key={item.enrollment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.user?.name || "مستخدم"}</CardTitle>
                    <CardDescription>
                      {item.user?.email}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    قيد الانتظار
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">الدورة المطلوبة:</p>
                    <p className="font-semibold">{item.course?.titleAr}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الطلب:</p>
                    <p>{new Date(item.enrollment.enrolledAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => approve.mutate({ enrollmentId: item.enrollment.id })}
                      disabled={approve.isPending || reject.isPending}
                      className="flex-1"
                    >
                      {approve.isPending ? (
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 ms-2" />
                      )}
                      الموافقة
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من رفض هذا الطلب؟")) {
                          reject.mutate({ enrollmentId: item.enrollment.id });
                        }
                      }}
                      disabled={approve.isPending || reject.isPending}
                      className="flex-1"
                    >
                      {reject.isPending ? (
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 ms-2" />
                      )}
                      رفض
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد طلبات معلقة
            </h3>
            <p className="text-gray-600">
              جميع طلبات التسجيل تمت معالجتها
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
