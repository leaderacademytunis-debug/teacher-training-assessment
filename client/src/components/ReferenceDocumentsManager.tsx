import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function ReferenceDocumentsManager() {
  const [filters, setFilters] = useState({
    educationLevel: "primary",
    grade: "all",
    subject: "all",
  });

  const { data: documents, isLoading } = trpc.referenceDocuments.list.useQuery(filters);

  const gradeOptions: Record<string, string[]> = {
    primary: [
      "السنة الأولى ابتدائي",
      "السنة الثانية ابتدائي",
      "السنة الثالثة ابتدائي",
      "السنة الرابعة ابتدائي",
      "السنة الخامسة ابتدائي",
      "السنة السادسة ابتدائي",
    ],
    middle: [
      "السنة السابعة إعدادي",
      "السنة الثامنة إعدادي",
      "السنة التاسعة إعدادي",
    ],
    secondary: [
      "السنة الأولى ثانوي",
      "السنة الثانية ثانوي",
      "السنة الثالثة ثانوي",
      "السنة الرابعة ثانوي",
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>المراجع الرسمية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Select
              value={filters.educationLevel}
              onValueChange={(value) =>
                setFilters({ ...filters, educationLevel: value, grade: "", subject: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="المرحلة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">ابتدائي</SelectItem>
                <SelectItem value="middle">إعدادي</SelectItem>
                <SelectItem value="secondary">ثانوي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filters.grade}
              onValueChange={(value) => setFilters({ ...filters, grade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                {gradeOptions[filters.educationLevel]?.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filters.subject}
              onValueChange={(value) => setFilters({ ...filters, subject: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="المادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواد</SelectItem>
                <SelectItem value="اللغة العربية">اللغة العربية</SelectItem>
                <SelectItem value="الرياضيات">الرياضيات</SelectItem>
                <SelectItem value="اللغة الفرنسية">اللغة الفرنسية</SelectItem>
                <SelectItem value="اللغة الإنجليزية">اللغة الإنجليزية</SelectItem>
                <SelectItem value="التربية الإسلامية">التربية الإسلامية</SelectItem>
                <SelectItem value="التربية المدنية">التربية المدنية</SelectItem>
                <SelectItem value="التاريخ والجغرافيا">التاريخ والجغرافيا</SelectItem>
                <SelectItem value="علوم الطبيعة">علوم الطبيعة</SelectItem>
                <SelectItem value="التربية الفنية">التربية الفنية</SelectItem>
                <SelectItem value="التربية الموسيقية">التربية الموسيقية</SelectItem>
                <SelectItem value="التكنولوجيا">التكنولوجيا</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">{doc.documentTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {doc.subject} - {doc.grade}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.documentUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 ml-2" />
                  فتح
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مراجع متاحة للفلاتر المحددة
          </div>
        )}
      </CardContent>
    </Card>
  );
}
