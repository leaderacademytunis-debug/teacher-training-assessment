import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, ClipboardList, BookOpen, Plus } from "lucide-react";
import { PedagogicalSheetFormEnhanced } from "@/components/PedagogicalSheetFormEnhanced";
import { LessonPlanFormEnhanced } from "@/components/LessonPlanFormEnhanced";
import { TeacherExamFormEnhanced } from "@/components/TeacherExamFormEnhanced";
import { ReferenceDocumentsManager } from "@/components/ReferenceDocumentsManager";

function TeacherTools() {
  const [activeTab, setActiveTab] = useState("sheets");
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);

  const { data: sheets = [], refetch: refetchSheets } = trpc.pedagogicalSheets.list.useQuery();
  const { data: plans = [], refetch: refetchPlans } = trpc.lessonPlans.list.useQuery();
  const { data: exams = [], refetch: refetchExams } = trpc.teacherExams.list.useQuery();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">أدوات المدرس</h1>
        <p className="text-center text-muted-foreground">
          أدوات شاملة لمساعدة المدرسين التونسيين في إعداد المذكرات والدروس والاختبارات
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="sheets" className="gap-2">
            <FileText className="h-4 w-4" />
            المذكرات البيداغوجية
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <Calendar className="h-4 w-4" />
            تخطيط الدروس
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            الاختبارات
          </TabsTrigger>
          <TabsTrigger value="references" className="gap-2">
            <BookOpen className="h-4 w-4" />
            المراجع الرسمية
          </TabsTrigger>
        </TabsList>

        {/* المذكرات البيداغوجية */}
        <TabsContent value="sheets">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">المذكرات البيداغوجية</h2>
              <Button onClick={() => setShowSheetForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء مذكرة جديدة
              </Button>
            </div>

            {showSheetForm && (
              <PedagogicalSheetFormEnhanced
                onClose={() => setShowSheetForm(false)}
                onSuccess={() => {
                  setShowSheetForm(false);
                  refetchSheets();
                }}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sheets.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    لا توجد مذكرات بيداغوجية. انقر على "إنشاء مذكرة جديدة" للبدء.
                  </CardContent>
                </Card>
              ) : (
                sheets.map((sheet) => (
                  <Card key={sheet.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{sheet.lessonTitle}</CardTitle>
                      <CardDescription>
                        {sheet.grade} - {sheet.subject}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>السنة الدراسية:</strong> {sheet.schoolYear}</p>
                        <p><strong>المستوى:</strong> {
                          sheet.educationLevel === "primary" ? "ابتدائي" :
                          sheet.educationLevel === "middle" ? "إعدادي" : "ثانوي"
                        }</p>
                        <p><strong>المدة:</strong> {sheet.duration} دقيقة</p>
                        <p><strong>الحالة:</strong> {
                          sheet.status === "draft" ? "مسودة" : "مكتملة"
                        }</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تصدير
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* تخطيط الدروس */}
        <TabsContent value="plans">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">تخطيط الدروس</h2>
              <Button onClick={() => setShowPlanForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء خطة جديدة
              </Button>
            </div>

            {showPlanForm && (
              <LessonPlanFormEnhanced
                onClose={() => setShowPlanForm(false)}
                onSuccess={() => {
                  setShowPlanForm(false);
                  refetchPlans();
                }}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    لا توجد خطط دروس. انقر على "إنشاء خطة جديدة" للبدء.
                  </CardContent>
                </Card>
              ) : (
                plans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.planTitle}</CardTitle>
                      <CardDescription>
                        {plan.grade} - {plan.subject}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>السنة الدراسية:</strong> {plan.schoolYear}</p>
                        <p><strong>عدد الدروس:</strong> {plan.totalLessons}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تصدير
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* الاختبارات */}
        <TabsContent value="exams">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الاختبارات</h2>
              <Button onClick={() => setShowExamForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء اختبار جديد
              </Button>
            </div>

            {showExamForm && (
              <TeacherExamFormEnhanced
                onClose={() => setShowExamForm(false)}
                onSuccess={() => {
                  setShowExamForm(false);
                  refetchExams();
                }}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exams.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    لا توجد اختبارات. انقر على "إنشاء اختبار جديد" للبدء.
                  </CardContent>
                </Card>
              ) : (
                exams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{exam.examTitle}</CardTitle>
                      <CardDescription>
                        {exam.grade} - {exam.subject}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>السنة الدراسية:</strong> {exam.schoolYear}</p>
                        <p><strong>النوع:</strong> {
                          exam.examType === "formative" ? "تكويني" :
                          exam.examType === "summative" ? "ختامي" : "تشخيصي"
                        }</p>
                        <p><strong>المدة:</strong> {exam.duration} دقيقة</p>
                        <p><strong>المجموع:</strong> {exam.totalPoints} نقطة</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تصدير
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* المراجع الرسمية */}
        <TabsContent value="references">
          <ReferenceDocumentsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TeacherTools;
