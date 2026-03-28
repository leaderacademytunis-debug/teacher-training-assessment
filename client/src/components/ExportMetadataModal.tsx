import { useState, useRef } from "react";
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
import { Download, Loader2, School, User, Calendar, FileText, FileType, Upload, X, ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface ExportMetadata {
  schoolName: string;
  teacherName: string;
  exportDate: string;
  /** Public S3 URL of the uploaded school logo */
  schoolLogoUrl?: string;
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = trpc.assistant.uploadFile.useMutation();

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة (PNG، JPG، SVG...)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الشعار يجب أن يكون أقل من 2 ميجابايت");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    setIsUploadingLogo(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          const result = r.result as string;
          resolve(result.split(",")[1]);
        };
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const result = await uploadFileMutation.mutateAsync({
        base64Data,
        fileName: `school-logo-${Date.now()}.${file.name.split(".").pop()}`,
        mimeType: file.type,
      });

      setLogoUrl(result.url);
      toast.success("تم رفع الشعار بنجاح");
    } catch {
      toast.error("خطأ في رفع الشعار");
      setLogoPreview(null);
      setLogoUrl(null);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoUrl(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleConfirm = () => {
    onConfirm({
      schoolName,
      teacherName,
      exportDate,
      schoolLogoUrl: logoUrl || undefined,
    });
  };

  const formatLabel = format === "pdf" ? "PDF" : "Word (.docx)";
  const FormatIcon = format === "pdf" ? FileText : FileType;
  const formatColor = format === "pdf" ? "text-red-500" : "text-blue-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        dir="rtl"
        style={{ fontFamily: "'Cairo', 'Amiri', sans-serif" }}
      >
        <DialogHeader className="text-end">
          <DialogTitle className="flex items-center gap-2 text-end text-lg">
            <FormatIcon className={`h-5 w-5 ${formatColor}`} />
            تصدير المذكرة البيداغوجية — {formatLabel}
          </DialogTitle>
          <DialogDescription className="text-end text-sm text-muted-foreground">
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
          {/* School Logo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              شعار المدرسة / المؤسسة (اختياري)
            </Label>

            {logoPreview ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <img
                  src={logoPreview}
                  alt="شعار المدرسة"
                  className="h-16 w-16 object-contain rounded border bg-white p-1"
                />
                <div className="flex-1 min-w-0">
                  {isUploadingLogo ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الرفع...
                    </div>
                  ) : logoUrl ? (
                    <p className="text-sm text-emerald-600 font-medium">✓ تم رفع الشعار بنجاح</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">معاينة الشعار</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    سيظهر في أعلى يمين الوثيقة المُصدَّرة
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={removeLogo}
                  disabled={isUploadingLogo}
                  title="حذف الشعار"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-muted/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  انقر لرفع شعار المدرسة
                </span>
                <span className="text-xs text-muted-foreground/70">
                  PNG، JPG، SVG — حد أقصى 2 ميجابايت
                </span>
              </button>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
          </div>

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
              className="text-end"
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
              className="text-end"
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
              className="text-end"
              dir="ltr"
            />
          </div>
        </div>

        {/* Note: fields are optional */}
        <p className="text-xs text-muted-foreground text-end">
          * جميع الحقول اختيارية — يمكنك التصدير مباشرة دون ملء البيانات.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isUploadingLogo}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isLoading ? "جاري التصدير..." : isUploadingLogo ? "جاري رفع الشعار..." : `تصدير ${formatLabel}`}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isUploadingLogo}
            className="flex-1"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
