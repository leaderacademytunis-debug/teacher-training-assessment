import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, Copy, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImportExam() {
  const [courseId, setCourseId] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: courses } = trpc.courses.list.useQuery();
  const importMutation = trpc.exams.importQuestions.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ تم استيراد ${data.count} سؤال بنجاح`);
      setTextInput("");
      setFileContent("");
      setFileName("");
    },
    onError: (error) => {
      toast.error(`❌ خطأ في الاستيراد: ${error.message}`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      toast.error("⚠️ يرجى رفع ملف CSV أو TXT");
    }
  };

  const handleImport = async (source: 'text' | 'file') => {
    if (!courseId) {
      toast.error("⚠️ يرجى اختيار الدورة أولاً");
      return;
    }

    const content = source === 'text' ? textInput : fileContent;
    if (!content.trim()) {
      toast.error("⚠️ يرجى إدخال الأسئلة أو رفع ملف");
      return;
    }

    setIsProcessing(true);
    try {
      await importMutation.mutateAsync({
        courseId: parseInt(courseId),
        content,
        format: source === 'file' && fileName.endsWith('.csv') ? 'csv' : 'text',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">استيراد الأسئلة</h1>
        <p className="text-muted-foreground">
          استورد أسئلة الاختبار من Google Forms أو ملفات CSV
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>اختر الدورة</CardTitle>
          <CardDescription>حدد الدورة التي تريد إضافة الأسئلة إليها</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الدورة" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.titleAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">
            <Copy className="ml-2 h-4 w-4" />
            نسخ ولصق
          </TabsTrigger>
          <TabsTrigger value="file">
            <Upload className="ml-2 h-4 w-4" />
            رفع ملف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>الصق الأسئلة</CardTitle>
              <CardDescription>
                انسخ الأسئلة من Google Forms والصقها هنا بالصيغة التالية:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm font-mono" dir="ltr">
                <div>Q: What is the capital of France?</div>
                <div>A: Paris</div>
                <div>B: London</div>
                <div>C: Berlin</div>
                <div>D: Madrid</div>
                <div>CORRECT: A</div>
                <div className="mt-2">---</div>
                <div className="mt-2">Q: Next question...</div>
              </div>

              <div>
                <Label htmlFor="text-input">الأسئلة</Label>
                <Textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="الصق الأسئلة هنا..."
                  className="min-h-[300px] font-mono"
                  dir="auto"
                />
              </div>

              <Button
                onClick={() => handleImport('text')}
                disabled={isProcessing || !courseId || !textInput.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>جاري الاستيراد...</>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    استيراد الأسئلة
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>رفع ملف CSV</CardTitle>
              <CardDescription>
                ارفع ملف CSV يحتوي على الأسئلة بالصيغة التالية:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm font-mono" dir="ltr">
                <div>question,option_a,option_b,option_c,option_d,correct</div>
                <div>"What is 2+2?","3","4","5","6","B"</div>
                <div>"Capital of France?","Paris","London","Berlin","Madrid","A"</div>
              </div>

              <div>
                <Label htmlFor="file-input">اختر الملف</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {fileName && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <FileText className="inline ml-1 h-4 w-4" />
                    {fileName}
                  </p>
                )}
              </div>

              <Button
                onClick={() => handleImport('file')}
                disabled={isProcessing || !courseId || !fileContent}
                className="w-full"
              >
                {isProcessing ? (
                  <>جاري الاستيراد...</>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    استيراد من الملف
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 نصائح للاستيراد</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>• تأكد من أن كل سؤال يحتوي على 4 خيارات (A, B, C, D)</p>
          <p>• حدد الإجابة الصحيحة بوضوح</p>
          <p>• استخدم "---" للفصل بين الأسئلة عند النسخ واللصق</p>
          <p>• في ملفات CSV، استخدم الفواصل للفصل بين الأعمدة</p>
          <p>• يمكنك استيراد أسئلة بالعربية أو الإنجليزية أو الفرنسية</p>
        </CardContent>
      </Card>
    </div>
  );
}
