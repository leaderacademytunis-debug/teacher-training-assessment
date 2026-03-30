import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, BookOpen, Brain, Calculator, Focus, BarChart3, Users, FileText, CheckCircle2 } from "lucide-react";

export default function Inclusion() {
  const [expandedTool, setExpandedTool] = useState<number | null>(null);

  const tools = [
    {
      id: 1,
      name: "محلل الخط اليدوي",
      nameEn: "Handwriting Analyzer",
      icon: "✍️",
      description: "تحليل الخط اليدوي للكشف عن صعوبات الكتابة والتنسيق الحركي",
      what: "أداة ذكاء اصطناعي تحلل صور الخط اليدوي وتكتشف مؤشرات عسر الكتابة والصعوبات الحركية",
      why: "الكشف المبكر عن صعوبات الكتابة يساعد على تقديم الدعم المناسب قبل تفاقم المشكلة",
      steps: [
        "التقط صورة لكتابة التلميذ أو أرفعها",
        "اضغط 'تحليل الخط'",
        "اقرأ التقرير المفصل والتوصيات"
      ],
      route: "/handwriting-analyzer",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 2,
      name: "المرافق البيداغوجي الفردي",
      nameEn: "Pedagogical Companion",
      icon: "👨‍🏫",
      description: "مساعد ذكي يقدم استراتيجيات تدريس مخصصة لكل تلميذ",
      what: "نظام ذكاء اصطناعي يحلل احتياجات التلميذ ويقترح استراتيجيات تدريس فردية",
      why: "كل تلميذ فريد — هذه الأداة تساعدك على تخصيص الدعم حسب احتياجاته الفعلية",
      steps: [
        "أدخل معلومات التلميذ والصعوبات",
        "اختر المادة الدراسية",
        "احصل على خطة دعم مخصصة"
      ],
      route: "/pedagogical-companion",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 3,
      name: "محول المحتوى التعليمي",
      nameEn: "Content Adapter",
      icon: "📚",
      description: "تحويل المحتوى التعليمي ليناسب احتياجات التلاميذ ذوي الصعوبات",
      what: "أداة تحول الدروس والنصوص إلى صيغ متعددة (نصوص مبسطة، صور، صوتيات)",
      why: "تسهيل وصول جميع التلاميذ للمحتوى التعليمي بغض النظر عن نوع صعوبتهم",
      steps: [
        "أرفع النص أو الدرس",
        "اختر صيغة التحويل المطلوبة",
        "حمّل المحتوى المحول"
      ],
      route: "/content-adapter",
      color: "from-green-500 to-green-600"
    },
    {
      id: 4,
      name: "منشئ التمارين العلاجية",
      nameEn: "Therapeutic Exercises",
      icon: "🎯",
      description: "إنشاء تمارين مخصصة للعلاج والدعم",
      what: "منصة تولد تمارين تعليمية مخصصة بناءً على نوع الصعوبة",
      why: "التمارين المخصصة أكثر فعالية من التمارين العامة في تحسين الأداء",
      steps: [
        "حدد نوع الصعوبة",
        "اختر مستوى الصعوبة",
        "ابدأ التمارين والمتابعة"
      ],
      route: "/therapeutic-exercises",
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 5,
      name: "تقرير التقدم الفردي",
      nameEn: "Follow-up Report",
      icon: "📊",
      description: "تقارير مفصلة عن تقدم كل تلميذ",
      what: "نظام يتابع تقدم التلميذ ويولد تقارير شاملة عن نقاط القوة والضعف",
      why: "المتابعة المنتظمة تساعد على قياس التحسن وتعديل الاستراتيجيات",
      steps: [
        "اختر التلميذ والفترة الزمنية",
        "اعرض التقرير المفصل",
        "شارك التقرير مع الأهل"
      ],
      route: "/follow-up-report",
      color: "from-pink-500 to-pink-600"
    },
    {
      id: 6,
      name: "المقيّم التنبؤي",
      nameEn: "Progress Evaluator",
      icon: "🔮",
      description: "توقع التحسن المستقبلي بناءً على البيانات الحالية",
      what: "أداة تستخدم الذكاء الاصطناعي للتنبؤ بمسار تطور التلميذ",
      why: "معرفة التوقعات تساعد على تعديل الخطط والتدخلات في الوقت المناسب",
      steps: [
        "ادخل بيانات التقدم الحالية",
        "اختر الفترة الزمنية للتنبؤ",
        "اقرأ التوقعات والتوصيات"
      ],
      route: "/progress-evaluator",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: 7,
      name: "لوحة متابعة التلاميذ",
      nameEn: "Student Dashboard",
      icon: "👥",
      description: "لوحة تحكم شاملة لمتابعة مجموعة التلاميذ",
      what: "لوحة تحكم تعرض بيانات جميع التلاميذ في مكان واحد",
      why: "إدارة مجموعات التلاميذ تصبح أسهل وأسرع مع لوحة تحكم موحدة",
      steps: [
        "أضف التلاميذ إلى الفصل",
        "تابع تقدم الجميع في لوحة واحدة",
        "اتخذ قرارات تعليمية مستنيرة"
      ],
      route: "/student-dashboard",
      color: "from-teal-500 to-teal-600"
    }
  ];

  const difficulties = [
    {
      name: "عسر القراءة",
      nameEn: "Dyslexia",
      icon: "📖",
      description: "صعوبة في القراءة والتهجئة وفك رموز الكلمات",
      symptoms: "تأخر في القراءة، صعوبة في التهجئة، الخلط بين الأحرف المتشابهة"
    },
    {
      name: "عسر الكتابة",
      nameEn: "Dysgraphia",
      icon: "✏️",
      description: "صعوبة في الكتابة اليدوية والتنسيق الحركي",
      symptoms: "خط غير منتظم، صعوبة في الإمساك بالقلم، بطء في الكتابة"
    },
    {
      name: "عسر الحساب",
      nameEn: "Dyscalculia",
      icon: "🔢",
      description: "صعوبة في فهم الأرقام والعمليات الحسابية",
      symptoms: "صعوبة في العد، عدم فهم المفاهيم الرياضية، الخلط بين الأرقام"
    },
    {
      name: "اضطراب التركيز",
      nameEn: "ADHD",
      icon: "⚡",
      description: "صعوبة في التركيز والانتباه المستمر",
      symptoms: "عدم القدرة على التركيز، الحركة المستمرة، النسيان المتكرر"
    }
  ];

  const testimonials = [
    {
      name: "فاطمة محمود",
      role: "معلمة رياضيات",
      school: "مدرسة الأمل الخاصة - تونس",
      text: "أداة محلل الخط ساعدتني على اكتشاف أن أحد طلابي يعاني من عسر الكتابة. بفضل التوصيات، تحسن أداؤه بنسبة 60% في شهر واحد فقط!",
      rating: 5
    },
    {
      name: "محمد علي",
      role: "مدرس لغة عربية",
      school: "مدرسة النجاح - المغرب",
      text: "المرافق البيداغوجي الفردي غيّر طريقة تدريسي تماماً. الآن أستطيع تقديم دعم مخصص لكل تلميذ بدون إرهاق إضافي.",
      rating: 5
    },
    {
      name: "سارة خالد",
      role: "أخصائية نفسية",
      school: "مركز التطور - الجزائر",
      text: "استخدمت لوحة المتابعة مع 30 تلميذ، والنتائج مذهلة. التقارير المفصلة ساعدتني على تقديم توصيات أدق للمعلمين والأهالي.",
      rating: 5
    }
  ];

  const audience = [
    {
      title: "المعلمون والمعلمات",
      description: "في تونس والمغرب والجزائر والخليج",
      icon: "👨‍🏫",
      details: "للكشف المبكر عن صعوبات التعلم وتقديم الدعم الفردي"
    },
    {
      title: "المدارس الخاصة والمراكز التعليمية",
      description: "لمتابعة مجموعات التلاميذ",
      icon: "🏫",
      details: "إدارة شاملة لجميع التلاميذ ذوي الصعوبات في مكان واحد"
    },
    {
      title: "المرافقون والأخصائيون النفسيون",
      description: "للدعم الفردي المتخصص",
      icon: "👨‍⚕️",
      details: "أدوات احترافية لتقييم وتتبع التطور"
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                🌟 الوحيدة في الوطن العربي
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              اكتشف صعوبات التعلم مبكراً — وغيّر مسار حياة تلميذك
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              7 أدوات ذكاء اصطناعي متخصصة لمساعدة المعلم على الكشف المبكر عن صعوبات التعلم وتقديم الدعم المناسب لكل تلميذ
            </p>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">15-20%</div>
                <p className="text-gray-600">من التلاميذ لديهم صعوبات تعلم غير مُشخَّصة</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">80%</div>
                <p className="text-gray-600">يمكن تحسينهم بالكشف المبكر</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">+50%</div>
                <p className="text-gray-600">تحسن في الأداء مع الدعم المناسب</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-lg"
              >
                جرّب محلل الخط مجاناً
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-lg"
              >
                اكتشف الأدوات السبعة
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Difficulties Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              الصعوبات التي تكشفها وتدعمها أدواتنا
            </h2>
            <p className="text-gray-600 text-lg">
              نحن متخصصون في الكشف المبكر عن أربعة أنواع رئيسية من صعوبات التعلم
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {difficulties.map((difficulty, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{difficulty.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{difficulty.name}</h3>
                <p className="text-sm text-gray-500 mb-3 font-semibold">{difficulty.nameEn}</p>
                <p className="text-gray-700 mb-4">{difficulty.description}</p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-purple-900">
                    <strong>المؤشرات:</strong> {difficulty.symptoms}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Tools Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              7 أدوات متكاملة — من الكشف إلى المتابعة
            </h2>
            <p className="text-gray-600 text-lg">
              كل أداة مصممة لتحقيق هدف محدد في رحلة الدعم التعليمي
            </p>
          </div>

          <div className="space-y-4">
            {tools.map((tool) => (
              <div key={tool.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <button
                  onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-right">
                    <div className="text-3xl">{tool.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
                      <p className="text-gray-600 text-sm">{tool.description}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedTool === tool.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedTool === tool.id && (
                  <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-6">
                    {/* What */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">ماذا تفعل هذه الأداة؟</h4>
                      <p className="text-gray-700">{tool.what}</p>
                    </div>

                    {/* Why */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">لماذا تحتاجها؟</h4>
                      <p className="text-gray-700">{tool.why}</p>
                    </div>

                    {/* How */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">كيف تستخدمها؟</h4>
                      <ol className="space-y-2">
                        {tool.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-gray-700">
                            <span className="font-bold text-purple-600 flex-shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Button */}
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      فتح الأداة
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لمن هذا المنتج؟
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {audience.map((item, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-purple-600 font-semibold mb-3">{item.description}</p>
                <p className="text-gray-600">{item.details}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ماذا يقول المعلمون؟
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border-l-4 border-purple-600">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-purple-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-600">{testimonial.school}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#EEEDFE" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ابدأ بـ 100 نقطة مجانية — جرّب الأدوات السبعة اليوم
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            لا تحتاج إلى بطاقة ائتمان. ابدأ الآن واكتشف كيف يمكن لـ Leader Inclusion تغيير طريقة تدريسك.
          </p>
          <Button 
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 text-lg rounded-lg"
          >
            سجّل مجاناً الآن
          </Button>
          <p className="text-sm text-gray-600 mt-6">
            ⚠️ هذه الأدوات للكشف المبكر والدعم التربوي — وليست تشخيصاً طبياً
          </p>
        </div>
      </section>
    </div>
  );
}
