'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, BookOpen, Brain, Calculator, Focus, BarChart3, Users, FileText, CheckCircle2, X } from "lucide-react";

export default function Inclusion() {
  const [expandedTool, setExpandedTool] = useState<number | null>(null);

  const tools = [
    {
      id: 1,
      name: "محلل الخط اليدوي",
      nameEn: "Handwriting Analyzer",
      icon: "pen",
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
      icon: "teacher",
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
      icon: "book",
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
      icon: "target",
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
      icon: "chart",
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
      icon: "crystal",
      description: "توقع التحسن المستقبلي بناءً على البيانات الحالية",
      what: "أداة تستخدم الذكاء الاصطناعي للتنبؤ بمسار تطور التلميذ",
      why: "معرفة التوقعات تساعد على تعديل الخطط والتدخلات في الوقت المناسب",
      steps: [
        "ادخل بيانات التقدم الحالية",
        "اختر الفترة الزمنية للتنبؤ",
        "اعرض التوقعات والتوصيات"
      ],
      route: "/progress-evaluator",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: 7,
      name: "لوحة متابعة التلاميذ",
      nameEn: "Student Dashboard",
      icon: "users",
      description: "لوحة تحكم شاملة لمتابعة مجموعات التلاميذ",
      what: "منصة مركزية توفر رؤية شاملة عن تقدم جميع التلاميذ في مكان واحد",
      why: "تسهيل إدارة المجموعات الكبيرة والتركيز على من يحتاج دعم إضافي",
      steps: [
        "أضف التلاميذ إلى الفصل",
        "راقب التقدم في الوقت الفعلي",
        "حدد التلاميذ الذين يحتاجون دعم"
      ],
      route: "/student-dashboard",
      color: "from-teal-500 to-teal-600"
    }
  ];

  const difficulties = [
    {
      name: "عسر القراءة",
      nameEn: "Dyslexia",
      symptoms: "صعوبة في القراءة والتهجئة وفك رموز الكلمات",
      color: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      name: "عسر الكتابة",
      nameEn: "Dysgraphia",
      symptoms: "صعوبة في الكتابة اليدوية والتنسيق الحركي",
      color: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      name: "عسر الحساب",
      nameEn: "Dyscalculia",
      symptoms: "صعوبة في فهم الأرقام والعمليات الحسابية",
      color: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      name: "اضطراب التركيز",
      nameEn: "ADHD",
      symptoms: "عدم القدرة على التركيز، الحركة المستمرة، النسيان المتكرر",
      color: "bg-yellow-100",
      iconColor: "text-yellow-600"
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

  const comparisonData = [
    { feature: "سرعة الكشف", traditional: "أسابيع أو شهور", leader: "دقائق" },
    { feature: "خطة الدعم", traditional: "عامة وغير مخصصة", leader: "مخصصة لكل تلميذ" },
    { feature: "التمارين", traditional: "نفس التمارين للجميع", leader: "تمارين مخصصة وتكيفية" },
    { feature: "متابعة التقدم", traditional: "يدوية وغير منتظمة", leader: "آلية وفورية" },
    { feature: "التقارير", traditional: "بسيطة وغير مفصلة", leader: "شاملة مع توصيات" },
    { feature: "التكلفة", traditional: "مرتفعة جداً", leader: "منخفضة وميسورة" },
    { feature: "التوفر", traditional: "متاح في المدن الكبرى فقط", leader: "متاح أينما كنت" }
  ];

  const renderIcon = (iconType: string) => {
    switch(iconType) {
      case 'pen':
        return <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-purple-600" /></div>;
      case 'teacher':
        return <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>;
      case 'book':
        return <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><BookOpen className="w-6 h-6 text-green-600" /></div>;
      case 'target':
        return <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><Focus className="w-6 h-6 text-orange-600" /></div>;
      case 'chart':
        return <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center"><BarChart3 className="w-6 h-6 text-pink-600" /></div>;
      case 'crystal':
        return <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center"><Brain className="w-6 h-6 text-indigo-600" /></div>;
      case 'users':
        return <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-teal-600" /></div>;
      default:
        return null;
    }
  };

  const renderDifficultyIcon = (index: number) => {
    const icons = [
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-red-600" /></div>,
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><FileText className="w-8 h-8 text-blue-600" /></div>,
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"><Calculator className="w-8 h-8 text-green-600" /></div>,
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center"><Focus className="w-8 h-8 text-yellow-600" /></div>
    ];
    return icons[index];
  };

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

            {/* Free Points Offer */}
            <div className="mt-8 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-3">
              <p className="text-yellow-800 font-semibold">
                ⚡ سجّل الآن واحصل على 100 نقطة مجانية — بدون طلب بطاقة ائتمان
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Difficulties Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              الصعوبات التي تكشفها وتدعمها أدواتنا
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نحن نتخصص في الكشف المبكر عن 4 أنواع رئيسية من صعوبات التعلم
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {difficulties.map((difficulty, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {renderDifficultyIcon(index)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{difficulty.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{difficulty.symptoms}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Tools Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              الأدوات السبعة المتكاملة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              كل أداة مصممة لتحقيق هدف محدد في رحلة الكشف والدعم
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Card 
                key={tool.id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
              >
                <div className="flex items-start gap-4">
                  <div>{renderIcon(tool.icon)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                    
                    {expandedTool === tool.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">ماذا تفعل؟</h4>
                          <p className="text-gray-600">{tool.what}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">لماذا تحتاجها؟</h4>
                          <p className="text-gray-600">{tool.why}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">كيف تستخدمها؟</h4>
                          <ol className="list-decimal list-inside text-gray-600 space-y-1">
                            {tool.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedTool === tool.id ? 'rotate-180' : ''}`} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              لماذا Leader Inclusion وليس الطرق التقليدية؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              مقارنة شاملة بين الطرق التقليدية وحلنا الذكي
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="p-4 text-right">الميزة</th>
                  <th className="p-4 text-center">الطريقة التقليدية</th>
                  <th className="p-4 text-center">Leader Inclusion</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-semibold text-gray-900 border-b">{row.feature}</td>
                    <td className="p-4 text-center text-red-600 border-b">
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" />
                        {row.traditional}
                      </div>
                    </td>
                    <td className="p-4 text-center text-green-600 border-b">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {row.leader}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              لمن هذا المنتج؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              منتج موجه لثلاث فئات رئيسية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {audience.map((item, idx) => (
              <Card key={idx} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-purple-600 font-semibold mb-4">{item.description}</p>
                <p className="text-gray-600">{item.details}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-purple-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            ابدأ بـ 100 نقطة مجانية — جرّب الأدوات السبعة اليوم
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            لا تحتاج إلى بطاقة ائتمان. سجّل الآن واستمتع بالوصول الكامل إلى جميع الأدوات
          </p>
          <Button 
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-8 text-xl rounded-lg font-bold"
          >
            سجّل مجاناً الآن
          </Button>
          <p className="text-sm text-gray-600 mt-8 max-w-2xl mx-auto">
            ⚠️ هذه الأدوات للكشف المبكر والدعم التربوي — وليست تشخيصاً طبياً. استشر متخصصاً طبياً لتشخيص رسمي.
          </p>
        </div>
      </section>
    </div>
  );
}
