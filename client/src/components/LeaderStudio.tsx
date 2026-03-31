"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, HelpCircle, Presentation, Zap, Loader2, Download, X, Check, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import mermaid from 'mermaid';

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
  const [mindmapSvg, setMindmapSvg] = useState<string>("");
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
  }, []);

  // Render mindmap SVG when content changes
  useEffect(() => {
    if (studioMode === "mindmap" && studioContent) {
      const id = 'mindmap-svg-' + Date.now();
      mermaid.render(id, studioContent).then(({ svg }) => {
        setMindmapSvg(svg);
      }).catch((err) => {
        console.error('Mermaid render error:', err);
        toast.error('خطأ في رسم الخريطة الذهنية');
      });
    }
  }, [studioContent, studioMode]);

  // Generate Mind Map
  const generateMindMap = useCallback(async () => {
    setStudioLoading(true);
    setStudioMode("mindmap");
    setStudioOpen(true);
    setMindmapSvg("");
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
    } catch (error) {
      console.error("Mind map error:", error);
      toast.error("خطأ في إنشاء الخريطة الذهنية");
    } finally {
      setStudioLoading(false);
    }
  }, [lessonContent, selectedSubject, selectedLevel, teachingLanguage]);

  // Generate Quiz
  const generateQuiz = useCallback(async () => {
    setStudioLoading(true);
    setStudioMode("quiz");
    setStudioOpen(true);
    try {
      const quizPrompt = `من الجذاذة التالية:

${lessonContent}

---

أنشئ 5 أسئلة اختيار من متعدد (2 سهلة + 2 متوسطة + 1 صعبة) بصيغة JSON فقط:

{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["أ", "ب", "ج", "د"],
      "correct": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

لا تضف أي نص إضافي، فقط JSON.`;

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
        const parsed = JSON.parse(jsonMatch[0]);
        setQuizData(parsed);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setQuizAnswered(false);
        setQuizScore(0);
      }
    } catch (error) {
      console.error("Quiz error:", error);
      toast.error("خطأ في إنشاء الاختبار");
    } finally {
      setStudioLoading(false);
    }
  }, [lessonContent, selectedSubject, selectedLevel, teachingLanguage]);

  // Generate PowerPoint
  const generatePowerPoint = useCallback(async () => {
    setStudioLoading(true);
    setStudioMode("pptx");
    setStudioOpen(true);
    try {
      const pptxPrompt = `من الجذاذة التالية:

${lessonContent}

---

أنشئ محتوى 5 شرائح PowerPoint بصيغة JSON:

{
  "slides": [
    {
      "title": "عنوان الشريحة",
      "content": "محتوى الشريحة"
    }
  ]
}

الشرائح:
1. عنوان الدرس + المعلومات الأساسية
2. وضعية الانطلاق
3. المفهوم الأساسي + مثال
4. التطبيق
5. التقييم

لا تضف أي نص إضافي، فقط JSON.`;

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

      if (!response.ok) throw new Error("Failed to generate PowerPoint");

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
    } catch (error) {
      console.error("PowerPoint error:", error);
      toast.error("خطأ في إنشاء العرض التقديمي");
    } finally {
      setStudioLoading(false);
    }
  }, [lessonContent, selectedSubject, selectedLevel, teachingLanguage]);

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(studioContent);
    toast.success("تم النسخ إلى الحافظة");
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
    toast.success("تم تحميل الخريطة الذهنية");
  };

  // Handle quiz answer
  const handleQuizAnswer = (optionIndex: number) => {
    if (quizAnswered) return;
    setSelectedAnswer(optionIndex);
    setQuizAnswered(true);
    if (optionIndex === quizData.questions[currentQuestionIndex].correct) {
      setQuizScore(quizScore + 1);
    }
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuizAnswered(false);
    }
  };

  if (!lessonContent || lessonContent.length === 0) {
    return null;
  }

  return (
    <>
      {/* Studio Button Bar */}
      <div className="border-t border-gray-100 bg-gradient-to-l from-purple-50 to-white px-2 sm:px-4 py-3 flex gap-2 flex-wrap justify-center">
        <Button
          onClick={generateMindMap}
          disabled={studioLoading}
          className="gap-1 sm:gap-2 bg-[#534AB7] hover:bg-[#3d3580] text-white rounded-full px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
          size="sm"
        >
          <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">خريطة ذهنية</span>
          <span className="sm:hidden">خريطة</span>
        </Button>
        <Button
          onClick={generateQuiz}
          disabled={studioLoading}
          className="gap-1 sm:gap-2 bg-[#BA7517] hover:bg-[#8a5810] text-white rounded-full px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
          size="sm"
        >
          <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">اختبار تفاعلي</span>
          <span className="sm:hidden">اختبار</span>
        </Button>
        <Button
          onClick={generatePowerPoint}
          disabled={studioLoading}
          className="gap-1 sm:gap-2 bg-[#185FA5] hover:bg-[#0f3f75] text-white rounded-full px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
          size="sm"
        >
          <Presentation className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">عرض تقديمي</span>
          <span className="sm:hidden">عرض</span>
        </Button>
        <Button
          onClick={() => {
            localStorage.setItem("studioLessonContent", lessonContent);
            window.open("/ultimate-studio", "_blank");
          }}
          className="gap-1 sm:gap-2 bg-[#1D9E75] hover:bg-[#0d7a5c] text-white rounded-full px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
          size="sm"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Ultimate Studio</span>
          <span className="sm:hidden">Studio</span>
        </Button>
      </div>

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
              {/* Mind Map Display */}
              {studioMode === "mindmap" && studioContent && (
                <>
                  {mindmapSvg ? (
                    <div className="border rounded-lg p-4 bg-white overflow-auto max-h-96 flex justify-center items-start">
                      <div 
                        dangerouslySetInnerHTML={{ __html: mindmapSvg }}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-right">
                    <p className="font-semibold mb-2">📌 كيفية الاستخدام:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>انسخ النص أعلاه</li>
                      <li>اذهب إلى <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mermaid.live</a></li>
                      <li>الصق النص وسيتم عرض الخريطة الذهنية تلقائياً</li>
                      <li>يمكنك تحميلها كصورة PNG من هناك</li>
                    </ol>
                  </div>
                  <DialogFooter className="flex gap-2 justify-end">
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
                    <p className="text-sm text-gray-600 text-center">السؤال {currentQuestionIndex + 1} من {quizData.questions.length}</p>

                    {/* Question */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-right mb-4">{quizData.questions[currentQuestionIndex].question}</p>
                      
                      {/* Options */}
                      <div className="space-y-2">
                        {quizData.questions[currentQuestionIndex].options.map((option: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            disabled={quizAnswered}
                            className={`w-full p-3 rounded-lg text-right transition-all ${
                              selectedAnswer === idx
                                ? idx === quizData.questions[currentQuestionIndex].correct
                                  ? "bg-green-100 border-2 border-green-500"
                                  : "bg-red-100 border-2 border-red-500"
                                : "bg-white border-2 border-gray-200 hover:border-gray-400"
                            } ${quizAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {selectedAnswer === idx && (
                                idx === quizData.questions[currentQuestionIndex].correct
                                  ? <Check className="h-5 w-5 text-green-600" />
                                  : <AlertCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    {quizAnswered && (
                      <div className={`p-3 rounded-lg text-sm text-right ${
                        selectedAnswer === quizData.questions[currentQuestionIndex].correct
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}>
                        <p className="font-semibold mb-1">الشرح:</p>
                        <p>{quizData.questions[currentQuestionIndex].explanation}</p>
                      </div>
                    )}

                    {/* Quiz Complete */}
                    {currentQuestionIndex === quizData.questions.length - 1 && quizAnswered && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-[#BA7517] mb-2">
                          {quizScore}/{quizData.questions.length}
                        </p>
                        <p className="text-sm text-gray-600">
                          {quizScore === quizData.questions.length ? "ممتاز! 🎉" : "جيد جداً! 👏"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  {quizAnswered && currentQuestionIndex < quizData.questions.length - 1 && (
                    <Button
                      onClick={nextQuestion}
                      className="w-full bg-[#BA7517] text-white hover:bg-[#8a5810]"
                    >
                      السؤال التالي
                    </Button>
                  )}

                  {/* Close Button */}
                  {currentQuestionIndex === quizData.questions.length - 1 && quizAnswered && (
                    <Button
                      onClick={() => setStudioOpen(false)}
                      className="w-full bg-gray-500 text-white hover:bg-gray-600"
                    >
                      إغلاق
                    </Button>
                  )}
                </>
              )}

              {/* PowerPoint Display */}
              {studioMode === "pptx" && studioContent && (
                <>
                  <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-words text-right">
                      {studioContent}
                    </pre>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-right">
                    <p className="font-semibold mb-2">📌 ملاحظة:</p>
                    <p className="text-xs">محتوى الشرائح جاهز. يمكنك نسخه وإنشاء عرض تقديمي في PowerPoint أو Google Slides.</p>
                  </div>
                  <DialogFooter className="flex gap-2 justify-end">
                    <Button
                      onClick={copyToClipboard}
                      className="gap-2 bg-gray-500 text-white hover:bg-gray-600"
                    >
                      نسخ
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
