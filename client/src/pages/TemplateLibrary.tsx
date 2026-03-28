import { useState } from "react";
import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Clock, FileText, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import useI18n from "@/i18n";


export default function TemplateLibrary() {
  const { t, lang, isRTL, dir } = useI18n();
  const [, setLocation] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const { data: templates, isLoading } = trpc.templates.list.useQuery({
    educationLevel: selectedLevel !== "all" ? (selectedLevel as any) : undefined,
    language: selectedLanguage !== "all" ? (selectedLanguage as any) : undefined,
  });

  const incrementUsage = trpc.templates.incrementUsage.useMutation();

  const handleUseTemplate = (templateId: number) => {
    incrementUsage.mutate({ id: templateId });
    setLocation(`/assistant?templateId=${templateId}`);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "primary": return "bg-blue-100 text-blue-800";
      case "middle": return "bg-green-100 text-green-800";
      case "secondary": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "primary": return "ابتدائي";
      case "middle": return "إعدادي";
      case "secondary": return "ثانوي";
      default: return level;
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "arabic": return "عربية";
      case "french": return "فرنسية";
      case "english": return "إنجليزية";
      default: return lang;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">مكتبة القوالب الجاهزة</h1>
          <p className="text-gray-600 text-lg">
            اختر قالباً جاهزاً لتسريع عملية إنشاء المذكرات البيداغوجية
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى التعليمي
              </label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="primary">ابتدائي</SelectItem>
                  <SelectItem value="middle">إعدادي</SelectItem>
                  <SelectItem value="secondary">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللغة
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع اللغات</SelectItem>
                  <SelectItem value="arabic">عربية</SelectItem>
                  <SelectItem value="french">فرنسية</SelectItem>
                  <SelectItem value="english">إنجليزية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLevel("all");
                  setSelectedLanguage("all");
                }}
                className="w-full"
              >
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl font-bold text-gray-900 flex-1">
                      {template.templateName}
                    </CardTitle>
                    <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 me-2" />
                  </div>
                  <CardDescription className="text-gray-600">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getLevelBadgeColor(template.educationLevel)}>
                        {getLevelLabel(template.educationLevel)}
                      </Badge>
                      <Badge variant="outline">
                        {getLanguageLabel(template.language)}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {template.grade && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{template.grade}</span>
                        </div>
                      )}
                      {template.subject && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{template.subject}</span>
                        </div>
                      )}
                      {template.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{template.duration} دقيقة</span>
                        </div>
                      )}
                    </div>

                    {/* Usage count */}
                    <div className="text-xs text-gray-500">
                      استُخدم {template.usageCount} مرة
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4 ms-2" />
                    معاينة
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    استخدام القالب
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد قوالب متاحة
            </h3>
            <p className="text-gray-500">
              جرب تغيير الفلاتر للعثور على قوالب أخرى
            </p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {previewTemplate?.templateName}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6 mt-4">
              {/* Meta info */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getLevelBadgeColor(previewTemplate.educationLevel)}>
                  {getLevelLabel(previewTemplate.educationLevel)}
                </Badge>
                <Badge variant="outline">
                  {getLanguageLabel(previewTemplate.language)}
                </Badge>
                {previewTemplate.grade && (
                  <Badge variant="secondary">{previewTemplate.grade}</Badge>
                )}
                {previewTemplate.subject && (
                  <Badge variant="secondary">{previewTemplate.subject}</Badge>
                )}
              </div>

              {/* Duration */}
              {previewTemplate.duration && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">المدة: {previewTemplate.duration} دقيقة</span>
                </div>
              )}

              {/* Objectives */}
              {previewTemplate.lessonObjectives && (
                <div>
                  <h3 className="font-bold text-lg mb-2">الأهداف:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {previewTemplate.lessonObjectives}
                  </p>
                </div>
              )}

              {/* Materials */}
              {previewTemplate.materials && (
                <div>
                  <h3 className="font-bold text-lg mb-2">الوسائل والأدوات:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {previewTemplate.materials}
                  </p>
                </div>
              )}

              {/* Introduction */}
              {previewTemplate.introduction && (
                <div>
                  <h3 className="font-bold text-lg mb-2">التمهيد:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {previewTemplate.introduction}
                  </p>
                </div>
              )}

              {/* Main Activities */}
              {previewTemplate.mainActivities && previewTemplate.mainActivities.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-2">الأنشطة الرئيسية:</h3>
                  <div className="space-y-4">
                    {previewTemplate.mainActivities.map((activity: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <Badge variant="outline">{activity.duration} دقيقة</Badge>
                        </div>
                        <p className="text-gray-700">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conclusion */}
              {previewTemplate.conclusion && (
                <div>
                  <h3 className="font-bold text-lg mb-2">الخاتمة:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {previewTemplate.conclusion}
                  </p>
                </div>
              )}

              {/* Evaluation */}
              {previewTemplate.evaluation && (
                <div>
                  <h3 className="font-bold text-lg mb-2">التقييم:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {previewTemplate.evaluation}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    handleUseTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                >
                  استخدام هذا القالب
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
