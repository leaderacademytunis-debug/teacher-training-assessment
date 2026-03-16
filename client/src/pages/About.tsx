import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import {
  GraduationCap, Target, Users, Brain, Award, Globe,
  ArrowLeft, Sparkles, BookOpen, Shield, Zap, Heart,
  ChevronLeft, Star, MapPin, Mail, Phone, Building2,
  FileText, Scale, BadgeCheck,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";

const VISION_POINTS = [
  {
    icon: Brain,
    title: "الذكاء الاصطناعي في خدمة التعليم",
    desc: "نؤمن بأن الذكاء الاصطناعي ليس بديلاً عن المعلم، بل هو أداة تمكّنه من التركيز على ما يجيده: الإلهام والتوجيه والتربية.",
    color: "#1A237E",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "التوافق مع البرامج الرسمية",
    desc: "كل أدواتنا مصممة وفق البرامج الرسمية التونسية 2026، مما يضمن أن كل جذاذة وكل اختبار يتماشى مع المعايير المعتمدة.",
    color: "#E65100",
    bg: "bg-orange-50",
  },
  {
    icon: Users,
    title: "مجتمع المعلمين التونسيين",
    desc: "نبني مجتمعاً تعاونياً يتشارك فيه المعلمون خبراتهم ومواردهم، لأن التعليم الجيد يبدأ من معلم مُمكَّن.",
    color: "#2E7D32",
    bg: "bg-green-50",
  },
  {
    icon: Award,
    title: "التكوين المستمر والشهادات",
    desc: "نقدم دورات تكوينية معتمدة تغطي كل جوانب التعليم الحديث، من التحضيري إلى الابتدائي، مع شهادات تثبت الكفاءة.",
    color: "#6A1B9A",
    bg: "bg-purple-50",
  },
];

const MILESTONES = [
  { value: "+500", label: "معلم ومعلمة تم تكوينهم" },
  { value: "12", label: "برنامج تدريبي متخصص" },
  { value: "98%", label: "نسبة رضا المشاركين" },
  { value: "7", label: "دورات تأهيلية معتمدة" },
];

const TEAM = [
  {
    name: "علي سعدالله",
    role: "المؤسس والمدير العام",
    desc: "خبير في توظيف الذكاء الاصطناعي في التدريس، مختص في الإعلامية والبرمجة والتسويق الرقمي.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <SEOHead
        title="عن الأكاديمية"
        description="تعرف على Leader Academy — المؤسسة التكوينية التونسية الرائدة في توظيف الذكاء الاصطناعي في التعليم. رؤيتنا، رسالتنا، وخدماتنا."
        descriptionFr="Découvrez Leader Academy — l'institution tunisienne pionnière dans l'intégration de l'IA dans l'éducation."
        ogUrl="/about"
      />
      <UnifiedNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 50%, #1565C0 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,109,0,0.3), transparent)" }} />
          <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(21,101,192,0.4), transparent)" }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ background: "rgba(255,109,0,0.2)", color: "#FFB74D" }}>
              <Sparkles className="w-4 h-4" />
              منصة الذكاء الاصطناعي التربوي #1 في تونس
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              عن <span style={{ color: "#FF6D00" }}>Leader Academy</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-4">
              نحن مؤسسة تكوينية تونسية رائدة، أسسها المدرب <strong className="text-white">علي سعدالله</strong>، 
              تهدف إلى تمكين المعلمين التونسيين من توظيف الذكاء الاصطناعي في ممارساتهم البيداغوجية اليومية.
            </p>
            <p className="text-lg text-blue-200 leading-relaxed">
              نسعى لبناء جيل جديد من المعلمين الرقميين القادرين على مواكبة التحولات التربوية 
              وتقديم تعليم عصري يتوافق مع البرامج الرسمية التونسية.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: "rgba(26,35,126,0.08)", color: "#1A237E" }}>
              <Target className="w-4 h-4" />
              رؤيتنا ورسالتنا
            </span>
            <h2 className="text-3xl lg:text-4xl font-black mb-4" style={{ color: "#1A237E" }}>
              نقود ثورة الذكاء الاصطناعي في التعليم بتونس
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              أربعة ركائز أساسية تقوم عليها رؤيتنا لتحويل المشهد التربوي التونسي
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VISION_POINTS.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div key={idx} className={`${point.bg} rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: point.color }}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: point.color }}>{point.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-base">{point.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {MILESTONES.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl lg:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-white/80 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-6" style={{ color: "#1A237E" }}>رسالتنا</h2>
          <blockquote className="text-xl text-gray-600 leading-relaxed italic border-r-4 pr-6" style={{ borderColor: "#FF6D00" }}>
            "نؤمن بأن كل معلم تونسي يستحق أن يمتلك أدوات ذكية تساعده على تصميم دروس مبتكرة، 
            وتقييم مكتسبات تلاميذه بدقة، وتطوير مهاراته المهنية باستمرار. 
            هدفنا هو أن يصبح المعلم التونسي قائداً رقمياً في فصله الدراسي."
          </blockquote>
          <p className="mt-6 text-gray-500 font-semibold">— علي سعدالله، مؤسس Leader Academy</p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-4" style={{ color: "#1A237E" }}>ماذا نقدم؟</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              منظومة متكاملة من الأدوات والدورات التكوينية المصممة خصيصاً للمعلم التونسي
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "دورات تكوينية معتمدة", desc: "7 دورات متخصصة تغطي كل المستويات من التحضيري إلى الابتدائي، مع شهادات إتمام.", color: "#1A237E" },
              { icon: Brain, title: "أدوات ذكاء اصطناعي", desc: "EDUGPT، المتفقد الذكي، بناء الاختبارات، محلل خط اليد، وأكثر من 10 أدوات ذكية.", color: "#E65100" },
              { icon: Globe, title: "سوق المحتوى الذهبي", desc: "منصة مجتمعية لمشاركة وتبادل أفضل المحتويات التعليمية بين المعلمين التونسيين.", color: "#2E7D32" },
              { icon: Shield, title: "توافق رسمي 100%", desc: "كل المحتوى والأدوات مصممة وفق البرامج الرسمية التونسية المعتمدة لسنة 2026.", color: "#6A1B9A" },
              { icon: Zap, title: "توليد فوري للمحتوى", desc: "جذاذات، مخططات سنوية، اختبارات، ووثائق تقييم جاهزة في ثوانٍ معدودة.", color: "#C62828" },
              { icon: Star, title: "مسار مهني متكامل", desc: "ملف مهني رقمي، معرض الكفاءات، فرص عمل، وتحليلات أداء شخصية.", color: "#00695C" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: item.color }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: item.color }}>{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-4" style={{ color: "#1A237E" }}>المؤسس</h2>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 text-4xl font-black text-white" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                ع.س
              </div>
              <div className="text-center md:text-right">
                <h3 className="text-2xl font-black mb-1" style={{ color: "#1A237E" }}>علي سعدالله</h3>
                <p className="text-orange-600 font-bold mb-3">المؤسس والمدير العام — Leader Academy</p>
                <p className="text-gray-600 leading-relaxed">
                  مدرب وخبير في توظيف الذكاء الاصطناعي في التدريس، مختص في الإعلامية والبرمجة والتسويق الرقمي. 
                  أسس Leader Academy بهدف تمكين المعلمين التونسيين من أدوات المستقبل وبناء جسر بين التكنولوجيا والبيداغوجيا.
                </p>
                <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" /> تونس
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <GraduationCap className="w-4 h-4" /> خبير ذكاء اصطناعي تربوي
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Registration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: "rgba(26,35,126,0.08)", color: "#1A237E" }}>
              <BadgeCheck className="w-4 h-4" />
              هيكل تكوين مرخّص
            </span>
            <h2 className="text-3xl font-black mb-4" style={{ color: "#1A237E" }}>المعطيات القانونية</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Leader Academy هيكل تكوين خاص مرخّص له في تعاطي نشاط التكوين المستمر
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
              <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#1A237E" }}>
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1A237E" }}>الوزارة المشرفة</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                ترجع الأكاديمية بالنظر إلى <strong>وزارة التكوين المهني والتشغيل</strong>
              </p>
              <p className="text-blue-800 font-bold mt-2 text-lg">عدد التسجيل: 6130916</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 text-center">
              <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#E65100" }}>
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#E65100" }}>المعرّف الجبائي</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                المعرّف الجبائي للمؤسسة
              </p>
              <p className="text-orange-800 font-bold mt-2 text-lg direction-ltr" dir="ltr">1457091MAM000</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 text-center">
              <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#2E7D32" }}>
                <Scale className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#2E7D32" }}>السجل التجاري</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                مسجلة بالسجل التجاري لدى <strong>محكمة صفاقس</strong>
              </p>
              <p className="text-green-800 font-bold mt-2 text-lg" dir="ltr">B08107512016</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <Phone className="w-5 h-5 text-blue-800" />
              <div>
                <p className="text-xs text-gray-400">الهاتف</p>
                <p className="font-bold text-gray-800" dir="ltr">52 339 339 / 99 997 729</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-green-50 border border-green-200">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <div>
                <p className="text-xs text-gray-400">واتساب</p>
                <p className="font-bold text-green-700" dir="ltr">+216 52 339 339</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <Mail className="w-5 h-5 text-blue-800" />
              <div>
                <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                <p className="font-bold text-gray-800">leaderacademy216@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #0D1B5E, #1A237E)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">انضم إلى مجتمع المعلمين الرقميين</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            ابدأ رحلتك في توظيف الذكاء الاصطناعي في التعليم اليوم. سجّل مجاناً واكتشف أدواتنا.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="px-8 py-3 text-lg font-bold rounded-xl" style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}>
                <ArrowLeft className="w-5 h-5 ml-2" />
                ابدأ الآن
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="px-8 py-3 text-lg font-bold rounded-xl border-white/30 text-white hover:bg-white/10">
                <Mail className="w-5 h-5 ml-2" />
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm mb-2">
          &copy; {new Date().getFullYear()} Leader Academy — جميع الحقوق محفوظة
        </p>
        <p className="text-gray-500 text-xs">
          هيكل تكوين خاص مرخّص — وزارة التكوين المهني والتشغيل — عدد 6130916
        </p>
      </footer>
    </div>
  );
}
