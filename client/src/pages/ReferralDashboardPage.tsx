import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Gift, Calendar, Copy, CheckCircle2, Clock, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import UnifiedNavbar from '@/components/UnifiedNavbar';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ReferralDashboardPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const statsQuery = trpc.referrals.getReferralStats.useQuery();
  const referralsQuery = trpc.referrals.getMyReferrals.useQuery();
  const rewardsQuery = trpc.referrals.getMyReferralRewards.useQuery();

  const handleCopyLink = (link: string, id: number) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('تم نسخ الرابط إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle2 },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      expired: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-sm font-medium`}>
        <Icon className="w-4 h-4" />
        {status === 'pending' && 'قيد الانتظار'}
        {status === 'accepted' && 'مقبول'}
        {status === 'completed' && 'مكتمل'}
        {status === 'expired' && 'منتهي'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <UnifiedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 لوحة تحكم الإحالات</h1>
          <p className="text-slate-600">تابع إحالاتك والمكافآت التي حصلت عليها</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                إجمالي الإحالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {statsQuery.data?.totalReferrals || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                قيد الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {statsQuery.data?.pending || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                مكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {statsQuery.data?.completed || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                الرصيد المكتسب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {statsQuery.data?.totalEarned || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>قائمة الإحالات</CardTitle>
            <CardDescription>جميع الدعوات التي أرسلتها</CardDescription>
          </CardHeader>
          <CardContent>
            {referralsQuery.isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">جاري التحميل...</p>
              </div>
            ) : referralsQuery.data && referralsQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">الحالة</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">تاريخ الإنشاء</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">الرابط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralsQuery.data.map((referral: any) => (
                      <tr key={referral.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{referral.referredEmail}</td>
                        <td className="py-3 px-4">{getStatusBadge(referral.status)}</td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {formatDistanceToNow(new Date(referral.createdAt), { locale: ar, addSuffix: true })}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(referral.referralLink, referral.id)}
                          >
                            {copiedId === referral.id ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                تم النسخ
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                نسخ
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">لم تُنشئ أي إحالات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards History */}
        <Card>
          <CardHeader>
            <CardTitle>سجل المكافآت</CardTitle>
            <CardDescription>جميع المكافآت التي حصلت عليها</CardDescription>
          </CardHeader>
          <CardContent>
            {rewardsQuery.isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">جاري التحميل...</p>
              </div>
            ) : rewardsQuery.data && rewardsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {rewardsQuery.data.map((reward: any) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Gift className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{reward.reason}</p>
                        <p className="text-sm text-slate-600">
                          {formatDistanceToNow(new Date(reward.createdAt), { locale: ar, addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">+{reward.creditsAwarded}</p>
                      <p className="text-xs text-slate-600">جذاذة</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">لم تحصل على أي مكافآت بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
