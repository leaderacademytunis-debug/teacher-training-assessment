import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lock, Sparkles, Crown, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type ServiceKey = "accessEdugpt" | "accessCourseAi" | "accessCoursePedagogy" | "accessFullBundle";

interface LockedFeatureProps {
  requiredService: ServiceKey;
  children: React.ReactNode;
  featureName?: string;
}

const SERVICE_NAMES: Record<ServiceKey, string> = {
  accessEdugpt: "EDUGPT PRO",
  accessCourseAi: "دورة الذكاء الاصطناعي",
  accessCoursePedagogy: "دورة البيداغوجيا",
  accessFullBundle: "الباقة الكاملة",
};

const SERVICE_REQUEST_MAP: Record<ServiceKey, string> = {
  accessEdugpt: "edugpt_pro",
  accessCourseAi: "course_ai",
  accessCoursePedagogy: "course_pedagogy",
  accessFullBundle: "full_bundle",
};

export function LockedFeature({ requiredService, children, featureName }: LockedFeatureProps) {
  const { user } = useAuth();
  const { data: permissions, isLoading } = trpc.adminDashboard.getMyPermissions.useQuery(
    undefined,
    { enabled: !!user }
  );

  // If loading, show children (optimistic)
  if (isLoading || !user) return <>{children}</>;

  // Admin users always have full access
  if (user?.role === 'admin') return <>{children}</>;

  // Check if user has access
  const hasAccess = permissions?.[requiredService] || permissions?.accessFullBundle;

  if (hasAccess) return <>{children}</>;

  // Show locked state
  return (
    <LockedState
      serviceName={SERVICE_NAMES[requiredService]}
      serviceKey={requiredService}
      featureName={featureName}
    />
  );
}

function LockedState({ serviceName, serviceKey, featureName }: {
  serviceName: string;
  serviceKey: ServiceKey;
  featureName?: string;
}) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <Card className="border-dashed border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-8 text-center" dir="rtl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">
            {featureName || "هذه الميزة"} مقفلة
          </h3>
          <p className="text-muted-foreground mb-4">
            للوصول إلى هذه الميزة، تحتاج إلى الاشتراك في <strong>{serviceName}</strong>
          </p>
          <Button
            onClick={() => setShowUpgrade(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
          >
            <Crown className="h-4 w-4" />
            ترقية إلى {serviceName}
          </Button>
        </CardContent>
      </Card>

      <UpgradeDialog
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        serviceName={serviceName}
        serviceKey={serviceKey}
      />
    </>
  );
}

function UpgradeDialog({ open, onClose, serviceName, serviceKey }: {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  serviceKey: ServiceKey;
}) {
  const [receiptUrl, setReceiptUrl] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitPayment = trpc.adminDashboard.submitPaymentRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم إرسال طلب الدفع بنجاح!");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/trpc/edugpt.uploadFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileData: await fileToBase64(file),
        }),
      });
      // Use a simpler approach - just create a data URL for now
      const dataUrl = await fileToBase64(file);
      setReceiptUrl(dataUrl);
      toast.success("تم رفع الإيصال");
    } catch {
      toast.error("فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent dir="rtl" className="text-center">
          <div className="py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">تم إرسال طلبك بنجاح!</h3>
            <p className="text-muted-foreground">
              سيتم مراجعة طلبك وتفعيل خدمتك في أقرب وقت.
              ستتلقى إشعاراً عند التفعيل.
            </p>
            <Button className="mt-4" onClick={onClose}>حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            ترقية إلى {serviceName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-800 mb-1">طريقة الدفع:</p>
            <p className="text-blue-700">
              1. قم بالتحويل البنكي أو الدفع عبر D17/Flouci<br/>
              2. ارفع صورة إيصال الدفع<br/>
              3. سيتم تفعيل حسابك خلال 24 ساعة
            </p>
          </div>

          <div className="space-y-2">
            <Label>طريقة الدفع</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                <SelectItem value="d17">D17</SelectItem>
                <SelectItem value="flouci">Flouci</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المبلغ المدفوع (اختياري)</Label>
            <Input
              placeholder="مثال: 50 TND"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>صورة إيصال الدفع *</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {receiptUrl ? (
                <div className="space-y-2">
                  <img src={receiptUrl} alt="إيصال" className="max-h-32 mx-auto rounded" />
                  <Button variant="outline" size="sm" onClick={() => setReceiptUrl("")}>
                    تغيير الصورة
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "جارٍ الرفع..." : "اضغط لرفع صورة الإيصال"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظة (اختياري)</Label>
            <Textarea
              placeholder="أي ملاحظة إضافية..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => submitPayment.mutate({
              requestedService: SERVICE_REQUEST_MAP[serviceKey] as any,
              receiptImageUrl: receiptUrl || "pending_upload",
              amount: amount || undefined,
              paymentMethod: paymentMethod || undefined,
              userNote: note || undefined,
            })}
            disabled={submitPayment.isPending || !receiptUrl}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 w-full"
          >
            {submitPayment.isPending ? "جارٍ الإرسال..." : "إرسال طلب الترقية"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check permissions easily
export function usePermissions() {
  const { user } = useAuth();
  const { data: permissions, isLoading } = trpc.adminDashboard.getMyPermissions.useQuery(
    undefined,
    { enabled: !!user }
  );

  return {
    isLoading,
    permissions,
    hasEdugpt: permissions?.accessEdugpt || permissions?.accessFullBundle || false,
    hasCourseAi: permissions?.accessCourseAi || permissions?.accessFullBundle || false,
    hasCoursePedagogy: permissions?.accessCoursePedagogy || permissions?.accessFullBundle || false,
    hasFullBundle: permissions?.accessFullBundle || false,
    tier: permissions?.tier || "free",
    isAdmin: user?.role === "admin",
  };
}
