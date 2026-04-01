import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface ContactRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
}

export function ContactRequestModal({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  teacherEmail,
}: ContactRequestModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    subject: 'طلب توظيف',
    message: '',
    phone: '',
  });
  const [submitted, setSubmitted] = React.useState(false);

  const createContactRequest = trpc.contactRequests.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({ subject: 'طلب توظيف', message: '', phone: '' });
      }, 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    createContactRequest.mutate({
      teacherId,
      teacherName,
      teacherEmail,
      teacherPhone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      subscriptionRequired: true,
      subscriptionType: 'pro',
    });
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">تم إرسال الطلب بنجاح!</h3>
            <p className="text-sm text-gray-600 text-center">
              سيتم التواصل معك قريباً من قبل المدرسة
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right">📞 طلب الاتصال والانتداب</DialogTitle>
          <DialogDescription className="text-right">
            تواصل مباشر مع المدارس الخاصة للحصول على فرص عمل
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-right">
              <p className="font-semibold text-blue-900">🔒 ميزة متقدمة</p>
              <p className="text-blue-800 mt-1">
                هذه الميزة متاحة للمشتركين في الخطة <span className="font-bold">Pro</span> أو <span className="font-bold">Expert</span>
              </p>
              {!user?.subscriptionTier || user.subscriptionTier === 'free' ? (
                <Button
                  size="sm"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = '/pricing'}
                >
                  ترقية الآن
                </Button>
              ) : (
                <p className="text-green-700 font-semibold mt-2">✓ أنت مشترك في خطة متقدمة</p>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Teacher Info (Read-only) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <label className="text-sm font-medium text-gray-700">الاسم الكامل</label>
                <Input
                  value={teacherName}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <Input
                  value={teacherEmail}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="text-right">
              <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
              <Input
                type="tel"
                placeholder="98765432"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 text-right"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ سيتم مشاركة رقمك مع المدارس المهتمة فقط
              </p>
            </div>

            {/* Subject */}
            <div className="text-right">
              <label className="text-sm font-medium text-gray-700">موضوع الطلب</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-right"
              >
                <option value="طلب توظيف">طلب توظيف</option>
                <option value="استفسار عن فرصة عمل">استفسار عن فرصة عمل</option>
                <option value="طلب معلومات إضافية">طلب معلومات إضافية</option>
              </select>
            </div>

            {/* Message */}
            <div className="text-right">
              <label className="text-sm font-medium text-gray-700">رسالتك</label>
              <Textarea
                placeholder="أخبرنا عن نفسك وعن الفرصة التي تبحث عنها..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 text-right"
                rows={4}
                required
              />
            </div>

            {/* Privacy Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 text-right">
                ✓ بيانات اتصالك محمية وآمنة. سيتم استخدامها فقط للتواصل من قبل المدارس المهتمة
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createContactRequest.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={
                  createContactRequest.isPending ||
                  !formData.phone ||
                  !formData.message ||
                  (!user?.subscriptionTier || user.subscriptionTier === 'free')
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createContactRequest.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال الطلب'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
