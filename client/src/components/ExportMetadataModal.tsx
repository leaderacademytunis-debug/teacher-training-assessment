import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, School, User, Calendar, FileText, FileType } from "lucide-react";

export interface ExportMetadata {
  schoolName: string;
  teacherName: string;
  exportDate: string;
}

interface ExportMetadataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "pdf" | "word" */
  format: "pdf" | "word";
  onConfirm: (meta: ExportMetadata) => void;
  isLoading?: boolean;
  /** Pre-fill subject/level for display only */
  subject?: string | null;
  level?: string | null;
}

export function ExportMetadataModal({
  open,
  onOpenChange,
  format,
  onConfirm,
  isLoading = false,
  subject,
  level,
}: ExportMetadataModalProps) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [exportDate, setExportDate] = useState(today);

  const handleConfirm = () => {
    onConfirm({ schoolName, teacherName, exportDate });
  };

  const formatLabel = format === "pdf" ? "PDF" : "Word (.docx)";
  const FormatIcon = format === "pdf" ? FileText : FileType;
  const formatColor = format === "pdf" ? "text-red-500" : "text-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px]"
        dir="rtl"
        style={{ fontFamily: "'Cairo', 'Amiri', sans-serif" }}
      >
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-right text-lg">
            <FormatIcon className={`h-5 w-5 ${formatColor}`} />
            تصدير المذكرة البيداغوجية — {formatLabel}
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-muted-foreground">
            أدخل بيانات المعلم والمدرسة لتضمينها في ترويسة الوثيقة المُصدَّرة.
          </DialogDescription>
        </DialogHeader>

        {/* Context info (read-only) */}
        {(subject || level) && (
          <div className="flex gap-2 flex-wrap mb-1">
            {subject && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">
                📚 {subject}
              </span>
            )}
            {level && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                🎓 {level}
              </span>
            )}
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* School Name */}
          <div className="space-y-1.5">
            <Label htmlFor="school-name" className="flex items-center gap-2 text-sm font-semibold">
              <School className="h-4 w-4 text-muted-foreground" />
              اسم المدرسة / المؤسسة التربوية
            </Label>
            <Input
              id="school-name"
              placeholder="مثال: المدرسة الابتدائية الحبيب بورقيبة"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Teacher Name */}
          <div className="space-y-1.5">
            <Label htmlFor="teacher-name" className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-muted-foreground" />
              اسم المعلم / المعلمة
            </Label>
            <Input
              id="teacher-name"
              placeholder="مثال: أ. محمد بن علي"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="export-date" className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              تاريخ الإعداد
            </Label>
            <Input
              id="export-date"
              type="date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              className="text-right"
              dir="ltr"
            />
          </div>
        </div>

        {/* Note: fields are optional */}
        <p className="text-xs text-muted-foreground text-right">
          * جميع الحقول اختيارية — يمكنك التصدير مباشرة دون ملء البيانات.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isLoading ? "جاري التصدير..." : `تصدير ${formatLabel}`}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
