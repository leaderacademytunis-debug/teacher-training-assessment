import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileText, FileType } from "lucide-react";
import { toast } from "sonner";

type ExportType = "pedagogicalSheet" | "lessonPlan" | "teacherExam";
type ExportFormat = "pdf" | "word";
type PdfTemplate = "classic" | "modern" | "colorful";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  itemTitle: string;
  exportType: ExportType;
}

export function ExportDialog({
  open,
  onOpenChange,
  itemId,
  itemTitle,
  exportType,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [template, setTemplate] = useState<PdfTemplate>("classic");

  const exportPdfMutation = trpc[
    exportType === "pedagogicalSheet"
      ? "pedagogicalSheets"
      : exportType === "lessonPlan"
      ? "lessonPlans"
      : "teacherExams"
  ].exportToPdf.useMutation();

  const exportWordMutation = trpc[
    exportType === "pedagogicalSheet"
      ? "pedagogicalSheets"
      : exportType === "lessonPlan"
      ? "lessonPlans"
      : "teacherExams"
  ].exportToWord.useMutation();

  const handleExport = async () => {
    try {
      if (format === "pdf") {
        const result = await exportPdfMutation.mutateAsync({ 
          id: itemId,
          // template: template as any, // TODO: Will be used in future implementation
        });
        
        // Open PDF in new tab
        window.open(result.url, "_blank");
        
        toast.success(`تم تصدير "${itemTitle}" إلى PDF بنجاح`);
      } else {
        const result = await exportWordMutation.mutateAsync({ id: itemId });
        
        // Download Word file
        window.open(result.url, "_blank");
        
        toast.success(`تم تصدير "${itemTitle}" إلى Word بنجاح`);
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير الملف. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تصدير: {itemTitle}</DialogTitle>
          <DialogDescription>
            اختر تنسيق التصدير والقالب المفضل
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">تنسيق التصدير</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="pdf" id="format-pdf" />
                <Label htmlFor="format-pdf" className="flex-1 cursor-pointer flex items-center gap-3">
                  <FileText className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">PDF</div>
                    <div className="text-sm text-muted-foreground">
                      مناسب للطباعة والمشاركة (قوالب تصميم متعددة)
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="word" id="format-word" />
                <Label htmlFor="format-word" className="flex-1 cursor-pointer flex items-center gap-3">
                  <FileType className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Word (.docx)</div>
                    <div className="text-sm text-muted-foreground">
                      قابل للتعديل في Microsoft Word
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* PDF Template Selection */}
          {format === "pdf" && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">قالب التصميم</Label>
              <RadioGroup value={template} onValueChange={(v) => setTemplate(v as PdfTemplate)}>
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="classic" id="template-classic" />
                  <Label htmlFor="template-classic" className="flex-1 cursor-pointer">
                    <div className="font-medium">كلاسيكي احترافي</div>
                    <div className="text-sm text-muted-foreground">
                      تصميم أزرق أنيق مع إطارات مزدوجة
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="modern" id="template-modern" />
                  <Label htmlFor="template-modern" className="flex-1 cursor-pointer">
                    <div className="font-medium">عصري بسيط</div>
                    <div className="text-sm text-muted-foreground">
                      تصميم أخضر مينيماليستي مع خطوط نظيفة
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="colorful" id="template-colorful" />
                  <Label htmlFor="template-colorful" className="flex-1 cursor-pointer">
                    <div className="font-medium">ملون إبداعي</div>
                    <div className="text-sm text-muted-foreground">
                      تصميم متعدد الألوان مع زخارف جذابة
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            disabled={exportPdfMutation.isPending || exportWordMutation.isPending}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            {exportPdfMutation.isPending || exportWordMutation.isPending ? "جاري التصدير..." : "تصدير"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
