/**
 * Bulk User Upload Component
 * Features: CSV upload, data validation, preview, bulk account creation, email notifications
 */

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download, Upload, AlertCircle, CheckCircle, XCircle, Loader, Eye, EyeOff,
  Mail, Phone, User, Building2, Zap, FileText, Trash2
} from "lucide-react";

// ===== TYPES =====
interface UserData {
  fullName: string;
  email: string;
  phone: string;
  plan: "starter" | "pro" | "vip";
  institution: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  rowIndex: number;
}

interface UploadResult {
  success: number;
  failed: number;
  duplicates: number;
  details: {
    email: string;
    status: "created" | "duplicate" | "error";
    message: string;
  }[];
}

// ===== CONSTANTS =====
const CSV_HEADERS = ["الاسم الكامل", "البريد الإلكتروني", "رقم الهاتف", "الخطة", "المؤسسة"];
const VALID_PLANS = ["starter", "pro", "vip"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== UTILITY FUNCTIONS =====
const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const validatePhoneNumber = (phone: string): boolean => {
  // Accept common phone formats: +216XXXXXXXX, 216XXXXXXXX, 0XXXXXXXX, etc.
  return /^(\+?\d{1,3})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/.test(phone.trim());
};

const validatePlan = (plan: string): boolean => VALID_PLANS.includes(plan.toLowerCase());

const parseCSV = (csvText: string): UserData[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) throw new Error("الملف فارغ أو يحتوي على سطر واحد فقط");

  const users: UserData[] = [];
  const headerLine = lines[0];

  // Try to detect delimiter (comma or semicolon)
  const delimiter = headerLine.includes(";") ? ";" : ",";

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
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "نموذج_المعلمين.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ===== MAIN COMPONENT =====
export default function BulkUserUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "processing" | "results">("upload");
  const [users, setUsers] = useState<UserData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [showErrors, setShowErrors] = useState(false);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError("");

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      setFileError("يجب أن يكون الملف بصيغة CSV");
      return;
    }

    try {
      const text = await file.text();
      const parsedUsers = parseCSV(text);

      if (parsedUsers.length === 0) {
        setFileError("لم يتم العثور على بيانات صحيحة في الملف");
        return;
      }

      // Validate each user
      const errors: ValidationResult[] = [];
      parsedUsers.forEach((user, index) => {
        if (!user.fullName.trim()) {
          errors.push({ isValid: false, error: "الاسم مفقود", rowIndex: index + 2 });
        }
        if (!validateEmail(user.email)) {
          errors.push({ isValid: false, error: "بريد إلكتروني غير صحيح", rowIndex: index + 2 });
        }
        if (!validatePhoneNumber(user.phone)) {
          errors.push({ isValid: false, error: "رقم هاتف غير صحيح", rowIndex: index + 2 });
        }
        if (!validatePlan(user.plan)) {
          errors.push({ isValid: false, error: "خطة غير صحيحة (starter/pro/vip)", rowIndex: index + 2 });
        }
        if (!user.institution.trim()) {
          errors.push({ isValid: false, error: "المؤسسة مفقودة", rowIndex: index + 2 });
        }
      });

      setValidationErrors(errors);
      setUsers(parsedUsers);
      setStep("preview");
    } catch (error) {
      setFileError(`خطأ في قراءة الملف: ${error instanceof Error ? error.message : "خطأ غير معروف"}`);
    }
  };

  // Process bulk upload
  const handleBulkUpload = async () => {
    setIsProcessing(true);
    setStep("processing");

    try {
      // Simulate API call with progress
      const results: UploadResult = {
        success: 0,
        failed: 0,
        duplicates: 0,
        details: [],
      };

      // Simulate existing emails (for demo)
      const existingEmails = new Set(["existing@example.com"]);

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        // Simulate delay for realistic progress
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Check for duplicates
        if (existingEmails.has(user.email)) {
          results.duplicates++;
          results.details.push({
            email: user.email,
            status: "duplicate",
            message: "البريد الإلكتروني موجود مسبقاً",
          });
          continue;
        }

        // Simulate account creation (in real app, call API)
        try {
          // Validate one more time
          if (!validateEmail(user.email) || !validatePhoneNumber(user.phone)) {
            throw new Error("بيانات غير صحيحة");
          }

          results.success++;
          existingEmails.add(user.email);
          results.details.push({
            email: user.email,
            status: "created",
            message: `تم إنشاء الحساب - كلمة المرور المؤقتة أُرسلت إلى ${user.email}`,
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            email: user.email,
            status: "error",
            message: error instanceof Error ? error.message : "خطأ في الإنشاء",
          });
        }
      }

      setUploadResults(results);
      setStep("results");
    } catch (error) {
      setFileError("خطأ في معالجة الملف");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setStep("upload");
    setUsers([]);
    setValidationErrors([]);
    setUploadResults(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===== RENDER: UPLOAD STEP =====
  if (step === "upload") {
    return (
      <div className="space-y-6" dir="rtl">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle>رفع حسابات بالجملة</CardTitle>
            <CardDescription className="text-slate-400">
              قم بتحميل ملف CSV يحتوي على بيانات معلمين متعددين وإنشاء حساباتهم دفعة واحدة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>تنسيق الملف المقبول</AlertTitle>
              <AlertDescription>
                يجب أن يحتوي الملف على الأعمدة التالية: الاسم الكامل | البريد الإلكتروني | رقم الهاتف | الخطة (starter/pro/vip) | المؤسسة
              </AlertDescription>
            </Alert>

            {/* Download Sample */}
            <Button
              onClick={downloadSampleCSV}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Download className="h-4 w-4 ms-2" />
              تحميل نموذج CSV
            </Button>

            {/* File Input */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Upload className="h-4 w-4 ms-2" />
                رفع ملف CSV
              </Button>
            </div>

            {/* Error Message */}
            {fileError && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                <XCircle className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER: PREVIEW STEP =====
  if (step === "preview") {
    const hasErrors = validationErrors.length > 0;
    const validUsers = users.filter((_, index) => !validationErrors.some((e) => e.rowIndex === index + 2));

    return (
      <div className="space-y-6" dir="rtl">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{users.length}</div>
                <div className="text-sm text-slate-400">إجمالي السجلات</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{validUsers.length}</div>
                <div className="text-sm text-slate-400">سجلات صحيحة</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{validationErrors.length}</div>
                <div className="text-sm text-slate-400">أخطاء</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Errors Section */}
        {hasErrors && (
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-400">الأخطاء المكتشفة</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-slate-400"
                >
                  {showErrors ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showErrors && (
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {validationErrors.map((error, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-slate-800 rounded text-sm">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">السطر {error.rowIndex}</div>
                        <div className="text-slate-300">{error.error}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Data Preview */}
        <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
          <CardHeader>
            <CardTitle>معاينة البيانات الصحيحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-right py-3 px-4 text-slate-400">الاسم</th>
                    <th className="text-right py-3 px-4 text-slate-400">البريد</th>
                    <th className="text-right py-3 px-4 text-slate-400">الهاتف</th>
                    <th className="text-right py-3 px-4 text-slate-400">الخطة</th>
                    <th className="text-right py-3 px-4 text-slate-400">المؤسسة</th>
                  </tr>
                </thead>
                <tbody>
                  {validUsers.slice(0, 10).map((user, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">{user.fullName}</td>
                      <td className="py-3 px-4 text-slate-400">{user.email}</td>
                      <td className="py-3 px-4 text-slate-400">{user.phone}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{user.institution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validUsers.length > 10 && (
                <div className="text-center py-3 text-slate-400 text-sm">
                  ... و {validUsers.length - 10} سجلات أخرى
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300"
          >
            <Trash2 className="h-4 w-4 ms-2" />
            إلغاء
          </Button>
          <Button
            onClick={handleBulkUpload}
            disabled={validUsers.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4 ms-2" />
            إنشاء {validUsers.length} حساب
          </Button>
        </div>
      </div>
    );
  }

  // ===== RENDER: PROCESSING STEP =====
  if (step === "processing") {
    return (
      <div className="space-y-6" dir="rtl">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <Loader className="h-12 w-12 animate-spin mx-auto text-orange-400" />
            <div>
              <h3 className="text-xl font-semibold mb-2">جاري إنشاء الحسابات...</h3>
              <p className="text-slate-400">يرجى الانتظار، قد يستغرق هذا بعض الوقت</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER: RESULTS STEP =====
  if (step === "results" && uploadResults) {
    return (
      <div className="space-y-6" dir="rtl">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400">{uploadResults.success}</div>
                <div className="text-sm text-slate-400">حسابات منشأة</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-400">{uploadResults.duplicates}</div>
                <div className="text-sm text-slate-400">تكرارات</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-400">{uploadResults.failed}</div>
                <div className="text-sm text-slate-400">أخطاء</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
          <CardHeader>
            <CardTitle>تفاصيل العملية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadResults.details.map((detail, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded ${
                    detail.status === "created"
                      ? "bg-green-500/10 border border-green-500/30"
                      : detail.status === "duplicate"
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}
                >
                  {detail.status === "created" && (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  {detail.status === "duplicate" && (
                    <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  {detail.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{detail.email}</div>
                    <div className="text-xs text-slate-400">{detail.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Button onClick={handleReset} className="w-full bg-orange-600 hover:bg-orange-700">
          رفع ملف جديد
        </Button>
      </div>
    );
  }

  return null;
}
