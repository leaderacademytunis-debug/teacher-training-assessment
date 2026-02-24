import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, CheckCircle, XCircle, Eye, Filter, 
  User, Phone, Mail, CreditCard, FileText, Download 
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type FilterType = "all" | "pending" | "approved" | "rejected";

export default function RegistrationsManagement() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  const { data: registrations, isLoading, refetch } = trpc.registrations.list.useQuery(
    { filter },
    { enabled: !!user && ["admin", "trainer", "supervisor"].includes(user.role) }
  );

  const approveMutation = trpc.registrations.approve.useMutation({
    onSuccess: () => {
      toast.success("تم قبول التسجيل بنجاح!");
      refetch();
      setShowDetailsDialog(false);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const rejectMutation = trpc.registrations.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض التسجيل");
      refetch();
      setShowDetailsDialog(false);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const exportMutation = trpc.registrations.exportToExcel.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("تم تصدير البيانات بنجاح!");
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء التصدير: " + error.message);
    },
  });

  const handleExport = () => {
    exportMutation.mutate({ filter });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !["admin", "trainer", "supervisor"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>ليس لديك صلاحية للوصول إلى هذه الصفحة</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">قيد الانتظار</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">مقبول</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (userId: number) => {
    if (confirm("هل أنت متأكد من قبول هذا التسجيل؟")) {
      approveMutation.mutate({ userId });
    }
  };

  const handleReject = (userId: number) => {
    const reason = prompt("يرجى إدخال سبب الرفض (اختياري):");
    if (reason !== null) {
      rejectMutation.mutate({ userId, reason: reason || undefined });
    }
  };

  const handleViewDetails = (registration: any) => {
    setSelectedUser(registration);
    setShowDetailsDialog(true);
  };

  const handleViewReceipt = (registration: any) => {
    setSelectedUser(registration);
    setShowReceiptDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة التسجيلات</h1>
              <p className="text-gray-600 mt-1">مراجعة وإدارة طلبات التسجيل الجديدة</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container py-8">
        {/* Filter Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">تصفية حسب الحالة:</span>
              <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500 mr-auto">
                {registrations?.length || 0} تسجيل
              </span>
              <Button
                onClick={handleExport}
                disabled={exportMutation.isPending || !registrations || registrations.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {exportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 ml-2" />
                )}
                تصدير إلى Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة التسجيلات</CardTitle>
            <CardDescription>جميع طلبات التسجيل مع البيانات الكاملة</CardDescription>
          </CardHeader>
          <CardContent>
            {registrations && registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">الاسم بالعربية</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">الاسم بالفرنسية</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">رقم الهاتف</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">الحالة</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
                      <th className="text-center p-3 text-sm font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">
                          {registration.firstNameAr} {registration.lastNameAr}
                        </td>
                        <td className="p-3 text-sm" dir="ltr">
                          {registration.firstNameFr} {registration.lastNameFr}
                        </td>
                        <td className="p-3 text-sm" dir="ltr">{registration.email}</td>
                        <td className="p-3 text-sm" dir="ltr">{registration.phone}</td>
                        <td className="p-3">{getStatusBadge(registration.registrationStatus)}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(registration.createdAt).toLocaleDateString('ar-TN')}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(registration)}
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              التفاصيل
                            </Button>
                            {registration.registrationStatus === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(registration.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 ml-1" />
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(registration.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 ml-1" />
                                  رفض
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">لا توجد تسجيلات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل التسجيل</DialogTitle>
            <DialogDescription>جميع بيانات المشارك</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">الاسم بالعربية:</span>
                  </div>
                  <p className="text-base">{selectedUser.firstNameAr} {selectedUser.lastNameAr}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">الاسم بالفرنسية:</span>
                  </div>
                  <p className="text-base" dir="ltr">{selectedUser.firstNameFr} {selectedUser.lastNameFr}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">البريد الإلكتروني:</span>
                  </div>
                  <p className="text-base" dir="ltr">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">رقم الهاتف:</span>
                  </div>
                  <p className="text-base" dir="ltr">{selectedUser.phone}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">رقم بطاقة التعريف:</span>
                  </div>
                  <p className="text-base" dir="ltr">{selectedUser.idCardNumber}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">الحالة:</span>
                  </div>
                  {getStatusBadge(selectedUser.registrationStatus)}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewReceipt(selectedUser)}
                >
                  <Eye className="w-4 h-4 ml-2" />
                  عرض وصل الخلاص
                </Button>
              </div>

              {selectedUser.registrationStatus === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedUser.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 ml-2" />
                    )}
                    قبول التسجيل
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleReject(selectedUser.id)}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-2" />
                    )}
                    رفض التسجيل
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>وصل الخلاص</DialogTitle>
            <DialogDescription>
              {selectedUser?.firstNameAr} {selectedUser?.lastNameAr}
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.paymentReceiptUrl && (
            <div className="overflow-auto">
              {selectedUser.paymentReceiptUrl.endsWith('.pdf') ? (
                <iframe
                  src={selectedUser.paymentReceiptUrl}
                  className="w-full h-[70vh] border rounded"
                  title="Payment Receipt"
                />
              ) : (
                <img
                  src={selectedUser.paymentReceiptUrl}
                  alt="Payment Receipt"
                  className="w-full h-auto rounded border"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
