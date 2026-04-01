import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'wouter';

interface EmptyStateCardProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

export default function EmptyStateCard({
  title = '⚠️ ملفك المهني فارغ!',
  description = 'المدارس لن تتواصل معك. استخدم رصيدك المجاني الآن واضغط هنا لتوليد أول جذاذة لك بالذكاء الاصطناعي',
  actionLabel = 'ابدأ الآن - وليد أول جذاذة',
  actionPath = '/assistant',
  onAction,
}: EmptyStateCardProps) {
  const [, navigate] = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 dir-rtl">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 text-center shadow-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-amber-900 mb-4 leading-tight">
          {title}
        </h2>

        {/* Description */}
        <p className="text-lg text-amber-800 mb-8 leading-relaxed max-w-xl mx-auto">
          {description}
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleAction}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
        >
          {actionLabel}
          <ArrowRight className="h-5 w-5" />
        </Button>

        {/* Subtext */}
        <p className="text-sm text-amber-700 mt-6 opacity-75">
          💡 نصيحة: ابدأ بجذاذة واحدة وسترى الفرق في طلبات التواصل من المدارس!
        </p>
      </div>
    </div>
  );
}
