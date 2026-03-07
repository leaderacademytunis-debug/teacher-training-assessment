import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  /** Override the back destination (default: browser history) */
  to?: string;
  /** Label to display (default: رجوع) */
  label?: string;
  /** Extra className */
  className?: string;
}

/**
 * BackButton — زر الرجوع القابل لإعادة الاستخدام
 * يعمل مع تاريخ المتصفح أو مسار محدد
 */
export default function BackButton({ to, label = "رجوع", className = "" }: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center gap-1 text-gray-600 hover:text-[#1B4F72] hover:bg-blue-50 transition-colors px-3 py-1.5 rounded-lg ${className}`}
      dir="rtl"
    >
      <ChevronRight className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
