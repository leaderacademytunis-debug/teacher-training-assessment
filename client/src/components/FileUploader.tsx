import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, X, FileText, Image, File, Loader2 } from "lucide-react";

interface FileAttachment {
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

interface FileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "image/jpeg": "صورة",
  "image/png": "صورة",
  "image/gif": "صورة",
  "image/webp": "صورة",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes("word") || mimeType.includes("msword")) return <FileText className="h-5 w-5 text-blue-700" />;
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return <FileText className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({ attachments, onAttachmentsChange, maxFiles = 5, maxSizeMB = 10 }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = trpc.assignmentManager.uploadSubmissionFile.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check max files
    if (attachments.length + files.length > maxFiles) {
      toast.error(`الحد الأقصى ${maxFiles} ملفات`);
      return;
    }

    setUploading(true);
    const newAttachments: FileAttachment[] = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES[file.type]) {
        toast.error(`نوع الملف "${file.name}" غير مدعوم`);
        continue;
      }
      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`الملف "${file.name}" يتجاوز ${maxSizeMB} ميغابايت`);
        continue;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        const result = await uploadFile.mutateAsync({
          base64Data: base64,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        });
        newAttachments.push(result);
      } catch (err: any) {
        toast.error(`فشل رفع "${file.name}": ${err.message}`);
      }
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
      toast.success(`تم رفع ${newAttachments.length} ملف بنجاح`);
    }

    setUploading(false);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.ppt,.pptx"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-gray-600">جاري رفع الملفات...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">اضغط لرفع ملفات أو اسحبها هنا</p>
            <p className="text-xs text-gray-500">PDF, Word, PowerPoint, صور - حد أقصى {maxSizeMB} ميغابايت لكل ملف</p>
          </div>
        )}
      </div>

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">الملفات المرفقة ({attachments.length}/{maxFiles})</p>
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              {getFileIcon(file.mimeType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)} - {ALLOWED_TYPES[file.mimeType] || file.mimeType}</p>
              </div>
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">
                عرض
              </a>
              <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: globalThis.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
