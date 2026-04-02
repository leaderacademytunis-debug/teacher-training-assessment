import { Button } from '@/components/ui/button';
import { Copy, Facebook, Twitter, MessageCircle, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  referralLink: string;
  teacherName?: string;
  className?: string;
}

export function SocialShareButtons({
  referralLink,
  teacherName = 'المعلم',
  className = '',
}: SocialShareButtonsProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('تم نسخ الرابط إلى الحافظة! 📋');
  };

  const shareMessages = {
    whatsapp: `مرحباً! 👋\n\nأنا أستخدم منصة Leader Academy - منصة تعليمية ذكية تساعد المعلمين على تطوير مهاراتهم باستخدام الذكاء الاصطناعي.\n\nانضم إليّ واحصل على 5 جذاجات مجانية عند التسجيل:\n${referralLink}\n\nستجد أدوات رائعة مثل:\n✨ EduGPT - مساعد ذكي للتدريس\n📊 تحليل الأداء والتقييم\n🎓 مكتبة موارد تعليمية\n🎬 إنشاء محتوى تعليمي\n\nأتطلع لرؤيتك على المنصة! 🚀`,

    facebook: `مرحباً بك في عالم التعليم الذكي! 🌟\n\nأنا أستخدم منصة Leader Academy - منصة تعليمية متقدمة تجمع بين التدريس والذكاء الاصطناعي.\n\nاحصل على 5 جذاجات مجانية عند الانضمام عبر رابطي:\n${referralLink}\n\nالمنصة توفر:\n✅ أدوات تدريس ذكية\n✅ تحليل شامل للأداء\n✅ مكتبة موارد غنية\n✅ دعم مستمر\n\nانضم الآن وطور مهاراتك التعليمية! 📚`,

    twitter: `🎓 اكتشف منصة Leader Academy!\n\nمنصة تعليمية ذكية تساعد المعلمين على التطور المهني باستخدام AI.\n\n✨ احصل على 5 جذاجات مجانية:\n${referralLink}\n\n#التعليم_الذكي #الذكاء_الاصطناعي #تطوير_المعلمين #LeaderAcademy`,

    linkedin: `مرحباً بك في منصة Leader Academy! 🚀\n\nأنا أستخدم منصة Leader Academy - منصة تعليمية متخصصة لتطوير مهارات المعلمين باستخدام تقنيات الذكاء الاصطناعي المتقدمة.\n\nإذا كنت معلماً وتريد:\n• تحسين طرق التدريس\n• الاستفادة من الأدوات الذكية\n• الوصول إلى موارد تعليمية حديثة\n\nانضم إلى منصتنا واحصل على 5 جذاجات مجانية:\n${referralLink}\n\nدعنا نبني مستقبلاً تعليمياً أفضل معاً! 💡\n\n#التعليم #الذكاء_الاصطناعي #تطوير_المهارات #LeaderAcademy`,
  };

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin') => {
    const message = shareMessages[platform];
    const encodedMessage = encodeURIComponent(message);
    const encodedLink = encodeURIComponent(referralLink);

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast.success(`تم فتح ${platform === 'whatsapp' ? 'واتس آب' : platform === 'facebook' ? 'فيسبوك' : platform === 'twitter' ? 'تويتر' : 'لينكد إن'} 📱`);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir="rtl">
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Copy Link Button */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
          title="نسخ الرابط"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">نسخ الرابط</span>
        </Button>

        {/* WhatsApp Button */}
        <Button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
          title="مشاركة على واتس آب"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">واتس آب</span>
        </Button>

        {/* Facebook Button */}
        <Button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          title="مشاركة على فيسبوك"
        >
          <Facebook className="w-4 h-4" />
          <span className="hidden sm:inline">فيسبوك</span>
        </Button>

        {/* Twitter Button */}
        <Button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
          title="مشاركة على تويتر"
        >
          <Twitter className="w-4 h-4" />
          <span className="hidden sm:inline">تويتر</span>
        </Button>

        {/* LinkedIn Button */}
        <Button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white"
          title="مشاركة على لينكد إن"
        >
          <Linkedin className="w-4 h-4" />
          <span className="hidden sm:inline">لينكد إن</span>
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-slate-600 text-center">
        💡 شارك رابط الإحالة مع أصدقائك واحصل على مكافآت إضافية!
      </p>
    </div>
  );
}
