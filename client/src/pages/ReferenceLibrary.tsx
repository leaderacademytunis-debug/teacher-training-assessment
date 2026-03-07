import { useState } from "react";
import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Search, Eye, Download } from "lucide-react";
import { toast } from "sonner";

export default function ReferenceLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [educationLevel, setEducationLevel] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [selectedReference, setSelectedReference] = useState<number | null>(null);

  const { data: references, isLoading } = trpc.references.getAll.useQuery({
    educationLevel: educationLevel === "all" ? undefined : educationLevel as "primary" | "middle" | "secondary",
    language: language === "all" ? undefined : language as "arabic" | "french" | "english",
    searchQuery: searchQuery || undefined,
  });

  const handlePreview = (refId: number) => {
    setSelectedReference(refId);
  };

  const selectedRef = references?.find(r => r.id === selectedReference);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <BackButton className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">مكتبة المراجع الرسمية</h1>
        <p className="text-muted-foreground">
          استعرض جميع المراجع الرسمية المتاحة من وزارة التربية التونسية
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في المراجع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger>
                <SelectValue placeholder="المرحلة التعليمية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المراحل</SelectItem>
                <SelectItem value="primary">ابتدائي</SelectItem>
                <SelectItem value="middle">إعدادي</SelectItem>
                <SelectItem value="secondary">ثانوي</SelectItem>
              </SelectContent>
            </Select>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع اللغات</SelectItem>
                <SelectItem value="arabic">عربية</SelectItem>
                <SelectItem value="french">فرنسية</SelectItem>
                <SelectItem value="english">إنجليزية</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setEducationLevel("all");
                setLanguage("all");
              }}
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : references && references.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            عدد المراجع: {references.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {references.map((ref) => (
              <Card key={ref.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {ref.documentType === "teacher_guide" ? "دليل المعلم" : 
                       ref.documentType === "official_program" ? "برنامج رسمي" : "أخرى"}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2 line-clamp-2">
                    {ref.documentTitle}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div>{ref.grade}</div>
                    <div className="text-xs">
                      {ref.language === "arabic" ? "عربية" :
                       ref.language === "french" ? "فرنسية" : "إنجليزية"}
                      {" • "}
                      {ref.educationLevel === "primary" ? "ابتدائي" :
                       ref.educationLevel === "middle" ? "إعدادي" : "ثانوي"}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(ref.id)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      معاينة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        window.open(ref.documentUrl, "_blank");
                        toast.success("تم فتح المرجع في نافذة جديدة");
                      }}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">لا توجد مراجع مطابقة</p>
            <p className="text-sm text-muted-foreground">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={selectedReference !== null} onOpenChange={() => setSelectedReference(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedRef?.documentTitle}</DialogTitle>
            <DialogDescription>
              {selectedRef?.grade} • {selectedRef?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedRef && (
              <iframe
                src={selectedRef.documentUrl}
                className="w-full h-full border rounded"
                title="معاينة المرجع"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
