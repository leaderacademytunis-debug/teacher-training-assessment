import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'wouter';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'mechanics' | 'rewards' | 'conditions' | 'troubleshooting';
}

const faqData: FAQItem[] = [
  // الأسئلة العامة
  {
    id: 'general-1',
    category: 'general',
    question: 'ما هو نظام الإحالات (Referral System)؟',
    answer: 'نظام الإحالات هو برنامج يسمح لك بدعوة معلمين آخرين للانضمام إلى منصة Leader Academy. عندما ينضم معلم جديد باستخدام رابط إحالتك، تحصل أنت والمعلم الجديد على مكافآت رصيد إضافية تساعدكم على الوصول إلى المزيد من الدورات والأدوات المتقدمة.',
  },
  {
    id: 'general-2',
    category: 'general',
    question: 'لماذا يجب أن أشارك في نظام الإحالات؟',
    answer: 'المشاركة في نظام الإحالات توفر لك فوائد متعددة: (1) الحصول على رصيد إضافي لكل معلم تحيله بنجاح، (2) مساعدة زملائك المعلمين على اكتشاف منصة تطويرية قيمة، (3) بناء شبكة من المعلمين المتطورين في مدرستك أو منطقتك، (4) الوصول إلى ميزات حصرية عند تحقيق أهداف معينة.',
  },
  {
    id: 'general-3',
    category: 'general',
    question: 'هل نظام الإحالات مجاني؟',
    answer: 'نعم، نظام الإحالات مجاني تماماً. لا توجد رسوم أو تكاليف لإنشاء روابط إحالة أو لاستقبال المكافآت. جميع المعلمين يمكنهم المشاركة في البرنامج دون أي تكلفة إضافية.',
  },
  {
    id: 'general-4',
    category: 'general',
    question: 'هل يمكنني استخدام نظام الإحالات إذا كنت مشتركاً مجانياً؟',
    answer: 'نعم، جميع المعلمين بما فيهم المشتركون المجانيون يمكنهم إنشاء روابط إحالة ودعوة زملائهم. لا توجد قيود على استخدام النظام بناءً على نوع الاشتراك.',
  },

  // آلية العمل
  {
    id: 'mechanics-1',
    category: 'mechanics',
    question: 'كيف أنشئ رابط إحالة؟',
    answer: 'إنشاء رابط إحالة بسيط جداً: (1) انتقل إلى صفحة "دعوة الأصدقاء" من القائمة الجانبية، (2) أدخل عنوان البريد الإلكتروني للمعلم الذي تريد دعوته، (3) أضف رسالة شخصية تشرح لماذا تنصحه بالمنصة (اختياري)، (4) انقر على "إنشاء رابط إحالة"، (5) سيتم توليد رابط فريد يمكنك مشاركته عبر البريد الإلكتروني أو الرسائل أو وسائل التواصل الاجتماعي.',
  },
  {
    id: 'mechanics-2',
    category: 'mechanics',
    question: 'كم مدة صلاحية رابط الإحالة؟',
    answer: 'رابط الإحالة صالح لمدة 30 يوماً من تاريخ إنشاؤه. بعد انتهاء هذه الفترة، لن يكون الرابط نشطاً ولن تتمكن من استخدامه. إذا كنت تريد دعوة نفس الشخص بعد انتهاء الصلاحية، يمكنك إنشاء رابط إحالة جديد.',
  },
  {
    id: 'mechanics-3',
    category: 'mechanics',
    question: 'كيف يستخدم المعلم الجديد رابط الإحالة؟',
    answer: 'عندما ينقر المعلم الجديد على رابط الإحالة: (1) سيتم نقله إلى صفحة التسجيل، (2) سيجد رمز الإحالة الفريد مدرجاً تلقائياً في النموذج، (3) يملأ بيانات التسجيل العادية (الاسم، البريد الإلكتروني، كلمة المرور، إلخ)، (4) عند إكمال التسجيل، سيتم تفعيل الإحالة تلقائياً.',
  },
  {
    id: 'mechanics-4',
    category: 'mechanics',
    question: 'هل يمكن استخدام رابط إحالة واحد لأشخاص متعددين؟',
    answer: 'لا، كل رابط إحالة مخصص لشخص واحد فقط. عندما يسجل المعلم الجديد باستخدام الرابط، يتم تفعيل الإحالة ولا يمكن استخدام نفس الرابط مرة أخرى. إذا كنت تريد دعوة عدة معلمين، يجب أن تنشئ رابط إحالة منفصل لكل شخص.',
  },
  {
    id: 'mechanics-5',
    category: 'mechanics',
    question: 'ماذا يحدث إذا لم يسجل المعلم الجديد قبل انتهاء صلاحية الرابط؟',
    answer: 'إذا لم يسجل المعلم قبل انتهاء صلاحية الرابط (30 يوماً)، لن تحصل على المكافأة. سيكون عليك إنشاء رابط إحالة جديد وإرساله مرة أخرى. يمكنك تتبع حالة الإحالات من لوحة تحكم الإحالات.',
  },

  // المكافآت
  {
    id: 'rewards-1',
    category: 'rewards',
    question: 'كم عدد الرصيد الذي أحصل عليه لكل إحالة ناجحة؟',
    answer: 'عند إحالة معلم بنجاح، تحصل على المكافآت التالية: (1) أنت (المحيل): 10 جذاذات رصيد، (2) المعلم الجديد (المحال): 5 جذاذات رصيد. المجموع الكلي للمكافآت هو 15 جذاذة لكل إحالة ناجحة.',
  },
  {
    id: 'rewards-2',
    category: 'rewards',
    question: 'متى أحصل على المكافآت؟',
    answer: 'المكافآت تُمنح تلقائياً فور اكتمال التسجيل: (1) عندما ينقر المعلم الجديد على رابط الإحالة ويسجل بنجاح، يتم تفعيل الإحالة على الفور، (2) يتم إضافة 10 جذاجات إلى رصيدك فوراً، (3) يتم إضافة 5 جذاجات إلى رصيد المعلم الجديد فوراً. يمكنك رؤية المكافآت في لوحة تحكم الإحالات والرصيد الإجمالي في حسابك.',
  },
  {
    id: 'rewards-3',
    category: 'rewards',
    question: 'هل هناك حد أقصى لعدد الإحالات التي يمكنني القيام بها؟',
    answer: 'لا، لا يوجد حد أقصى لعدد الإحالات. يمكنك دعوة عدد غير محدود من المعلمين والحصول على مكافآت لكل واحد منهم. كلما زاد عدد الإحالات الناجحة، زاد الرصيد الذي تجمعه.',
  },
  {
    id: 'rewards-4',
    category: 'rewards',
    question: 'كيف أستخدم الرصيد المكتسب من الإحالات؟',
    answer: 'الرصيد المكتسب من الإحالات يُضاف إلى رصيدك الإجمالي ويمكنك استخدامه لـ: (1) الوصول إلى الدورات المتقدمة، (2) استخدام أدوات Leader Studio (الخريطة الذهنية، الاختبارات، العروض التقديمية)، (3) الوصول إلى المحتوى الحصري والمميز، (4) تحسين تجربتك على المنصة. الرصيد يُستخدم تلقائياً عند استخدام الأدوات والدورات.',
  },
  {
    id: 'rewards-5',
    category: 'rewards',
    question: 'هل يمكن تحويل الرصيد إلى أموال حقيقية؟',
    answer: 'لا، الرصيد لا يمكن تحويله إلى أموال حقيقية. الرصيد هو عملة رقمية داخل المنصة تُستخدم فقط للوصول إلى الدورات والأدوات. لكن يمكنك استخدام الرصيد لتوفير المال على الاشتراكات المدفوعة إذا كانت متاحة.',
  },

  // الشروط والقيود
  {
    id: 'conditions-1',
    category: 'conditions',
    question: 'ما هي شروط الحصول على مكافآت الإحالة؟',
    answer: 'لكي تحصل على مكافآت الإحالة، يجب استيفاء الشروط التالية: (1) يجب أن تكون لديك حساب نشط على منصة Leader Academy، (2) يجب أن يسجل المعلم الجديد باستخدام رابط إحالتك مباشرة، (3) يجب أن يكمل المعلم الجديد عملية التسجيل بالكامل (الاسم، البريد الإلكتروني، كلمة المرور، إلخ)، (4) يجب ألا يكون المعلم الجديد قد سجل مسبقاً على المنصة، (5) يجب أن يكون رابط الإحالة صالحاً ولم تنته صلاحيته.',
  },
  {
    id: 'conditions-2',
    category: 'conditions',
    question: 'هل يمكنني إحالة نفس الشخص مرتين؟',
    answer: 'لا، كل معلم يمكن إحالته مرة واحدة فقط. إذا حاول نفس الشخص التسجيل مرة أخرى باستخدام رابط إحالة مختلف، لن تحصل على مكافأة. النظام يتتبع المعلمين الذين تم إحالتهم بالفعل ويمنع الإحالات المكررة.',
  },
  {
    id: 'conditions-3',
    category: 'conditions',
    question: 'هل يمكنني إحالة معلم من نفس المدرسة أو المنطقة؟',
    answer: 'نعم، يمكنك إحالة معلمين من نفس المدرسة أو المنطقة أو حتى من دول مختلفة. لا توجد قيود جغرافية على الإحالات. في الواقع، نشجع بناء شبكات من المعلمين المتطورين في مدارسك ومناطقك.',
  },
  {
    id: 'conditions-4',
    category: 'conditions',
    question: 'هل يمكنني إحالة مدير المدرسة أو المشرف التربوي؟',
    answer: 'نعم، يمكنك إحالة أي معلم أو مشرف تربوي أو مدير مدرسة. جميع الأدوار يمكنها الاستفادة من منصة Leader Academy والمشاركة في نظام الإحالات.',
  },
  {
    id: 'conditions-5',
    category: 'conditions',
    question: 'ماذا يحدث إذا لم يكمل المعلم الجديد التسجيل؟',
    answer: 'إذا لم يكمل المعلم الجديد عملية التسجيل (مثلاً، أغلق الصفحة قبل الانتهاء)، لن تحصل على المكافأة. يجب أن يكمل المعلم التسجيل بالكامل لتفعيل الإحالة. يمكن للمعلم محاولة التسجيل مرة أخرى باستخدام نفس الرابط.',
  },

  // استكشاف الأخطاء
  {
    id: 'troubleshooting-1',
    category: 'troubleshooting',
    question: 'لم أتلقَ المكافآت بعد التسجيل. ماذا أفعل؟',
    answer: 'إذا لم تتلقَ المكافآت بعد التسجيل، جرب الخطوات التالية: (1) تحقق من أن المعلم الجديد قد أكمل التسجيل بالكامل، (2) تأكد من أن الرابط الذي استخدمه كان رابط إحالتك الفريد، (3) تحقق من لوحة تحكم الإحالات لرؤية حالة الإحالة، (4) انتظر بضع دقائق - قد تستغرق المكافآت بعض الوقت للظهور، (5) إذا استمرت المشكلة، اتصل بفريق الدعم.',
  },
  {
    id: 'troubleshooting-2',
    category: 'troubleshooting',
    question: 'رابط الإحالة الخاص بي لا يعمل. ماذا أفعل؟',
    answer: 'إذا لم يعمل رابط الإحالة، جرب ما يلي: (1) تحقق من أن الرابط لم تنته صلاحيته (30 يوماً)، (2) انسخ الرابط بشكل صحيح دون حذف أي أحرف، (3) جرب فتح الرابط في متصفح مختلف، (4) امسح ذاكرة التخزين المؤقت للمتصفح وحاول مرة أخرى، (5) تأكد من أن لديك اتصال إنترنت مستقر، (6) إذا استمرت المشكلة، أنشئ رابط إحالة جديد.',
  },
  {
    id: 'troubleshooting-3',
    category: 'troubleshooting',
    question: 'المعلم الجديد يقول أنه لا يرى رمز الإحالة في نموذج التسجيل.',
    answer: 'إذا لم يرَ المعلم الجديد رمز الإحالة في النموذج: (1) تأكد من أنه استخدم الرابط الكامل من البريد الإلكتروني أو الرسالة، (2) جرب نسخ الرابط مرة أخرى والتأكد من عدم فقدان أي أحرف، (3) امسح ذاكرة التخزين المؤقت وحاول مرة أخرى، (4) جرب متصفح مختلف، (5) إذا استمرت المشكلة، أنشئ رابط إحالة جديد وأرسله مرة أخرى.',
  },
  {
    id: 'troubleshooting-4',
    category: 'troubleshooting',
    question: 'كيف أتحقق من حالة الإحالات الخاصة بي؟',
    answer: 'لتتبع حالة الإحالات: (1) انتقل إلى "لوحة تحكم الإحالات" من القائمة الجانبية، (2) ستجد قائمة بجميع الإحالات التي أنشأتها مع حالة كل واحدة (قيد الانتظار، مقبول، مكتمل)، (3) ستجد أيضاً إحصائيات شاملة تشمل عدد الإحالات الناجحة والمكافآت المكتسبة، (4) يمكنك رؤية تاريخ كل إحالة والمكافآت المرتبطة بها.',
  },
  {
    id: 'troubleshooting-5',
    category: 'troubleshooting',
    question: 'هل يمكنني حذف أو إلغاء إحالة؟',
    answer: 'لا، لا يمكن حذف أو إلغاء إحالة بعد إنشاؤها. إذا أنشأت رابط إحالة بالخطأ، يمكنك ببساطة عدم مشاركته. إذا كان لديك مشكلة محددة مع إحالة معينة، يرجى التواصل مع فريق الدعم.',
  },
];

export function ReferralFAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'جميع الأسئلة' },
    { id: 'general', label: 'عام' },
    { id: 'mechanics', label: 'آلية العمل' },
    { id: 'rewards', label: 'المكافآت' },
    { id: 'conditions', label: 'الشروط' },
    { id: 'troubleshooting', label: 'استكشاف الأخطاء' },
  ];

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-emerald-50 text-lg">
            دليل شامل لفهم نظام الإحالات والمكافآت على منصة Leader Academy
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map(item => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-right"
              >
                <ChevronDown
                  className={`w-5 h-5 text-emerald-600 transition-transform flex-shrink-0 ${
                    expandedId === item.id ? 'rotate-180' : ''
                  }`}
                />
                <h3 className="text-lg font-semibold text-slate-900 flex-1 mr-4">
                  {item.question}
                </h3>
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-8 border border-emerald-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">هل لديك أسئلة أخرى؟</h2>
          <p className="text-slate-700 mb-6">
            إذا لم تجد إجابة لسؤالك في هذا القسم، يمكنك التواصل مع فريق الدعم أو الاطلاع على المزيد من الموارد.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/invite-friends')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              ابدأ بدعوة الأصدقاء
            </Button>
            <Button
              onClick={() => navigate('/referral-dashboard')}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              عرض لوحة التحكم
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 mb-2">10</div>
            <p className="text-slate-700 font-medium">جذاجات لكل إحالة</p>
            <p className="text-slate-600 text-sm mt-2">المكافأة التي تحصل عليها كمحيل</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 mb-2">30</div>
            <p className="text-slate-700 font-medium">يوماً</p>
            <p className="text-slate-600 text-sm mt-2">مدة صلاحية رابط الإحالة</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 mb-2">∞</div>
            <p className="text-slate-700 font-medium">بدون حد</p>
            <p className="text-slate-600 text-sm mt-2">عدد الإحالات التي يمكنك إجراؤها</p>
          </div>
        </div>
      </div>
    </div>
  );
}
