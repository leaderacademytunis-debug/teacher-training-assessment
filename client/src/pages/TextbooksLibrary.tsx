import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Upload, Library,
  GraduationCap, Calculator, FlaskConical, Globe2,
} from "lucide-react";
import ToolPageHeader from "@/components/ToolPageHeader";

const LIBRARY_GRADIENT = "linear-gradient(135deg, #f59e0b, #d97706)";

interface TextbookItem {
  id: string;
  title: string;
  titleFr: string;
  subject: string;
  level: string;
  icon: typeof Globe2;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const MOCK_TEXTBOOKS: TextbookItem[] = [
  {
    id: "fr-3",
    title: "كتاب الفرنسية - السنة 3",
    titleFr: "Livre de Français - 3ème année",
    subject: "الفرنسية",
    level: "السنة 3",
    icon: Globe2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "كتاب القراءة والتعبير الفرنسي للسنة الثالثة ابتدائي",
  },
  {
    id: "math-4",
    title: "كتاب الرياضيات - السنة 4",
    titleFr: "Livre de Mathématiques - 4ème année",
    subject: "الرياضيات",
    level: "السنة 4",
    icon: Calculator,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "كتاب الرياضيات الرسمي للسنة الرابعة ابتدائي",
  },
  {
    id: "science-5",
    title: "كتاب الإيقاظ العلمي - السنة 5",
    titleFr: "Livre d'Éveil Scientifique - 5ème année",
    subject: "الإيقاظ العلمي",
    level: "السنة 5",
    icon: FlaskConical,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "كتاب الإيقاظ العلمي للسنة الخامسة ابتدائي",
  },
  {
    id: "fr-6",
    title: "كتاب الفرنسية - السنة 6",
    titleFr: "Livre de Français - 6ème année",
    subject: "الفرنسية",
    level: "السنة 6",
    icon: Globe2,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "كتاب القراءة والتعبير الفرنسي للسنة السادسة ابتدائي",
  },
];

export default function TextbooksLibrary() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = Array.from(new Set(MOCK_TEXTBOOKS.map((b) => b.subject)));

  const filtered = MOCK_TEXTBOOKS.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.title.includes(searchQuery) ||
      book.titleFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subject.includes(searchQuery);
    const matchesSubject = !selectedSubject || book.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleBookClick = (book: TextbookItem) => {
    navigate(`/textbook-viewer?bookId=${book.id}&bookTitle=${encodeURIComponent(book.title)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30" dir="rtl">
      <ToolPageHeader
        nameAr="المكتبة المرجعية"
        descAr="الكتب المدرسية التونسية الرسمية"
        gradient={LIBRARY_GRADIENT}
        icon={Library}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن كتاب..."
              className="pr-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedSubject === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(null)}
              className={selectedSubject === null ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              الكل
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
                className={selectedSubject === subject ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((book) => {
            const Icon = book.icon;
            return (
              <Card
                key={book.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border ${book.borderColor} overflow-hidden group`}
                onClick={() => handleBookClick(book)}
              >
                <CardContent className="p-0">
                  {/* Book Cover */}
                  <div className={`${book.bgColor} p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-2 left-2 w-20 h-20 border-2 border-current rounded-full" />
                      <div className="absolute bottom-2 right-2 w-16 h-16 border-2 border-current rounded-lg rotate-12" />
                    </div>
                    <div className={`w-16 h-16 rounded-2xl ${book.bgColor} border-2 ${book.borderColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${book.color}`} />
                    </div>
                    <span className={`text-xs font-bold ${book.color} bg-white/80 px-3 py-1 rounded-full`}>
                      {book.level}
                    </span>
                  </div>
                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2" style={{ fontFamily: "'Almarai', sans-serif" }}>
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">{book.titleFr}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{book.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Upload Custom Book Card */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-dashed border-slate-300 overflow-hidden group"
            onClick={() => navigate("/textbook-viewer")}
          >
            <CardContent className="p-0">
              <div className="bg-slate-50 p-6 flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full">
                  تحميل مخصص
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-600 mb-1" style={{ fontFamily: "'Almarai', sans-serif" }}>
                  تحميل كتاب خاص
                </h3>
                <p className="text-xs text-slate-400">حمّل أي ملف PDF لاستخراج المحتوى منه</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-800 mb-1" style={{ fontFamily: "'Almarai', sans-serif" }}>
                كيف تعمل المكتبة التفاعلية؟
              </h3>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>اختر كتاباً مدرسياً أو حمّل ملف PDF خاص بك</li>
                <li>استخدم أداة الاقتطاع لتحديد فقرة أو نص من أي صفحة</li>
                <li>يتم استخراج النص تلقائياً بتقنية الذكاء الاصطناعي</li>
                <li>أرسل النص مباشرة إلى محضر الدروس أو أداة الاختبارات أو الاستوديو</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
