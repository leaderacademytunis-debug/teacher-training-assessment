import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if dismissed recently (don't show for 7 days)
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // For Android/Chrome - listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS - show custom guide after delay
    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 start-4 end-4 md:left-auto md:right-auto md:bottom-6 md:start-6 md:max-w-[380px] z-40 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
          {/* App Icon */}
          <div className="shrink-0 h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/icon-96x96_822b1328.png"
              alt="Leader Academy"
              className="h-10 w-10 rounded-lg"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-foreground">ثبّت Leader Academy</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  أضف التطبيق لشاشتك الرئيسية للوصول السريع بدون متصفح
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleInstall}
                size="sm"
                className="h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                {isIOS ? "كيفية التثبيت" : "تثبيت الآن"}
              </Button>
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-[400px] p-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                تثبيت على iPhone
              </h3>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <p className="text-sm font-medium text-foreground">اضغط على زر المشاركة</p>
                  <p className="text-xs text-muted-foreground mt-0.5">الزر في أسفل شاشة Safari (مربع مع سهم للأعلى)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <p className="text-sm font-medium text-foreground">اختر "إضافة إلى الشاشة الرئيسية"</p>
                  <p className="text-xs text-muted-foreground mt-0.5">مرّر للأسفل في القائمة حتى تجد الخيار</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <p className="text-sm font-medium text-foreground">اضغط "إضافة"</p>
                  <p className="text-xs text-muted-foreground mt-0.5">سيظهر التطبيق على شاشتك الرئيسية</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              فهمت
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
