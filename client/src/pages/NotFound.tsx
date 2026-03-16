import { Button } from "@/components/ui/button";
import { Home, BookX, ArrowLeft, Search, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [glitch, setGlitch] = useState(false);

  // Subtle glitch animation on the 404 number
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl" style={{ fontFamily: "Cairo, Tajawal, sans-serif", background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 40%, #1565C0 100%)" }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating chalk marks */}
        <div className="absolute top-[10%] right-[10%] text-white/5 text-9xl font-black select-none" style={{ transform: "rotate(-15deg)" }}>أ</div>
        <div className="absolute top-[30%] left-[5%] text-white/5 text-8xl font-black select-none" style={{ transform: "rotate(10deg)" }}>ب</div>
        <div className="absolute bottom-[20%] right-[15%] text-white/5 text-7xl font-black select-none" style={{ transform: "rotate(-8deg)" }}>ت</div>
        <div className="absolute bottom-[10%] left-[20%] text-white/5 text-9xl font-black select-none" style={{ transform: "rotate(20deg)" }}>+</div>
        <div className="absolute top-[60%] right-[60%] text-white/5 text-8xl font-black select-none" style={{ transform: "rotate(-25deg)" }}>=</div>
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,109,0,0.15), transparent)" }} />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(21,101,192,0.2), transparent)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Chalkboard-style card */}
        <div className="max-w-2xl w-full">
          {/* Top chalk tray */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,109,0,0.2)", border: "2px solid rgba(255,109,0,0.3)" }}>
              <BookX className="w-8 h-8" style={{ color: "#FFB74D" }} />
            </div>
          </div>

          {/* 404 Number */}
          <div className="text-center mb-6">
            <h1
              className={`text-[120px] sm:text-[160px] font-black leading-none tracking-tight transition-all duration-200 ${glitch ? "translate-x-1 skew-x-2" : ""}`}
              style={{
                color: "transparent",
                WebkitTextStroke: "3px rgba(255,109,0,0.8)",
                textShadow: glitch ? "4px 0 #FF6D00, -4px 0 #1565C0" : "none",
                fontFamily: "Cairo, sans-serif",
              }}
            >
              404
            </h1>
          </div>

          {/* Main message card */}
          <div className="rounded-3xl p-8 sm:p-10 text-center" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-relaxed">
              عذراً، هذه الصفحة غير موجودة في المنهج!
            </h2>
            <p className="text-blue-200 text-lg sm:text-xl leading-relaxed mb-8">
              يبدو أنك تبحث عن درس غير مدرج في البرامج الرسمية التونسية.
              <br />
              <span className="text-blue-300/70 text-base">لا تقلق، حتى أفضل المعلمين يضلون الطريق أحياناً!</span>
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/")}
                className="px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}
              >
                <Home className="w-5 h-5 ml-2" />
                العودة للصفحة الرئيسية
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="px-8 py-3 text-lg font-bold rounded-xl border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                الرجوع للخلف
              </Button>
            </div>
          </div>

          {/* Helpful links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: "/assistant", icon: Sparkles, label: "EDUGPT — المساعد الذكي" },
              { href: "/my-courses", icon: Search, label: "دوراتي التدريبية" },
              { href: "/pricing", icon: BookX, label: "خطط الاشتراك" },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-blue-100 font-medium">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Fun footer note */}
          <p className="text-center text-blue-300/40 text-sm mt-10">
            خطأ 404 — هذا الدرس ليس في المقرر... بعد!
          </p>
        </div>
      </div>
    </div>
  );
}
