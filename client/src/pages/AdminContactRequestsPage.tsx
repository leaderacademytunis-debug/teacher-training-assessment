import React, { useState, useMemo } from 'react';
import { Loader2, Search, Filter, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UnifiedNavbar from '@/components/UnifiedNavbar';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={16} /> },
  contacted: { label: 'تم التواصل', color: 'bg-blue-100 text-blue-800', icon: <MessageSquare size={16} /> },
  accepted: { label: 'مقبول', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} /> },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: <XCircle size={16} /> },
  expired: { label: 'منتهي الصلاحية', color: 'bg-gray-100 text-gray-800', icon: <Clock size={16} /> },
};

export default function AdminContactRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Fetch contact requests
  const { data: requests = [], isLoading, refetch } = trpc.contactRequests.getAll.useQuery({
    status: statusFilter as any,
    limit: 100,
    offset: 0,
  });

  // Update status mutation
  const updateStatus = trpc.contactRequests.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      setIsReplyModalOpen(false);
      setReplyText('');
      setSelectedRequest(null);
    },
  });

  // Filter requests based on search
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.teacherEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.teacherPhone?.includes(searchQuery);
      return matchesSearch;
    });
  }, [requests, searchQuery]);

  const handleReply = async () => {
    if (!selectedRequest || !replyText.trim()) return;

    updateStatus.mutate({
      requestId: selectedRequest.id,
      status: 'contacted',
      response: replyText,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">جاري تحميل طلبات الاتصال...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <UnifiedNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📞 إدارة طلبات الاتصال</h1>
          <p className="text-gray-600">إدارة جميع طلبات الاتصال والانتداب من المعلمين</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-r-4 border-yellow-500">
            <p className="text-gray-600 text-sm">قيد الانتظار</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-r-4 border-blue-500">
            <p className="text-gray-600 text-sm">تم التواصل</p>
            <p className="text-2xl font-bold text-blue-600">
              {requests.filter((r) => r.status === 'contacted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-r-4 border-green-500">
            <p className="text-gray-600 text-sm">مقبول</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter((r) => r.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-r-4 border-red-500">
            <p className="text-gray-600 text-sm">مرفوض</p>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter((r) => r.status === 'rejected').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-r-4 border-purple-500">
            <p className="text-gray-600 text-sm">الإجمالي</p>
            <p className="text-2xl font-bold text-purple-600">{requests.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="ابحث عن المعلم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">الحالة</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right"
              >
                <option value="">جميع الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="contacted">تم التواصل</option>
                <option value="accepted">مقبول</option>
                <option value="rejected">مرفوض</option>
                <option value="expired">منتهي الصلاحية</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="w-full"
              >
                <Filter size={16} className="ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">لا توجد طلبات اتصال</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المعلم</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">البريد الإلكتروني</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الموضوع</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{request.teacherName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.teacherEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[request.status]?.color}`}>
                          {STATUS_LABELS[request.status]?.icon}
                          {STATUS_LABELS[request.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString('ar-TN')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsReplyModalOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          الرد
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedRequest && (
        <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-right">الرد على طلب الاتصال</DialogTitle>
              <DialogDescription className="text-right">
                من: {selectedRequest.teacherName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Request Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">الموضوع</p>
                  <p className="text-gray-900">{selectedRequest.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">رسالة المعلم</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">البريد الإلكتروني</p>
                    <p className="text-gray-900">{selectedRequest.teacherEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">رقم الهاتف</p>
                    <p className="text-gray-900">{selectedRequest.teacherPhone}</p>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">ردك</label>
                <Textarea
                  placeholder="اكتب ردك على طلب الاتصال..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="text-right"
                />
              </div>

              {/* Status Update */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">تحديث الحالة</label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="contacted">تم التواصل</option>
                  <option value="accepted">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsReplyModalOpen(false)}
                  disabled={updateStatus.isPending}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={updateStatus.isPending || !replyText.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {updateStatus.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال الرد'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
