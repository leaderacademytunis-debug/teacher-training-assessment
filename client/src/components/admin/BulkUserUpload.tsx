/**
 * Bulk User Upload Component
 * Features: CSV upload, data validation, preview, bulk account creation, email notifications
 * NOW USING REAL DATABASE QUERIES
 */

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download, Upload, AlertCircle, CheckCircle, XCircle, Loader2, Eye, EyeOff,
  Mail, Phone, User, Building2, Zap, FileText, Trash2
} from "lucide-react";

// ===== TYPES =====
interface UserData {
  fullName: string;
  email: string;
  phone: string;
  plan: "starter" | "pro" | "vip" | "free";
  institution: string;
}

// ===== CONSTANTS =====
const CSV_HEADERS = ["الاسم الكامل", "البريد الإلكتروني", "رقم الهاتف", "الخطة", "المؤسسة"];
const VALID_PLANS = ["starter", "pro", "vip", "free"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== UTILITY FUNCTIONS =====
const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const validatePhoneNumber = (phone: string): boolean => {
  return /^(\+?\d{1,3})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/.test(phone.trim());
};

const validatePlan = (plan: string): boolean => VALID_PLANS.includes(plan.toLowerCase());

const parseCSV = (csvText: string): UserData[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) throw new Error("الملف فارغ أو يحتوي على سطر واحد فقط");

  const users: UserData[] = [];
  const delimiter = lines[0].includes(";") ? ";" : ",";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(delimiter).map((v) => v.trim());
    if (values.length < 5) continue;

    users.push({
      fullName: values[0],
      email: values[1],
      phone: values[2],
      plan: values[3].toLowerCase() as any,
      institution: values[4],
    });
  }

  return users;
};

const generateSampleCSV = (): string => {
  const sampleData = [
    "الاسم الكامل,البريد الإلكتروني,رقم الهاتف,الخطة,المؤسسة",
    "أحمد محمود,ahmed@example.com,+216 92 123 456,starter,مدرسة النيل",
    "فاطمة علي,fatima@example.com,+216 93 234 567,pro,مدرسة الفرقان",
    "محمد حسن,mohammad@example.com,+216 94 345 678,vip,مدرسة الأمل",
  ];
  return sampleData.join("\n");
};

const downloadSampleCSV = () => {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sample_users.csv";
  link.click();
};

// ===== MAIN COMPONENT =====
export default function BulkUserUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<UserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "preview" | "processing" | "results">("upload");

  // Real API calls
  const processMutation = trpc.bulkUserImport.processBulkImport.useMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const data = parseCSV(csvText);

        // Validate each row
        const errors: Record<number, string> = {};
        data.forEach((user, idx) => {
          if (!user.fullName.trim()) errors[idx] = "الاسم مطلوب";
          if (!validateEmail(user.email)) errors[idx] = "البريد الإلكتروني غير صحيح";
          if (!validatePhoneNumber(user.phone)) errors[idx] = "رقم الهاتف غير صحيح";
          if (!validatePlan(user.plan)) errors[idx] = "الخطة غير صحيحة";
          if (!user.institution.trim()) errors[idx] = "المؤسسة مطلوبة";
        });

        setCsvData(data);
        setValidationErrors(errors);
        setStep("preview");
      } catch (error: any) {
        alert("خطأ في قراءة الملف: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessUpload = async () => {
    if (Object.keys(validationErrors).length > 0) {
      alert("يوجد أخطاء في البيانات. يرجى تصحيحها أولاً.");
      return;
    }

    if (csvData.length === 0) {
      alert("لا توجد بيانات للمعالجة");
      return;
    }

    setStep("processing");
    try {
      const result = await processMutation.mutateAsync({
        records: csvData,
      });
      setUploadResult(result);
      setStep("results");
    } catch (error: any) {
      alert("خطأ: " + (error.message || "فشلت معالجة البيانات"));
      setStep("preview");
    }
  };

  const handleReset = () => {
    setCsvData([]);
    setValidationErrors({});
    setUploadResult(null);
    setProgress(0);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===== UPLOAD STEP =====
  if (step === "upload") {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>رفع حسابات بالجملة</CardTitle>
            <CardDescription className="text-slate-400">
              حمّل ملف CSV يحتوي على بيانات المعلمين لإنشاء حساباتهم دفعة واحدة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Download Sample */}
            <Button
              onClick={downloadSampleCSV}
              variant="outline"
              className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              تحميل نموذج CSV
            </Button>

            {/* File Upload */}
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 w-full"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm text-slate-300">
                  انقر لتحميل ملف CSV أو اسحب الملف هنا
                </span>
              </button>
            </div>

            {/* Instructions */}
            <Alert className="bg-slate-800 border-slate-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>تنسيق الملف</AlertTitle>
              <AlertDescription className="text-slate-400 text-sm">
                يجب أن يحتوي الملف على الأعمدة التالية بهذا الترتيب:
                <br />
                الاسم الكامل | البريد الإلكتروني | رقم الهاتف | الخطة | المؤسسة
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== PREVIEW STEP =====
  if (step === "preview") {
    const validRows = csvData.filter((_, idx) => !validationErrors[idx]);
    const errorRows = csvData.filter((_, idx) => validationErrors[idx]);

    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>معاينة البيانات</CardTitle>
            <CardDescription className="text-slate-400">
              تحقق من البيانات قبل إنشاء الحسابات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800 p-4 rounded">
                <p className="text-sm text-slate-400">إجمالي الصفوف</p>
                <p className="text-2xl font-bold">{csvData.length}</p>
              </div>
              <div className="bg-green-900/30 p-4 rounded border border-green-700">
                <p className="text-sm text-green-400">صفوف صحيحة</p>
                <p className="text-2xl font-bold text-green-400">{validRows.length}</p>
              </div>
              <div className="bg-red-900/30 p-4 rounded border border-red-700">
                <p className="text-sm text-red-400">أخطاء</p>
                <p className="text-2xl font-bold text-red-400">{errorRows.length}</p>
              </div>
            </div>

            {/* Valid Rows Table */}
            {validRows.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-green-400">✓ البيانات الصحيحة</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-700 bg-slate-800/50">
                      <tr>
                        <th className="text-right py-2 px-3">الاسم</th>
                        <th className="text-right py-2 px-3">البريد</th>
                        <th className="text-right py-2 px-3">الهاتف</th>
                        <th className="text-right py-2 px-3">الخطة</th>
                        <th className="text-right py-2 px-3">المؤسسة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validRows.slice(0, 5).map((user, idx) => (
                        <tr key={idx} className="border-b border-slate-700">
                          <td className="py-2 px-3 text-xs">{user.fullName}</td>
                          <td className="py-2 px-3 text-xs">{user.email}</td>
                          <td className="py-2 px-3 text-xs">{user.phone}</td>
                          <td className="py-2 px-3 text-xs">{user.plan}</td>
                          <td className="py-2 px-3 text-xs">{user.institution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {validRows.length > 5 && (
                  <p className="text-xs text-slate-400 mt-2">... و {validRows.length - 5} صفوف أخرى</p>
                )}
              </div>
            )}

            {/* Error Rows */}
            {errorRows.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-red-400">✗ أخطاء</h3>
                <div className="space-y-2">
                  {errorRows.map((user, idx) => (
                    <Alert key={idx} className="bg-red-900/20 border-red-700">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-400 text-sm">
                        {user.email}: {validationErrors[csvData.indexOf(user)]}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-700 text-white"
              >
                تحميل ملف جديد
              </Button>
              <Button
                onClick={handleProcessUpload}
                disabled={validRows.length === 0 || processMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    إنشاء {validRows.length} حساب
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== PROCESSING STEP =====
  if (step === "processing") {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500" />
            <p className="text-lg font-semibold">جاري معالجة البيانات...</p>
            <p className="text-sm text-slate-400">يرجى الانتظار أثناء إنشاء الحسابات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RESULTS STEP =====
  if (step === "results" && uploadResult) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>نتائج المعالجة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-900/30 p-4 rounded border border-green-700">
                <p className="text-sm text-green-400">تم الإنشاء</p>
                <p className="text-3xl font-bold text-green-400">{uploadResult.created}</p>
              </div>
              <div className="bg-yellow-900/30 p-4 rounded border border-yellow-700">
                <p className="text-sm text-yellow-400">تكرارات</p>
                <p className="text-3xl font-bold text-yellow-400">{uploadResult.duplicates}</p>
              </div>
              <div className="bg-red-900/30 p-4 rounded border border-red-700">
                <p className="text-sm text-red-400">أخطاء</p>
                <p className="text-3xl font-bold text-red-400">{uploadResult.errors}</p>
              </div>
            </div>

            {/* Details Table */}
            <div>
              <h3 className="text-sm font-semibold mb-3">التفاصيل</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="text-right py-2 px-3">البريد الإلكتروني</th>
                      <th className="text-right py-2 px-3">الحالة</th>
                      <th className="text-right py-2 px-3">الرسالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.details.map((detail: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-700">
                        <td className="py-2 px-3 text-xs">{detail.email}</td>
                        <td className="py-2 px-3">
                          {detail.status === "created" && (
                            <Badge className="bg-green-600">✓ تم الإنشاء</Badge>
                          )}
                          {detail.status === "duplicate" && (
                            <Badge className="bg-yellow-600">⚠ تكرار</Badge>
                          )}
                          {detail.status === "error" && (
                            <Badge className="bg-red-600">✗ خطأ</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-400">{detail.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <Button
              onClick={handleReset}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              رفع ملف جديد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
