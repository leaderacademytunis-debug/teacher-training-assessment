/**
 * Name Correction Manager - تصحيح أسماء المشاركين وإعادة إصدار الشهادات
 * Admin-only page for correcting participant names and regenerating certificates
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, ArrowRight, UserCog, FileText, History, AlertTriangle,
  CheckCircle2, RefreshCw, Award, ChevronLeft, Download, Eye,
  Loader2, PenLine, RotateCcw, Shield, Clock
} from "lucide-react";
import { useLocation } from "wouter";

export default function NameCorrectionManager() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("search");

  // Check admin access
  if (!user || !["admin", "trainer", "supervisor"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">غير مصرح</h2>
            <p className="text-slate-600">هذه الصفحة مخصصة للمسؤولين فقط</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <UserCog className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">تصحيح أسماء المشاركين</h1>
                <p className="text-sm text-slate-500">تعديل الأسماء وإعادة إصدار الشهادات</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin-control")}>
              <ChevronLeft className="h-4 w-4 ml-1" />
              لوحة التحكم
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              البحث والتصحيح
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              سجل التعديلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <SearchAndCorrectSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
            />
          </TabsContent>

          <TabsContent value="history">
            <EditHistorySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== SEARCH & CORRECT SECTION =====
function SearchAndCorrectSection({
  searchQuery,
  setSearchQuery,
  selectedUserId,
  setSelectedUserId,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
}) {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Simple debounce
    const timer = setTimeout(() => {
      if (value.trim().length >= 2) {
        setDebouncedQuery(value.trim());
      } else {
        setDebouncedQuery("");
      }
    }, 400);
    return () => clearTimeout(timer);
  };

  const searchResults = trpc.adminControl.searchUsersForCorrection.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-orange-500" />
            البحث عن مشارك
          </CardTitle>
          <CardDescription>
            ابحث بالاسم (عربي أو فرنسي) أو البريد الإلكتروني
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="اكتب اسم المشارك أو بريده الإلكتروني..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10 text-right"
            />
          </div>

          {/* Search Results */}
          {searchResults.isLoading && debouncedQuery && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="mr-2 text-slate-500">جاري البحث...</span>
            </div>
          )}

          {searchResults.data && searchResults.data.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-500 mb-2">
                تم العثور على {searchResults.data.length} نتيجة
              </p>
              {searchResults.data.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedUserId === u.id
                      ? "border-orange-500 bg-orange-50 shadow-sm"
                      : "border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">
                          {u.firstNameAr || ""} {u.lastNameAr || ""}
                        </span>
                        {(u.firstNameFr || u.lastNameFr) && (
                          <span className="text-sm text-slate-500" dir="ltr">
                            ({u.firstNameFr || ""} {u.lastNameFr || ""})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{u.email}</span>
                        {u.name && <span>({u.name})</span>}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchResults.data && searchResults.data.length === 0 && debouncedQuery && (
            <div className="text-center py-8 text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>لم يتم العثور على نتائج</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail & Correction Form */}
      {selectedUserId && (
        <UserCorrectionPanel
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

// ===== USER CORRECTION PANEL =====
function UserCorrectionPanel({
  userId,
  onClose,
}: {
  userId: number;
  onClose: () => void;
}) {
  const userDetails = trpc.adminControl.getUserForNameCorrection.useQuery({ userId });
  const correctName = trpc.adminControl.correctParticipantName.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      userDetails.refetch();
      setShowConfirmDialog(false);
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء التصحيح");
    },
  });

  const [firstNameAr, setFirstNameAr] = useState("");
  const [lastNameAr, setLastNameAr] = useState("");
  const [firstNameFr, setFirstNameFr] = useState("");
  const [lastNameFr, setLastNameFr] = useState("");
  const [reason, setReason] = useState("");
  const [regenerateCerts, setRegenerateCerts] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with current values
  if (userDetails.data && !initialized) {
    const u = userDetails.data.user;
    setFirstNameAr(u.firstNameAr || "");
    setLastNameAr(u.lastNameAr || "");
    setFirstNameFr(u.firstNameFr || "");
    setLastNameFr(u.lastNameFr || "");
    setInitialized(true);
  }

  const hasChanges = useMemo(() => {
    if (!userDetails.data) return false;
    const u = userDetails.data.user;
    return (
      firstNameAr !== (u.firstNameAr || "") ||
      lastNameAr !== (u.lastNameAr || "") ||
      firstNameFr !== (u.firstNameFr || "") ||
      lastNameFr !== (u.lastNameFr || "")
    );
  }, [firstNameAr, lastNameAr, firstNameFr, lastNameFr, userDetails.data]);

  const handleSubmit = () => {
    if (!hasChanges) {
      toast.error("لم يتم إجراء أي تغيير");
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmCorrection = () => {
    correctName.mutate({
      userId,
      firstNameAr: firstNameAr || undefined,
      lastNameAr: lastNameAr || undefined,
      firstNameFr: firstNameFr || undefined,
      lastNameFr: lastNameFr || undefined,
      reason: reason || undefined,
      regenerateCertificates: regenerateCerts,
    });
  };

  if (userDetails.isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-500">جاري تحميل بيانات المشارك...</p>
        </CardContent>
      </Card>
    );
  }

  if (!userDetails.data) return null;

  const { user: participant, certificates: certs, editHistory } = userDetails.data;

  return (
    <div className="space-y-6">
      {/* Current Info Card */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenLine className="h-5 w-5 text-orange-600" />
              تصحيح بيانات المشارك
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              إغلاق
            </Button>
          </div>
          <CardDescription>
            المشارك: <strong>{participant.firstNameAr} {participant.lastNameAr}</strong>
            {" - "}{participant.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Name Correction Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arabic Names */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                الاسم بالعربية
              </h3>
              <div>
                <Label htmlFor="firstNameAr">الاسم الأول</Label>
                <Input
                  id="firstNameAr"
                  value={firstNameAr}
                  onChange={(e) => setFirstNameAr(e.target.value)}
                  className="text-right mt-1"
                  dir="rtl"
                />
                {participant.firstNameAr && firstNameAr !== participant.firstNameAr && (
                  <p className="text-xs text-amber-600 mt-1">
                    القيمة السابقة: {participant.firstNameAr}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastNameAr">اللقب</Label>
                <Input
                  id="lastNameAr"
                  value={lastNameAr}
                  onChange={(e) => setLastNameAr(e.target.value)}
                  className="text-right mt-1"
                  dir="rtl"
                />
                {participant.lastNameAr && lastNameAr !== participant.lastNameAr && (
                  <p className="text-xs text-amber-600 mt-1">
                    القيمة السابقة: {participant.lastNameAr}
                  </p>
                )}
              </div>
            </div>

            {/* French Names */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                الاسم بالفرنسية
              </h3>
              <div>
                <Label htmlFor="firstNameFr">Prénom</Label>
                <Input
                  id="firstNameFr"
                  value={firstNameFr}
                  onChange={(e) => setFirstNameFr(e.target.value)}
                  className="text-left mt-1"
                  dir="ltr"
                />
                {participant.firstNameFr && firstNameFr !== participant.firstNameFr && (
                  <p className="text-xs text-amber-600 mt-1">
                    القيمة السابقة: {participant.firstNameFr}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastNameFr">Nom</Label>
                <Input
                  id="lastNameFr"
                  value={lastNameFr}
                  onChange={(e) => setLastNameFr(e.target.value)}
                  className="text-left mt-1"
                  dir="ltr"
                />
                {participant.lastNameFr && lastNameFr !== participant.lastNameFr && (
                  <p className="text-xs text-amber-600 mt-1">
                    القيمة السابقة: {participant.lastNameFr}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {hasChanges && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-slate-700 mb-2">معاينة الاسم الجديد:</p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-base py-1 px-3">
                  {firstNameAr} {lastNameAr}
                </Badge>
                {(firstNameFr || lastNameFr) && (
                  <Badge variant="outline" className="text-base py-1 px-3" dir="ltr">
                    {firstNameFr} {lastNameFr}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Reason */}
          <div>
            <Label htmlFor="reason">سبب التصحيح (اختياري)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: خطأ إملائي في الاسم الأول..."
              className="mt-1 text-right"
              rows={2}
            />
          </div>

          {/* Certificates Section */}
          {certs.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-slate-700">
                  الشهادات المصدرة ({certs.length})
                </h3>
              </div>
              <div className="space-y-2 mb-3">
                {certs.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div>
                        <span className="text-sm font-medium">{cert.courseTitleAr}</span>
                        <span className="text-xs text-slate-400 mr-2">
                          ({cert.certificateNumber})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cert.correctedName && (
                        <Badge variant="secondary" className="text-xs">
                          <RotateCcw className="h-3 w-3 ml-1" />
                          معاد إصداره
                        </Badge>
                      )}
                      {cert.pdfUrl && (
                        <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Checkbox
                  id="regenerate"
                  checked={regenerateCerts}
                  onCheckedChange={(checked) => setRegenerateCerts(checked === true)}
                />
                <Label htmlFor="regenerate" className="text-sm cursor-pointer">
                  إعادة إصدار جميع الشهادات بالاسم الجديد
                  <span className="text-xs text-amber-600 block">
                    سيتم الحفاظ على رقم الشهادة وتاريخ الإصدار الأصلي
                  </span>
                </Label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || correctName.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {correctName.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري التصحيح...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  حفظ التصحيح
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit History for this user */}
      {editHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              سجل التعديلات السابقة لهذا المشارك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {editHistory.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {new Date(h.createdAt).toLocaleDateString("ar-TN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {h.certificatesRegenerated && h.certificatesRegenerated > 0 && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <RefreshCw className="h-3 w-3 ml-1" />
                        {h.certificatesRegenerated} شهادة معاد إصدارها
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">قبل:</span>{" "}
                      <span className="text-red-600 line-through">
                        {h.previousFirstNameAr} {h.previousLastNameAr}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">بعد:</span>{" "}
                      <span className="text-green-600 font-medium">
                        {h.newFirstNameAr} {h.newLastNameAr}
                      </span>
                    </div>
                  </div>
                  {h.reason && (
                    <p className="text-xs text-slate-500 mt-1">السبب: {h.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              تأكيد تصحيح الاسم
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من تصحيح اسم المشارك؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">الاسم الحالي:</p>
              <p className="text-red-600">
                {participant.firstNameAr} {participant.lastNameAr}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">الاسم الجديد:</p>
              <p className="text-green-600 font-semibold">
                {firstNameAr} {lastNameAr}
              </p>
            </div>
            {regenerateCerts && certs.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">
                  <RefreshCw className="h-4 w-4 inline ml-1" />
                  سيتم إعادة إصدار {certs.length} شهادة بالاسم الجديد
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={confirmCorrection}
              disabled={correctName.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {correctName.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري المعالجة...
                </>
              ) : (
                "تأكيد التصحيح"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== EDIT HISTORY SECTION =====
function EditHistorySection() {
  const history = trpc.adminControl.getNameEditHistory.useQuery({ limit: 50 });

  if (history.isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-500">جاري تحميل السجل...</p>
        </CardContent>
      </Card>
    );
  }

  if (!history.data || history.data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">لا توجد تعديلات سابقة</h3>
          <p className="text-slate-500">سيظهر هنا سجل جميع تصحيحات الأسماء</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-500" />
          سجل التعديلات
        </CardTitle>
        <CardDescription>
          جميع تصحيحات الأسماء التي تمت على المنصة ({history.data.length} تعديل)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.data.map((h) => (
            <div key={h.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <PenLine className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">{h.participantName}</span>
                    <span className="text-xs text-slate-400 mr-2">{h.participantEmail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {h.certificatesRegenerated && h.certificatesRegenerated > 0 && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <RefreshCw className="h-3 w-3 ml-1" />
                      {h.certificatesRegenerated} شهادة
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(h.createdAt).toLocaleDateString("ar-TN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <span className="text-xs text-red-500 block mb-1">قبل التصحيح</span>
                  <span className="text-sm text-red-700 line-through">
                    {h.previousFirstNameAr} {h.previousLastNameAr}
                  </span>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-100">
                  <span className="text-xs text-green-500 block mb-1">بعد التصحيح</span>
                  <span className="text-sm text-green-700 font-medium">
                    {h.newFirstNameAr} {h.newLastNameAr}
                  </span>
                </div>
              </div>

              {h.reason && (
                <p className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded">
                  <strong>السبب:</strong> {h.reason}
                </p>
              )}

              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <Shield className="h-3 w-3" />
                <span>بواسطة: {h.editorName}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
