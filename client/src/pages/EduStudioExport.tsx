import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import useI18n from "@/i18n";


interface ExportData {
  title: string;
  summary: string;
  scenes: Array<{
    scene: {
      sceneNumber: number;
      title: string;
      description: string;
      educationalContent: string;
      duration: number;
      transition: string;
    };
    visualPrompt?: {
      visualPrompt: string;
      negativePrompt: string;
      suggestedTool: string;
      aspectRatio: string;
    };
    voiceover?: {
      spokenText: string;
      performanceNotes: string;
      pace: string;
      emphasis: string[];
      estimatedDuration: number;
      emotionalTone: string;
    };
  }>;
  totalDuration: number;
  visualStyle: string;
  voiceLanguage: string;
}

export default function EduStudioExport() {
  const { t, lang, isRTL, dir } = useI18n();
  const [data, setData] = useState<ExportData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("edu_studio_export");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load export data", e);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل خطة الإنتاج...</p>
          <Link href="/leader-visual-studio">
            <button className="mt-4 text-purple-600 underline text-sm">العودة إلى الاستوديو</button>
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("ar-TN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/leader-visual-studio">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeft className="w-4 h-4" />
              العودة إلى الاستوديو
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 me-2" />
              طباعة / حفظ PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none my-8 print:my-0">
        {/* Cover Page */}
        <div className="p-12 print:p-10 min-h-[297mm] print:min-h-[297mm] flex flex-col" style={{ pageBreakAfter: "always" }}>
          {/* Header */}
          <div className="text-center border-b-4 border-purple-600 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              🎬 Edu-Studio Engine — Leader Academy
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4" dir="auto">{data.title}</h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto" dir="auto">{data.summary}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">معلومات الإنتاج</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-1 text-gray-500">عدد المشاهد:</td><td className="py-1 font-medium text-gray-900">{data.scenes.length}</td></tr>
                  <tr><td className="py-1 text-gray-500">المدة الإجمالية:</td><td className="py-1 font-medium text-gray-900">{data.totalDuration} ثانية</td></tr>
                  <tr><td className="py-1 text-gray-500">النمط البصري:</td><td className="py-1 font-medium text-gray-900">{data.visualStyle}</td></tr>
                  <tr><td className="py-1 text-gray-500">لغة التعليق:</td><td className="py-1 font-medium text-gray-900">{data.voiceLanguage === "ar" ? "عربي" : data.voiceLanguage === "fr" ? "فرنسي" : "إنجليزي"}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">التاريخ والمصدر</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr><td className="py-1 text-gray-500">تاريخ الإنشاء:</td><td className="py-1 font-medium text-gray-900">{today}</td></tr>
                  <tr><td className="py-1 text-gray-500">المنصة:</td><td className="py-1 font-medium text-gray-900">Leader Academy</td></tr>
                  <tr><td className="py-1 text-gray-500">الأداة:</td><td className="py-1 font-medium text-gray-900">Edu-Studio Engine</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Scene Overview Table */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">نظرة عامة على المشاهد</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-purple-50">
                  <th className="border border-purple-200 px-3 py-2 text-end font-semibold text-purple-700">#</th>
                  <th className="border border-purple-200 px-3 py-2 text-end font-semibold text-purple-700">العنوان</th>
                  <th className="border border-purple-200 px-3 py-2 text-end font-semibold text-purple-700">المدة</th>
                  <th className="border border-purple-200 px-3 py-2 text-end font-semibold text-purple-700">الانتقال</th>
                  <th className="border border-purple-200 px-3 py-2 text-center font-semibold text-purple-700">بصري</th>
                  <th className="border border-purple-200 px-3 py-2 text-center font-semibold text-purple-700">صوتي</th>
                </tr>
              </thead>
              <tbody>
                {data.scenes.map(card => (
                  <tr key={card.scene.sceneNumber} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 font-bold text-purple-600">{card.scene.sceneNumber}</td>
                    <td className="border border-gray-200 px-3 py-2" dir="auto">{card.scene.title}</td>
                    <td className="border border-gray-200 px-3 py-2">{card.scene.duration}s</td>
                    <td className="border border-gray-200 px-3 py-2">{card.scene.transition}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{card.visualPrompt ? "✅" : "—"}</td>
                    <td className="border border-gray-200 px-3 py-2 text-center">{card.voiceover ? "✅" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
            Leader Academy — Edu-Studio Engine — {today}
          </div>
        </div>

        {/* Scene Detail Pages */}
        {data.scenes.map((card, idx) => (
          <div key={card.scene.sceneNumber} className="p-10 print:p-8 min-h-[297mm] print:min-h-[297mm]" style={{ pageBreakAfter: idx < data.scenes.length - 1 ? "always" : "auto" }}>
            {/* Scene Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-purple-600">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                {card.scene.sceneNumber}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900" dir="auto">{card.scene.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>⏱ {card.scene.duration}s</span>
                  <span>🔄 {card.scene.transition}</span>
                </div>
              </div>
            </div>

            {/* Scene Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-purple-700 mb-2 uppercase tracking-wider">الوصف البصري</h3>
              <div className="bg-purple-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed" dir="auto">
                {card.scene.description}
              </div>
            </div>

            {/* Educational Content */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-purple-700 mb-2 uppercase tracking-wider">المحتوى التعليمي</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed" dir="auto">
                {card.scene.educationalContent}
              </div>
            </div>

            {/* Visual Prompt */}
            {card.visualPrompt && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-blue-700 mb-2 uppercase tracking-wider">
                  🎨 Visual Prompt — {card.visualPrompt.suggestedTool} ({card.visualPrompt.aspectRatio})
                </h3>
                <div className="bg-blue-50 rounded-xl p-4 border-s-4 border-blue-500">
                  <p className="text-sm text-blue-900 font-mono leading-relaxed">{card.visualPrompt.visualPrompt}</p>
                  {card.visualPrompt.negativePrompt && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-600">
                        <span className="font-bold text-red-500">Negative Prompt:</span> {card.visualPrompt.negativePrompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Voiceover */}
            {card.voiceover && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-green-700 mb-2 uppercase tracking-wider">
                  🎙 التعليق الصوتي — {card.voiceover.emotionalTone} • {card.voiceover.pace}
                </h3>
                <div className="bg-green-50 rounded-xl p-4 border-s-4 border-green-500">
                  <p className="text-sm text-green-900 leading-relaxed" dir="auto">{card.voiceover.spokenText}</p>
                  <div className="mt-3 pt-3 border-t border-green-200 space-y-1">
                    <p className="text-xs text-green-700">🎭 <span className="font-medium">توجيهات الأداء:</span> {card.voiceover.performanceNotes}</p>
                    {card.voiceover.emphasis.length > 0 && (
                      <p className="text-xs text-green-700">💡 <span className="font-medium">تأكيد على:</span> {card.voiceover.emphasis.join("، ")}</p>
                    )}
                    <p className="text-xs text-green-700">⏱ <span className="font-medium">المدة المقدرة:</span> ~{card.voiceover.estimatedDuration}s</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 mt-auto pt-4 border-t">
              المشهد {card.scene.sceneNumber} من {data.scenes.length} — {data.title} — Leader Academy Edu-Studio
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
