import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, Eye, BarChart3 } from 'lucide-react';
import UnifiedNavbar from '@/components/UnifiedNavbar';

export default function AdminAnalyticsPage() {
  const user = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
          <p className="text-gray-600 mb-6">ليس لديك صلاحيات للوصول إلى هذه الصفحة</p>
          <Button onClick={() => setLocation('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  // Fetch demo access statistics
  const { data: demoStats, isLoading: isLoadingStats } = trpc.analytics.getDemoAccessStats.useQuery();

  if (isLoadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <UnifiedNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 لوحة تحليلات المنصة</h1>
          <p className="text-gray-600">مراقبة إحصائيات الزيارات والاهتمام بالمنصة</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Demo Visits */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">إجمالي زيارات Demo</p>
                <p className="text-3xl font-bold text-gray-900">{demoStats?.totalDemoVisits || 0}</p>
              </div>
              <Eye className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </Card>

          {/* Demo Visits Today */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">زيارات اليوم</p>
                <p className="text-3xl font-bold text-gray-900">{demoStats?.demoVisitsToday || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </Card>

          {/* Average Daily Visits */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">المتوسط اليومي (30 يوم)</p>
                <p className="text-3xl font-bold text-gray-900">{demoStats?.avgDailyVisits || 0}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </Card>

          {/* Alert Status */}
          <Card className={`p-6 ${(demoStats?.totalDemoVisits || 0) >= 1000 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">حالة الإطلاق</p>
                <p className={`text-lg font-bold ${(demoStats?.totalDemoVisits || 0) >= 1000 ? 'text-green-700' : 'text-yellow-700'}`}>
                  {(demoStats?.totalDemoVisits || 0) >= 1000 ? '🎉 جاهز للإطلاق' : '⏳ قريباً'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Milestone Alert */}
        {(demoStats?.totalDemoVisits || 0) >= 1000 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">تم تجاوز 1000 زيارة تجريبية!</h3>
                <p className="text-green-700 mb-4">
                  الاهتمام بالمنصة مرتفع جداً. قد حان الوقت للإطلاق الرسمي والبدء في استقبال المعلمين الأوائل.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  ابدأ الإطلاق الرسمي
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Trend Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📈 اتجاه الزيارات (آخر 30 يوم)</h2>
          
          {demoStats?.trend && demoStats.trend.length > 0 ? (
            <div className="space-y-4">
              {demoStats.trend.map((item) => (
                <div key={item.date} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">{item.date}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.min((item.visits / (demoStats.trend.reduce((max, t) => Math.max(max, t.visits), 0) || 1)) * 100, 100)}%`,
                      }}
                    >
                      {item.visits > 0 && (
                        <span className="text-xs font-bold text-white">{item.visits}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12">{item.visits}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">لا توجد بيانات حتى الآن</p>
          )}
        </Card>

        {/* Summary Stats */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">📋 ملخص الأداء</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-semibold">معدل النمو اليومي</p>
              <p className="text-2xl font-bold text-blue-900">
                {demoStats?.avgDailyVisits || 0} زيارة/يوم
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">إجمالي الزيارات</p>
              <p className="text-2xl font-bold text-blue-900">
                {demoStats?.totalDemoVisits || 0}
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">الحالة</p>
              <p className="text-2xl font-bold text-blue-900">
                {((demoStats?.totalDemoVisits || 0) / 1000 * 100).toFixed(0)}% من الهدف
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
