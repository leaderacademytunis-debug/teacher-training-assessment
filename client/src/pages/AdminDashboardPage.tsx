import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, BookOpen, Video, AlertCircle } from 'lucide-react';
import UnifiedNavbar from '@/components/UnifiedNavbar';

export default function AdminDashboardPage() {
  const user = useAuth();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">الوصول مرفوض</h1>
          <p className="text-red-700 mb-6">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
          <Button onClick={() => setLocation('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  // Fetch KPI stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.getKPIStats.useQuery();

  // Fetch users list
  const { data: usersData, isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery({
    page,
    limit: 20,
    search: search || undefined,
  });

  if (statsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المشرف</h1>
          <p className="text-gray-600 mt-2">مرحباً {user.name}، إليك ملخص الأداء</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">المستخدمون النشطون</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeUsers || 0}</p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">المعلمون</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalTeachers || 0}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الجذاذات المُنشأة</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalLessonsCreated || 0}</p>
              </div>
              <BookOpen className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الفيديوهات المُنشأة</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalVideosCreated || 0}</p>
              </div>
              <Video className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">إدارة المستخدمين</h2>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <Input
              placeholder="ابحث عن المستخدم..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-md"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الاسم</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الدور</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.users?.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          u.registrationStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : u.registrationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.registrationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button variant="outline" size="sm">
                        تعديل الرصيد
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              الصفحة {usersData?.page} من {usersData?.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(usersData?.totalPages || 1, page + 1))}
                disabled={page === usersData?.totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
