import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Mail, Users, Gift, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import UnifiedNavbar from '@/components/UnifiedNavbar';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { toast } from 'sonner';

export default function InviteFriendsPage() {
  const [referredEmail, setReferredEmail] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const createInviteMutation = trpc.referrals.createReferralInvite.useMutation();
  const statsQuery = trpc.referrals.getReferralStats.useQuery();

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referredEmail.trim()) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    try {
      const result = await createInviteMutation.mutateAsync({
        referredEmail,
        invitationMessage: invitationMessage || 'انضم إلى منصة Leader Academy واستفد من أدوات الذكاء الاصطناعي المتقدمة!',
      });

      setGeneratedLink(result.referralLink);
      setReferredEmail('');
      setInvitationMessage('');

      toast.success('تم إنشاء الدعوة بنجاح! 🎉');

      // Refresh stats
      statsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الدعوة');
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      toast.success('تم نسخ الرابط إلى الحافظة');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <UnifiedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">🎁 برنامج الإحالات</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            ادعُ زملاءك المعلمين واحصل على رصيد مجاني لكل معلم ينضم عبر رابطك الخاص
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Rewards Card */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-600" />
                مكافآتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">لكل معلم ينضم:</p>
              <p className="text-3xl font-bold text-green-600">10 جذاذات</p>
              <p className="text-xs text-slate-500">+ 5 جذاذات لصديقك كهدية ترحيب</p>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                إحصائياتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">إجمالي الدعوات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsQuery.data?.totalReferrals || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">الرصيد المكتسب</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsQuery.data?.totalEarned || 0} جذاذة
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                الحالة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statsQuery.data?.pending || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">مكتملة</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsQuery.data?.completed || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Invitation Form */}
          <Card>
            <CardHeader>
              <CardTitle>إنشاء دعوة جديدة</CardTitle>
              <CardDescription>ادعُ زميلك المعلم الآن</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    البريد الإلكتروني للمعلم
                  </label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={referredEmail}
                    onChange={(e) => setReferredEmail(e.target.value)}
                    disabled={createInviteMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    رسالة شخصية (اختياري)
                  </label>
                  <Textarea
                    placeholder="أضف رسالة شخصية لتشجيع صديقك..."
                    value={invitationMessage}
                    onChange={(e) => setInvitationMessage(e.target.value)}
                    disabled={createInviteMutation.isPending}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={createInviteMutation.isPending}
                >
                  {createInviteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      إنشاء دعوة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Link Display */}
          <Card>
            <CardHeader>
              <CardTitle>رابط الدعوة الخاص بك</CardTitle>
              <CardDescription>شارك هذا الرابط مع أصدقائك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedLink ? (
                <>
                  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 break-all">
                    <p className="text-sm font-mono text-slate-700">{generatedLink}</p>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="w-full"
                    variant={copiedLink ? 'default' : 'outline'}
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        تم النسخ!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        نسخ الرابط
                      </>
                    )}
                  </Button>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      💡 <strong>نصيحة:</strong> شارك هذا الرابط عبر البريد الإلكتروني أو وسائل التواصل الاجتماعي
                    </p>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 text-center">
                      شارك على وسائل التواصل الاجتماعي 📱
                    </h4>
                    <SocialShareButtons referralLink={generatedLink} />
                  </div>
                </>
              ) : (
                <div className="bg-slate-100 p-8 rounded-lg text-center">
                  <p className="text-slate-600">
                    لم تُنشئ دعوة بعد. ابدأ بملء النموذج على اليسار
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>كيف يعمل البرنامج؟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">أنشئ دعوة</h3>
                <p className="text-sm text-slate-600">أدخل بريد صديقك واضغط "إنشاء دعوة"</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">شارك الرابط</h3>
                <p className="text-sm text-slate-600">انسخ الرابط وشاركه مع صديقك</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">ينضم صديقك</h3>
                <p className="text-sm text-slate-600">يسجل صديقك عبر رابطك الخاص</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">احصل على المكافأة</h3>
                <p className="text-sm text-slate-600">تلقَ 10 جذاذات مجانية فوراً</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Link Section */}
        <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-8 border border-emerald-200 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">هل لديك أسئلة؟</h3>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            اطّلع على قسم الأسئلة الشائعة الشامل لفهم كيفية عمل نظام الإحالات والمكافآت بالتفصيل.
          </p>
          <a
            href="/referral-faq"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            اقرأ الأسئلة الشائعة
          </a>
        </div>
      </div>
    </div>
  );
}
