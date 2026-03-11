import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Users, LogIn, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function JoinBatch() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams<{ code: string }>();
  const [, navigate] = useLocation();
  const inviteCode = params.code || "";
  const [joined, setJoined] = useState(false);

  // Get batch info by invite code
  const batchInfoQuery = trpc.batchManager.getBatchByInviteCode.useQuery(
    { inviteCode },
    { enabled: !!inviteCode, retry: false }
  );

  // Join mutation
  const joinMutation = trpc.batchManager.joinByInvite.useMutation({
    onSuccess: (data) => {
      setJoined(true);
      if (data.alreadyMember) {
        toast.info("أنت عضو بالفعل في هذه الدفعة");
      } else {
        toast.success(`تم الانضمام إلى ${data.batchName} بنجاح!`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "فشل في الانضمام");
    },
  });

  const handleJoin = () => {
    if (!user) return;
    joinMutation.mutate({ inviteCode });
  };

  // Auto-join if user is logged in and batch is valid
  useEffect(() => {
    if (user && batchInfoQuery.data && !joined && !joinMutation.isPending) {
      handleJoin();
    }
  }, [user, batchInfoQuery.data]);

  // Loading state
  if (authLoading || batchInfoQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">جاري التحقق من رابط الدعوة...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid invite code
  if (batchInfoQuery.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white" dir="rtl">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">رابط غير صالح</h2>
            <p className="text-gray-500 text-center mb-6">
              رابط الدعوة غير صالح أو منتهي الصلاحية. يرجى التواصل مع المدرب للحصول على رابط جديد.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const batch = batchInfoQuery.data;

  // Not logged in - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: batch?.color || "#3B82F6" }}>
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">{batch?.name}</CardTitle>
            {batch?.description && <CardDescription>{batch.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800 mb-3">
                لقد تمت دعوتك للانضمام إلى هذه الدفعة. يرجى تسجيل الدخول أولاً للمتابعة.
              </p>
              <a href={getLoginUrl(`/join/${inviteCode}`)}>
                <Button className="w-full">
                  <LogIn className="h-4 w-4 ml-2" />
                  تسجيل الدخول للانضمام
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Successfully joined
  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white" dir="rtl">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {joinMutation.data?.alreadyMember ? "أنت عضو بالفعل" : "تم الانضمام بنجاح!"}
            </h2>
            <p className="text-gray-500 text-center mb-6">
              {joinMutation.data?.alreadyMember
                ? `أنت عضو بالفعل في دفعة "${joinMutation.data.batchName}"`
                : `مرحباً بك في دفعة "${joinMutation.data?.batchName}". يمكنك الآن الوصول إلى الواجبات والأدوات المتاحة.`
              }
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/")} variant="outline">
                الرئيسية
              </Button>
              <Button onClick={() => navigate("/my-assignments")}>
                <ArrowRight className="h-4 w-4 ml-1" />
                واجباتي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Joining in progress
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">جاري الانضمام إلى الدفعة...</p>
        </CardContent>
      </Card>
    </div>
  );
}
