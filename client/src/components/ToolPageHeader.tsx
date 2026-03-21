import { Link } from "wouter";
import { ArrowRight, ChevronLeft, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * ToolPageHeader — A unified header for complex multi-view tool pages
 * that cannot use the full UnifiedToolLayout (split-screen) pattern.
 * 
 * Now supports 3 languages (AR/FR/EN) via useLanguage context.
 */

export interface ToolPageHeaderProps {
  /** Tool icon */
  icon: LucideIcon;
  /** Tool name in Arabic */
  nameAr: string;
  /** Tool name in French */
  nameFr?: string;
  /** Tool name in English */
  nameEn?: string;
  /** Short description in Arabic */
  descAr?: string;
  /** Short description in French */
  descFr?: string;
  /** Short description in English */
  descEn?: string;
  /** Gradient CSS for the header background */
  gradient: string;
  /** Back navigation target (default: "/") */
  backTo?: string;
  /** Custom back handler (overrides backTo) */
  onBack?: () => void;
  /** Optional breadcrumb text for sub-views */
  breadcrumb?: string;
  /** Optional right-side actions */
  actions?: React.ReactNode;
  /** Optional subtitle (overrides desc) */
  subtitle?: string;
}

export default function ToolPageHeader({
  icon: Icon,
  nameAr,
  nameFr,
  nameEn,
  descAr,
  descFr,
  descEn,
  gradient,
  backTo = "/",
  onBack,
  breadcrumb,
  actions,
  subtitle,
}: ToolPageHeaderProps) {
  const { t } = useLanguage();
  const displayName = t(nameAr, nameFr || nameAr, nameEn || nameAr);
  const displayDesc = subtitle || t(descAr || "", descFr || descAr || "", descEn || descAr || "");

  return (
    <div className="text-white relative overflow-hidden" style={{ background: gradient }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <Link href={backTo}>
                <span className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
            )}
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "'Almarai', sans-serif" }}>
                  {displayName}
                </h1>
                {breadcrumb && (
                  <>
                    <ChevronLeft className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/80">{breadcrumb}</span>
                  </>
                )}
              </div>
              {displayDesc && (
                <p className="text-white/70 text-sm mt-0.5">{displayDesc}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
