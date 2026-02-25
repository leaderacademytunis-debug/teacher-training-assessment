import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Copy, Star, User, Calendar, Home } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function SharedLibrary() {
  const [filters, setFilters] = useState({
    educationLevel: undefined as "primary" | "middle" | "secondary" | undefined,
    grade: undefined as string | undefined,
    subject: undefined as string | undefined,
    minRating: undefined as number | undefined,
  });

  const { data: sheets, isLoading, refetch } = trpc.pedagogicalSheets.listSharedSheets.useQuery(filters);
  const cloneSheet = trpc.pedagogicalSheets.cloneSheet.useMutation({
    onSuccess: () => {
      toast.success("تم نسخ المذكرة إلى مذكراتك الشخصية بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const handleClone = (sharedSheetId: number) => {
    if (confirm("هل تريد نسخ هذه المذكرة إلى مذكراتك الشخصية؟")) {
      cloneSheet.mutate({ sharedSheetId });
    }
  };

  const grades = {
    primary: ["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة", "السنة السادسة"],
    middle: ["السنة السابعة", "السنة الثامنة", "السنة التاسعة"],
    secondary: ["السنة الأولى ثانوي", "السنة الثانية ثانوي", "السنة الثالثة ثانوي", "السنة الرابعة ثانوي"],
  };

  const subjects = [
    "اللغة العربية", "الرياضيات", "الفرنسية", "الإنجليزية", "العلوم", "التاريخ", "الجغرافيا",
    "التربية الإسلامية", "التربية المدنية", "الفيزياء", "علوم الحياة والأرض", "الفلسفة",
    "التربية التكنولوجية", "الإعلامية", "التربية الموسيقية", "التربية التشكيلية", "التربية البدنية"
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              العودة إلى الرئيسية
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-right mb-2">المكتبة المشتركة للمذكرات البيداغوجية</h1>
        <p className="text-muted-foreground text-right">
          تصفح واستفد من مذكرات زملائك المدرسين
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-right">تصفية النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-right">المستوى التعليمي</label>
              <Select
                value={filters.educationLevel}
                onValueChange={(value: any) => setFilters({ ...filters, educationLevel: value === "all" ? undefined : value, grade: undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="primary">ابتدائي</SelectItem>
                  <SelectItem value="middle">إعدادي</SelectItem>
                  <SelectItem value="secondary">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.educationLevel && (
              <div>
                <label className="text-sm font-medium mb-2 block text-right">الصف</label>
                <Select
                  value={filters.grade}
                  onValueChange={(value) => setFilters({ ...filters, grade: value === "all" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {grades[filters.educationLevel].map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block text-right">المادة</label>
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters({ ...filters, subject: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-right">التقييم الأدنى</label>
              <Select
                value={filters.minRating?.toString()}
                onValueChange={(value) => setFilters({ ...filters, minRating: value === "all" ? undefined : Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ فأكثر</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ فأكثر</SelectItem>
                  <SelectItem value="2">⭐⭐ فأكثر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : sheets && sheets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet) => (
            <Card key={sheet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-right flex-1">{sheet.lessonTitle}</CardTitle>
                  {sheet.ratingCount > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {Number(sheet.averageRating).toFixed(1)}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <span>{sheet.subject}</span>
                    <span>•</span>
                    <span>{sheet.grade}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span>{sheet.schoolYear}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {sheet.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy className="h-4 w-4" />
                      {sheet.cloneCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{sheet.publisherName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/shared-library/${sheet.id}`}>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <BookOpen className="h-4 w-4" />
                      عرض التفاصيل
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleClone(sheet.id)}
                    disabled={cloneSheet.isPending}
                  >
                    <Copy className="h-4 w-4" />
                    نسخ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد مذكرات مشتركة بهذه المعايير</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
