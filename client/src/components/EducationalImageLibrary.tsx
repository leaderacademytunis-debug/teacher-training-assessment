import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LibraryImage {
  id: string;
  url: string;
  title_ar: string;
  title_fr?: string;
  category: string;
  subject: string;
  tags: string[];
}

// Tunisia map CDN URL
const TUNISIA_MAP_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/tunisia-map_3f49e2c4.webp";

// Pre-built educational image library
const LIBRARY_IMAGES: LibraryImage[] = [
  // Geography - Tunisia
  {
    id: "tunisia-map-political",
    url: TUNISIA_MAP_URL,
    title_ar: "خريطة تونس السياسية",
    title_fr: "Carte politique de la Tunisie",
    category: "جغرافيا",
    subject: "الإيقاظ العلمي",
    tags: ["تونس", "خريطة", "ولايات", "جغرافيا", "مناطق"],
  },
  // Science - Human Body
  {
    id: "digestive-system",
    url: "",
    title_ar: "الجهاز الهضمي",
    title_fr: "Le système digestif",
    category: "جسم الإنسان",
    subject: "الإيقاظ العلمي",
    tags: ["جهاز هضمي", "معدة", "أمعاء", "جسم الإنسان"],
  },
  {
    id: "respiratory-system",
    url: "",
    title_ar: "الجهاز التنفسي",
    title_fr: "Le système respiratoire",
    category: "جسم الإنسان",
    subject: "الإيقاظ العلمي",
    tags: ["جهاز تنفسي", "رئتان", "تنفس", "جسم الإنسان"],
  },
  {
    id: "circulatory-system",
    url: "",
    title_ar: "الجهاز الدوري",
    title_fr: "Le système circulatoire",
    category: "جسم الإنسان",
    subject: "الإيقاظ العلمي",
    tags: ["جهاز دوري", "قلب", "دم", "شرايين"],
  },
  {
    id: "skeleton",
    url: "",
    title_ar: "الهيكل العظمي",
    title_fr: "Le squelette",
    category: "جسم الإنسان",
    subject: "الإيقاظ العلمي",
    tags: ["هيكل عظمي", "عظام", "جسم الإنسان"],
  },
  {
    id: "five-senses",
    url: "",
    title_ar: "الحواس الخمس",
    title_fr: "Les cinq sens",
    category: "جسم الإنسان",
    subject: "الإيقاظ العلمي",
    tags: ["حواس", "بصر", "سمع", "شم", "ذوق", "لمس"],
  },
  // Science - Nature
  {
    id: "water-cycle",
    url: "",
    title_ar: "دورة الماء في الطبيعة",
    title_fr: "Le cycle de l'eau",
    category: "الطبيعة",
    subject: "الإيقاظ العلمي",
    tags: ["ماء", "دورة", "تبخر", "تكاثف", "مطر"],
  },
  {
    id: "plant-parts",
    url: "",
    title_ar: "أجزاء النبتة",
    title_fr: "Les parties de la plante",
    category: "الطبيعة",
    subject: "الإيقاظ العلمي",
    tags: ["نبتة", "جذر", "ساق", "ورقة", "زهرة"],
  },
  {
    id: "plant-lifecycle",
    url: "",
    title_ar: "دورة حياة النبات",
    title_fr: "Le cycle de vie de la plante",
    category: "الطبيعة",
    subject: "الإيقاظ العلمي",
    tags: ["نبات", "بذرة", "إنبات", "نمو"],
  },
  {
    id: "food-chain",
    url: "",
    title_ar: "السلسلة الغذائية",
    title_fr: "La chaîne alimentaire",
    category: "الطبيعة",
    subject: "الإيقاظ العلمي",
    tags: ["سلسلة غذائية", "حيوانات", "نباتات", "تغذية"],
  },
  {
    id: "solar-system",
    url: "",
    title_ar: "المجموعة الشمسية",
    title_fr: "Le système solaire",
    category: "الفضاء",
    subject: "الإيقاظ العلمي",
    tags: ["كواكب", "شمس", "فضاء", "أرض"],
  },
  {
    id: "seasons",
    url: "",
    title_ar: "الفصول الأربعة",
    title_fr: "Les quatre saisons",
    category: "الطبيعة",
    subject: "الإيقاظ العلمي",
    tags: ["فصول", "شتاء", "ربيع", "صيف", "خريف"],
  },
  // Math
  {
    id: "geometric-shapes",
    url: "",
    title_ar: "الأشكال الهندسية",
    title_fr: "Les formes géométriques",
    category: "هندسة",
    subject: "الرياضيات",
    tags: ["أشكال", "مربع", "مثلث", "دائرة", "مستطيل"],
  },
  {
    id: "3d-shapes",
    url: "",
    title_ar: "المجسمات",
    title_fr: "Les solides",
    category: "هندسة",
    subject: "الرياضيات",
    tags: ["مجسمات", "مكعب", "أسطوانة", "كرة", "هرم"],
  },
  {
    id: "fractions",
    url: "",
    title_ar: "الكسور",
    title_fr: "Les fractions",
    category: "أعداد",
    subject: "الرياضيات",
    tags: ["كسور", "نصف", "ربع", "ثلث"],
  },
  // Islamic Education
  {
    id: "prayer-positions",
    url: "",
    title_ar: "أركان الصلاة",
    title_fr: "Les piliers de la prière",
    category: "عبادات",
    subject: "التربية الإسلامية",
    tags: ["صلاة", "ركوع", "سجود", "قيام"],
  },
  {
    id: "wudu-steps",
    url: "",
    title_ar: "خطوات الوضوء",
    title_fr: "Les étapes de l'ablution",
    category: "عبادات",
    subject: "التربية الإسلامية",
    tags: ["وضوء", "طهارة", "غسل"],
  },
  // Civic Education
  {
    id: "tunisia-flag",
    url: "",
    title_ar: "العلم التونسي",
    title_fr: "Le drapeau tunisien",
    category: "رموز وطنية",
    subject: "التربية المدنية",
    tags: ["علم", "تونس", "وطن", "رموز"],
  },
  {
    id: "road-signs",
    url: "",
    title_ar: "إشارات المرور",
    title_fr: "Les panneaux de signalisation",
    category: "سلامة",
    subject: "التربية المدنية",
    tags: ["مرور", "إشارات", "سلامة", "طريق"],
  },
];

// Get unique categories
const CATEGORIES = Array.from(new Set(LIBRARY_IMAGES.map((img) => img.category)));
const SUBJECTS_LIST = Array.from(new Set(LIBRARY_IMAGES.map((img) => img.subject)));

interface EducationalImageLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (image: { url: string; caption: string }) => void;
  onGenerateRequest?: (prompt: string) => void;
}

export default function EducationalImageLibrary({
  open,
  onClose,
  onSelect,
  onGenerateRequest,
}: EducationalImageLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("الكل");

  const filteredImages = LIBRARY_IMAGES.filter((img) => {
    const matchesSearch =
      !searchQuery ||
      img.title_ar.includes(searchQuery) ||
      img.tags.some((t) => t.includes(searchQuery)) ||
      (img.title_fr && img.title_fr.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = activeSubject === "الكل" || img.subject === activeSubject;
    return matchesSearch && matchesSubject;
  });

  const handleSelect = (img: LibraryImage) => {
    if (img.url) {
      onSelect({ url: img.url, caption: img.title_ar });
      onClose();
    } else if (onGenerateRequest) {
      // Image not pre-loaded, generate it
      onGenerateRequest(img.title_ar);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-slate-900 border-white/20 text-white max-w-3xl max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            🖼️ مكتبة الصور التعليمية الجاهزة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن صورة... (مثال: جهاز هضمي، خريطة، كسور)"
            className="bg-white/10 border-white/20 text-white text-sm"
            dir="rtl"
          />

          {/* Subject tabs */}
          <Tabs value={activeSubject} onValueChange={setActiveSubject}>
            <TabsList className="bg-white/10 border border-white/20 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger
                value="الكل"
                className="text-xs data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                الكل ({LIBRARY_IMAGES.length})
              </TabsTrigger>
              {SUBJECTS_LIST.map((subj) => (
                <TabsTrigger
                  key={subj}
                  value={subj}
                  className="text-xs data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                >
                  {subj} ({LIBRARY_IMAGES.filter((i) => i.subject === subj).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Image grid */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-10 text-white/40">
              <div className="text-4xl mb-3">🔍</div>
              <p>لا توجد صور مطابقة للبحث</p>
              <p className="text-sm mt-1">جرّب كلمات بحث أخرى</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:border-violet-400/50 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handleSelect(img)}
                >
                  {/* Image or placeholder */}
                  <div className="aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.title_ar}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center text-gray-400 p-3">
                        <div className="text-3xl mb-1">🎨</div>
                        <p className="text-xs text-gray-500">اضغط لتوليد</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs font-semibold text-white truncate">{img.title_ar}</p>
                    {img.title_fr && (
                      <p className="text-[10px] text-white/40 truncate" dir="ltr">
                        {img.title_fr}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[9px] border-blue-400/30 text-blue-300 px-1 py-0"
                      >
                        {img.category}
                      </Badge>
                      {img.url ? (
                        <Badge className="text-[9px] bg-green-700/50 text-green-300 px-1 py-0">
                          جاهزة
                        </Badge>
                      ) : (
                        <Badge className="text-[9px] bg-violet-700/50 text-violet-300 px-1 py-0">
                          توليد AI
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-violet-700 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                      {img.url ? "📥 إدراج" : "🎨 توليد وإدراج"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-white/40 text-center">
            الصور المعلّمة بـ "جاهزة" متوفرة فوراً. الصور المعلّمة بـ "توليد AI" سيتم توليدها عند الاختيار.
            <br />
            🇹🇳 خريطة تونس الرسمية متوفرة في قسم الجغرافيا.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
