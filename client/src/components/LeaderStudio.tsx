'use client';

import { useCallback, useEffect, useState } from "react";
import { Brain, HelpCircle, Presentation, Zap, Loader2, Download, X, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


interface LeaderStudioProps {
  lessonContent: string;
  selectedSubject: string | null;
  selectedLevel: string | null;
  teachingLanguage: string | null;
}

export function LeaderStudio({
  lessonContent,
  selectedSubject,
  selectedLevel,
  teachingLanguage,
}: LeaderStudioProps) {
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioMode, setStudioMode] = useState<"mindmap" | "quiz" | "pptx" | null>(null);
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioContent, setStudioContent] = useState("");
  const [mindmapTab, setMindmapTab] = useState<"image" | "chart">("image");
  const [chartData, setChartData] = useState<any[]>([]);

  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Parse mindmap content to extract chart data
  const extractChartData = useCallback((mindmapCode: string) => {
    const lines = mindmapCode.split('\n');
    const data: any[] = [];
    let currentCategory = "";
    let pointCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('mindmap') || trimmed.startsWith('root')) continue;

      const indentation = line.search(/\S/);
      
      // Main category (4 spaces indentation)
      if (indentation === 4 && !trimmed.startsWith('(')) {
        if (currentCategory && pointCount > 0) {
          data.push({ name: currentCategory, points: pointCount });
        }
        currentCategory = trimmed;
        pointCount = 0;
      }
      // Sub-points (8+ spaces indentation)
      else if (indentation >= 8 && currentCategory) {
        pointCount++;
      }
    }

    // Add last category
    if (currentCategory && pointCount > 0) {
      data.push({ name: currentCategory, points: pointCount });
    }

    return data.length > 0 ? data : [
      { name: 'الفئة 1', points: 3 },
      { name: 'الفئة 2', points: 2 },
      { name: 'الفئة 3', points: 4 }
    ];
  }, []);

  // Generate Mind Map
  const generateMindMap = useCallback(async () => {
    setStudioLoading(true);
    setStudioMode("mindmap");
    setStudioOpen(true);
    setMindmapTab("image");
    try {
      const mindmapPrompt = `بناءً على الجذاذة التالية:

${lessonContent}

---

أنشئ خريطة ذهنية بصيغة Mermaid mindmap بالصيغة التالية بالضبط:

mindmap
  root((اسم الدرس))
    الفئة الأولى
      نقطة 1
      نقطة 2
    الفئة الثانية
      نقطة 1
      نقطة 2
    الفئة الثالثة
      نقطة 1
      نقطة 2

استخدم 3-4 فئات رئيسية فقط، مع 2-3 نقاط تحت كل فئة. لا تضف أي نص إضافي، فقط الخريطة الذهنية.`;

      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: mindmapPrompt }],
          subject: selectedSubject,
          level: selectedLevel,
          teachingLanguage: teachingLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate mind map");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) fullContent += data.content;
            } catch {}
          }
        }
      }

      setStudioContent(fullContent);
      const data = extractChartData(fullContent);
      setChartData(data);
      setStudioLoading(false);
    } catch (error) {
      console.error("Error generating mind map:", error);
      toast.error("خطأ في توليد الخريطة الذهنية");
      setStudioLoading(false);
    }
  }, [lessonContent, selectedSubject, selectedLevel, teachingLanguage, extractChartData]);

  // Generate Quiz
  const generateQuiz = useCallback(async () => {
    setStudioLoading(true);
    setStudioMode("quiz");
    setStudioOpen(true);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    try {
      const quizPrompt = `بناءً على الجذاذة التالية:

${lessonContent}

---

أنشئ 5 أسئلة اختيار من متعدد بصيغة JSON بالصيغة التالية:

{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
      "correct": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

الأسئلة يجب أن تكون متدرجة: 2 سهلة + 2 متوسطة + 1 صعبة
مرتبطة بمعايير مع1 / مع2 / مع3

أرجع فقط JSON بدون أي نص إضافي.`;

      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: quizPrompt }],
          subject: selectedSubject,
          level: selectedLevel,
          teachingLanguage: teachingLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) fullContent += data.content;
            } catch {}
          }
        }
      }

      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedQuiz = JSON.parse(jsonMatch[0]);
        setQuizData(parsedQuiz);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setQuizAnswered(false);
      }
      setStudioLoading(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("خطأ في توليد الاختبار");
      setStudioLoading(false);
    }
  }, [lessonContent, selectedSubject, selectedLevel, teachingLanguage]);

  // Generate PowerPoint
  const generatePPTX = useCallback(async () => {
    setStudioLoading(true);
    setStudioMode("pptx");
    setStudioOpen(true);
    try {
      const pptxPrompt = `بناءً على الجذاذة التالية:

${lessonContent}

---

أنشئ 5 شرائح بصيغة JSON:

{
  "slides": [
    {
      "title": "عنوان الشريحة",
      "content": "محتوى الشريحة",
      "type": "title|content|conclusion"
    }
  ]
}

الشرائح:
1. عنوان الدرس + المعلومات الأساسية
2. وضعية الانطلاق
3. المفهوم الأساسي + مثال
4. التطبيق
5. التقييم

أرجع فقط JSON بدون أي نص إضافي.`;

      const response = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: pptxPrompt }],
          subject: selectedSubject,
          level: selectedLevel,
          teachingLanguage: teachingLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PPTX");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) fullContent += data.content;
            } catch {}
          }
        }
      }

      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedPPTX = JSON.parse(jsonMatch[0]);
        toast.success("تم توليد العرض التقديمي!");
        console.log("PPTX Data:", parsedPPTX);
      }
      setStudioLoading(false);
    } catch (error) {
      console.error("Error generating PPTX:", error);
      toast.error("خطأ في توليد العرض التقديمي");
      setStudioLoading(false);
    }
  }, [lessonContent, selectedSubject, selectedLevel, teachingLanguage]);

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(studioContent);
    toast.success("تم نسخ الكود!");
  };

  // Download mindmap
  const downloadMindmap = () => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(studioContent));
    element.setAttribute("download", "mindmap.mmd");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("تم تحميل الملف!");
  };

  // Quiz handlers
  const handleAnswerSelect = (optionIndex: number) => {
    if (!quizAnswered) {
      setSelectedAnswer(optionIndex);
      setQuizAnswered(true);
      if (optionIndex === quizData.questions[currentQuestionIndex].correct) {
        setQuizScore(quizScore + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuizAnswered(false);
    }
  };

  if (!lessonContent || lessonContent.length === 0) {
    return null;
  }

  // Helper function to encode Arabic text to base64
  const encodeToBase64 = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error('Encoding error:', e);
      return '';
    }
  };

  const COLORS = ['#534AB7', '#BA7517', '#185FA5', '#1D9E75'];

  return (
    <div className="flex gap-2 flex-wrap justify-end mt-4" dir="rtl">
      <Button
        onClick={generateMindMap}
        className="gap-2 bg-[#534AB7] text-white hover:bg-[#3d3580] text-sm"
      >
        <Brain className="h-4 w-4" />
        <span className="hidden sm:inline">خريطة ذهنية</span>
        <span className="sm:hidden">خريطة</span>
      </Button>

      <Button
        onClick={generateQuiz}
        className="gap-2 bg-[#BA7517] text-white hover:bg-[#8a5a12] text-sm"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">اختبار تفاعلي</span>
        <span className="sm:hidden">اختبار</span>
      </Button>

      <Button
        onClick={generatePPTX}
        className="gap-2 bg-[#185FA5] text-white hover:bg-[#0f3d6b] text-sm"
      >
        <Presentation className="h-4 w-4" />
        <span className="hidden sm:inline">عرض تقديمي</span>
        <span className="sm:hidden">عرض</span>
      </Button>

      <Button
        onClick={() => {
          localStorage.setItem('lessonContent', lessonContent);
          window.open('/ultimate-studio', '_blank');
        }}
        className="gap-2 bg-[#1D9E75] text-white hover:bg-[#157a5e] text-sm"
      >
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Ultimate Studio</span>
        <span className="sm:hidden">Studio</span>
      </Button>

      {/* Studio Modal */}
      <Dialog open={studioOpen} onOpenChange={setStudioOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {studioMode === "mindmap" && "خريطة ذهنية"}
              {studioMode === "quiz" && "اختبار تفاعلي"}
              {studioMode === "pptx" && "عرض تقديمي"}
            </DialogTitle>
            <button
              onClick={() => setStudioOpen(false)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {studioLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mind Map Display with Tabs */}
              {studioMode === "mindmap" && studioContent && (
                <>
                  {/* Tabs */}
                  <div className="flex gap-2 border-b mb-4">
                    <button
                      onClick={() => setMindmapTab("image")}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        mindmapTab === "image"
                          ? "border-b-2 border-[#534AB7] text-[#534AB7]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      🧠 الخريطة الذهنية
                    </button>
                    <button
                      onClick={() => setMindmapTab("chart")}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        mindmapTab === "chart"
                          ? "border-b-2 border-[#534AB7] text-[#534AB7]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      📊 رسم بياني
                    </button>
                  </div>

                  {/* Tab Content - Image */}
                  {mindmapTab === "image" && (
                    <>
                      <div className="border rounded-lg p-4 bg-white overflow-auto max-h-96 flex justify-center items-center">
                        <img 
                          src={`https://mermaid.ink/img/${encodeToBase64(studioContent)}`}
                          alt="خريطة ذهنية"
                          style={{width:'100%', borderRadius:'8px'}}
                          onError={() => toast.error('خطأ في تحميل الخريطة الذهنية')}
                        />
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-right">
                        <p className="font-semibold mb-2">✅ الخريطة الذهنية جاهزة!</p>
                        <p className="text-xs text-gray-600">يمكنك نسخ الكود أو تحميل الصورة أدناه</p>
                      </div>
                    </>
                  )}

                  {/* Tab Content - Charts */}
                  {mindmapTab === "chart" && chartData.length > 0 && (
                    <div className="space-y-6">
                      {/* Bar Chart */}
                      <div className="border rounded-lg p-4 bg-white">
                        <h3 className="text-right font-semibold mb-4">📊 رسم بياني أعمدة</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="points" fill="#534AB7" radius={4} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      <div className="border rounded-lg p-4 bg-white">
                        <h3 className="text-right font-semibold mb-4">🥧 رسم بياني دائري</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="points"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Line Chart */}
                      <div className="border rounded-lg p-4 bg-white">
                        <h3 className="text-right font-semibold mb-4">📈 رسم بياني خطي</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="points" stroke="#534AB7" strokeWidth={2} dot={{ fill: '#534AB7', r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-lg p-3 bg-blue-50 text-center">
                          <p className="text-sm text-gray-600">إجمالي الفئات</p>
                          <p className="text-2xl font-bold text-[#534AB7]">{chartData.length}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-green-50 text-center">
                          <p className="text-sm text-gray-600">إجمالي النقاط</p>
                          <p className="text-2xl font-bold text-[#1D9E75]">{chartData.reduce((sum, item) => sum + item.points, 0)}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-orange-50 text-center">
                          <p className="text-sm text-gray-600">متوسط النقاط</p>
                          <p className="text-2xl font-bold text-[#BA7517]">{(chartData.reduce((sum, item) => sum + item.points, 0) / chartData.length).toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="flex gap-2 justify-end mt-4">
                    <Button
                      onClick={downloadMindmap}
                      className="gap-2 bg-[#534AB7] text-white hover:bg-[#3d3580]"
                    >
                      <Download className="h-4 w-4" />
                      تحميل MermaidJS
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      className="gap-2 bg-gray-500 text-white hover:bg-gray-600"
                    >
                      نسخ
                    </Button>
                  </DialogFooter>
                </>
              )}
              
              {/* Quiz Display */}
              {studioMode === "quiz" && quizData && (
                <>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#BA7517] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                      />
                    </div>

                    {/* Question Counter */}
                    <p className="text-sm text-gray-600 text-right">
                      السؤال {currentQuestionIndex + 1} من {quizData.questions.length}
                    </p>

                    {/* Question */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <p className="text-right font-semibold text-lg">
                        {quizData.questions[currentQuestionIndex]?.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {quizData.questions[currentQuestionIndex]?.options.map((option: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={quizAnswered}
                          className={`w-full p-3 text-right rounded-lg border-2 transition-all ${
                            selectedAnswer === index
                              ? index === quizData.questions[currentQuestionIndex].correct
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-gray-300 hover:border-[#BA7517]'
                          } ${quizAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* Explanation */}
                    {quizAnswered && (
                      <div className={`border rounded-lg p-3 text-right ${
                        selectedAnswer === quizData.questions[currentQuestionIndex].correct
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className="font-semibold mb-2">
                          {selectedAnswer === quizData.questions[currentQuestionIndex].correct ? '✅ صحيح!' : '❌ خطأ'}
                        </p>
                        <p className="text-sm">{quizData.questions[currentQuestionIndex]?.explanation}</p>
                      </div>
                    )}

                    {/* Navigation */}
                    {quizAnswered && (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === quizData.questions.length - 1}
                        className="w-full bg-[#BA7517] text-white hover:bg-[#8a5a12]"
                      >
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'انتهى الاختبار' : 'السؤال التالي'}
                      </Button>
                    )}

                    {/* Final Score */}
                    {currentQuestionIndex === quizData.questions.length - 1 && quizAnswered && (
                      <div className="border rounded-lg p-4 bg-yellow-50 text-center">
                        <p className="text-sm text-gray-600 mb-2">النتيجة النهائية</p>
                        <p className="text-4xl font-bold text-[#BA7517]">{quizScore}/{quizData.questions.length}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {(quizScore / quizData.questions.length) * 100 >= 80 ? '🌟 ممتاز!' : (quizScore / quizData.questions.length) * 100 >= 60 ? '👍 جيد' : '📚 يحتاج تحسين'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* PPTX Display */}
              {studioMode === "pptx" && (
                <div className="text-center py-8">
                  <p className="text-gray-600">تم توليد العرض التقديمي بنجاح!</p>
                  <p className="text-sm text-gray-500 mt-2">يمكنك تحميل الملف من الأسفل</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
