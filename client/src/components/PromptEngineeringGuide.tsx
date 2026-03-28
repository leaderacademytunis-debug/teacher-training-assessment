import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Target, BookOpen, CheckCircle2 } from "lucide-react";

interface PromptEngineeringGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptEngineeringGuide({ open, onOpenChange }: PromptEngineeringGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            دليل هندسة الأوامر (Prompt Engineering)
          </DialogTitle>
          <DialogDescription>
            تعلم كيفية كتابة أوامر فعّالة للحصول على أفضل النتائج من الذكاء الاصطناعي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* مبادئ أساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                المبادئ الأساسية لكتابة Prompt فعّال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">كن محدداً وواضحاً</p>
                  <p className="text-sm text-gray-600">حدد بدقة ما تريده: المستوى التعليمي، المادة، الموضوع، والأهداف</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">استخدم السياق التعليمي</p>
                  <p className="text-sm text-gray-600">اذكر المنهج التونسي والمراجع الرسمية لضمان التوافق</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">حدد الأهداف البيداغوجية</p>
                  <p className="text-sm text-gray-600">اذكر الكفايات والمهارات المستهدفة بوضوح</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أمثلة عملية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                أمثلة على Prompts فعّالة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* مثال 1 */}
              <div className="border-e-4 border-green-500 pe-4 bg-green-50 p-3 rounded">
                <p className="font-semibold text-green-800 mb-2">✅ مثال جيد:</p>
                <p className="text-sm mb-2">
                  "أنشئ مذكرة بيداغوجية لدرس الرياضيات للسنة الثالثة ابتدائي حول موضوع 'الأعداد العشرية' 
                  تتضمن: أهداف تعليمية واضحة، نشاط تمهيدي تفاعلي، 3 أنشطة رئيسية متدرجة الصعوبة، 
                  وتقييم تكويني. يجب أن تتوافق مع المنهج التونسي."
                </p>
                <p className="text-xs text-green-700">
                  <strong>لماذا فعّال؟</strong> محدد، يذكر المستوى والموضوع، يحدد المكونات المطلوبة، ويشير للمنهج
                </p>
              </div>

              {/* مثال 2 */}
              <div className="border-e-4 border-red-500 pe-4 bg-red-50 p-3 rounded">
                <p className="font-semibold text-red-800 mb-2">❌ مثال ضعيف:</p>
                <p className="text-sm mb-2">
                  "أريد مذكرة عن الرياضيات"
                </p>
                <p className="text-xs text-red-700">
                  <strong>لماذا ضعيف؟</strong> غير محدد، لا يذكر المستوى أو الموضوع أو الأهداف
                </p>
              </div>

              {/* مثال 3 */}
              <div className="border-e-4 border-green-500 pe-4 bg-green-50 p-3 rounded">
                <p className="font-semibold text-green-800 mb-2">✅ مثال ممتاز للأهداف:</p>
                <p className="text-sm">
                  "الأهداف التعليمية: أن يتمكن المتعلم من التعرف على الأعداد العشرية (معرفي)، 
                  أن يقارن بين عددين عشريين (مهاري)، أن يقدّر أهمية الدقة في الحسابات اليومية (وجداني)"
                </p>
                <p className="text-xs text-green-700 mt-2">
                  <strong>لماذا ممتاز؟</strong> يغطي المجالات الثلاثة (معرفي، مهاري، وجداني) بصيغة إجرائية واضحة
                </p>
              </div>
            </CardContent>
          </Card>

          {/* نصائح إضافية */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 نصائح ذهبية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-900">
              <p>• استخدم الأفعال الإجرائية في الأهداف: يتعرف، يحلل، يطبق، يقيّم...</p>
              <p>• اذكر المدة الزمنية المتوقعة للدرس</p>
              <p>• حدد الوسائل التعليمية المتاحة (سبورة، حاسوب، وسائل تعليمية...)</p>
              <p>• اطلب أنشطة متنوعة (فردية، جماعية، تفاعلية)</p>
              <p>• لا تنسَ التقييم التكويني والختامي</p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              فهمت، شكراً!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
