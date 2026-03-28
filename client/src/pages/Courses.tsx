import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Clock, Users, Star, Search, GraduationCap,
  ArrowLeft, Filter, Sparkles, Award, Loader2, ChevronLeft
} from "lucide-react";
import useI18n from "@/i18n";


const CATEGORY_OPTIONS = [
  { value: "all", labelAr: "جميع الدورات", labelFr: "Toutes les formations" },
  { value: "primary_teachers", labelAr: "تأهيل مدرسي الابتدائي", labelFr: "Enseignants du primaire" },
  { value: "arabic_teachers", labelAr: "تأهيل مدرسي العربية", labelFr: "Enseignants d'arabe" },
  { value: "science_teachers", labelAr: "تأهيل مدرسي العلوم", labelFr: "Enseignants de sciences" },
  { value: "french_teachers", labelAr: "تأهيل مدرسي الفرنسية", labelFr: "Enseignants de français" },
  { value: "preschool_facilitators", labelAr: "تأهيل منشطي التحضيري", labelFr: "Animateurs préscolaire" },
  { value: "special_needs_companions", labelAr: "مرافقة ذوي صعوبات التعلّم", labelFr: "Accompagnement spécialisé" },
  { value: "digital_teacher_ai", labelAr: "المعلم الرقمي والذكاء الاصطناعي", labelFr: "Enseignant numérique & IA" },
  { value: "bundle", labelAr: "الباقات الشاملة", labelFr: "Packs complets" },
];

const CATEGORY_COLORS: Record<string, string> = {
  primary_teachers: "#1A237E",
  arabic_teachers: "#00897B",
  science_teachers: "#7B1FA2",
  french_teachers: "#C62828",
  preschool_facilitators: "#F57F17",
  special_needs_companions: "#00695C",
  digital_teacher_ai: "#283593",
  bundle: "#FF6D00",
};

export default function Courses() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user } = useAuth();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, { enabled: !!user });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Using t from useI18n instead of local t function

  const enrolledCourseIds = useMemo(() => {
    if (!enrollments) return new Set<number>();
    return new Set(enrollments.filter((e: any) => e.status === "approved").map((e: any) => e.courseId));
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    let result = courses.filter((c: any) => c.isActive);
    if (selectedCategory !== "all") {
      result = result.filter((c: any) => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((c: any) =>
        c.titleAr?.toLowerCase().includes(q) ||
        c.descriptionAr?.toLowerCase().includes(q) ||
        c.descriptionShortAr?.toLowerCase().includes(q)
      );
    }
    // Sort: featured first, then by sortOrder
    result.sort((a: any, b: any) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    return result;
  }, [courses, selectedCategory, searchQuery]);

  const bundleCourses = filteredCourses.filter((c: any) => c.isBundle);
  const regularCourses = filteredCourses.filter((c: any) => !c.isBundle);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A237E 0%, #283593 40%, #1565C0 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 end-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 start-10 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ChevronLeft className="w-4 h-4 ms-1" />
                {t("الرئيسية", "Accueil")}
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <GraduationCap className="w-5 h-5 text-orange-400" />
              <span className="text-white/90 text-sm font-medium">{t("دورات تدريبية معتمدة", "Formations certifiées")}</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4"
              style={{ fontFamily: "'Cairo', 'Almarai', sans-serif" }}
            >
              {t("جميع الدورات التدريبية", "Toutes les formations")}
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto" style={{ fontFamily: "'Almarai', sans-serif" }}>
              {t(
                "اكتشف مجموعة متنوعة من الدورات المصممة خصيصاً لتطوير مهاراتك التربوية والرقمية",
                "Découvrez une variété de formations conçues pour développer vos compétences pédagogiques et numériques"
              )}
            </p>
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-black text-white">{courses?.filter((c: any) => c.isActive && !c.isBundle).length || 0}</p>
                <p className="text-blue-200 text-sm">{t("دورة متاحة", "Formations disponibles")}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-orange-400">+5000</p>
                <p className="text-blue-200 text-sm">{t("مدرّس مُكوَّن", "Enseignants formés")}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-white">98%</p>
                <p className="text-blue-200 text-sm">{t("نسبة الرضا", "Taux de satisfaction")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t("ابحث عن دورة...", "Rechercher une formation...")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pe-10 rounded-xl border-gray-200 h-11"
                style={{ fontFamily: "'Almarai', sans-serif" }}
              />
            </div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? "text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={selectedCategory === cat.value ? {
                    background: cat.value === "all" ? "#1A237E" : (CATEGORY_COLORS[cat.value] || "#1A237E"),
                    fontFamily: "'Almarai', sans-serif"
                  } : { fontFamily: "'Almarai', sans-serif" }}
                >
                  {t(cat.labelAr, cat.labelFr)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A237E]" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(26,35,126,0.08)" }}>
                <Search className="w-10 h-10" style={{ color: "#1A237E" }} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {t("لا توجد دورات مطابقة", "Aucune formation trouvée")}
              </h3>
              <p className="text-gray-500">{t("جرّب تغيير معايير البحث أو الفئة", "Essayez de modifier vos critères de recherche")}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
              >
                {t("عرض جميع الدورات", "Afficher toutes les formations")}
              </Button>
            </div>
          ) : (
            <>
              {/* Bundle Courses First */}
              {bundleCourses.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    <Sparkles className="w-6 h-6 text-orange-500" />
                    {t("الباقات الشاملة", "Packs complets")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bundleCourses.map((course: any) => (
                      <Link key={course.id} href={`/courses/${course.id}`}>
                        <Card className="rounded-2xl border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden h-full bg-gradient-to-br from-orange-50 to-amber-50">
                          <div className="relative h-52 overflow-hidden">
                            {course.coverImageUrl ? (
                              <img src={course.coverImageUrl} alt={course.titleAr} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#FF6D00] to-[#FF8F00] flex items-center justify-center">
                                <Sparkles className="w-16 h-16 text-white/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge className="absolute top-4 end-4 bg-orange-500 text-white border-0 rounded-lg px-3 py-1 text-sm font-bold">
                              {t("باقة شاملة", "Pack complet")}
                            </Badge>
                            {course.originalPrice && course.originalPrice > (course.price || 0) && (
                              <Badge className="absolute top-4 start-4 bg-red-500 text-white border-0 rounded-lg px-3 py-1 text-sm font-bold">
                                -{Math.round(((course.originalPrice - (course.price || 0)) / course.originalPrice) * 100)}%
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{course.titleAr}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.descriptionShortAr || course.descriptionAr}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {course.price ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-orange-500">{course.price} {t("د.ت", "DT")}</span>
                                    {course.originalPrice && course.originalPrice > course.price && (
                                      <span className="text-sm text-gray-400 line-through">{course.originalPrice} {t("د.ت", "DT")}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-green-600">{t("مجاني", "Gratuit")}</span>
                                )}
                              </div>
                              {course.duration && (
                                <span className="flex items-center gap-1 text-gray-500 text-sm">
                                  <Clock className="w-4 h-4" />
                                  {course.duration} {t("ساعة", "h")}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Courses */}
              {regularCourses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    <GraduationCap className="w-6 h-6 text-[#1A237E]" />
                    {selectedCategory === "all"
                      ? t("الدورات التدريبية", "Les formations")
                      : CATEGORY_OPTIONS.find(c => c.value === selectedCategory)
                        ? t(CATEGORY_OPTIONS.find(c => c.value === selectedCategory)!.labelAr, CATEGORY_OPTIONS.find(c => c.value === selectedCategory)!.labelFr)
                        : t("الدورات التدريبية", "Les formations")
                    }
                    <Badge variant="secondary" className="text-xs">{regularCourses.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {regularCourses.map((course: any) => {
                      const isEnrolled = enrolledCourseIds.has(course.id);
                      const catColor = CATEGORY_COLORS[course.category] || "#1A237E";
                      const catLabel = CATEGORY_OPTIONS.find(c => c.value === course.category);
                      return (
                        <Card key={course.id} className="rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden h-full flex flex-col">
                          <Link href={`/courses/${course.id}`}>
                            <div className="relative h-44 overflow-hidden">
                              {course.coverImageUrl ? (
                                <img src={course.coverImageUrl} alt={course.titleAr} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)` }}>
                                  <BookOpen className="w-12 h-12 text-white/40" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              {course.isFeatured && (
                                <Badge className="absolute top-3 end-3 bg-yellow-500 text-white border-0 rounded-lg text-xs">
                                  <Star className="w-3 h-3 ms-1 fill-current" /> {t("مميّزة", "En vedette")}
                                </Badge>
                              )}
                              {catLabel && (
                                <Badge className="absolute bottom-3 end-3 text-white border-0 rounded-lg text-xs" style={{ background: catColor }}>
                                  {t(catLabel.labelAr, catLabel.labelFr)}
                                </Badge>
                              )}
                              {course.price ? (
                                <Badge className="absolute bottom-3 start-3 bg-orange-500 text-white border-0 rounded-lg text-xs font-bold">
                                  {course.price} {t("د.ت", "DT")}
                                </Badge>
                              ) : (
                                <Badge className="absolute bottom-3 start-3 bg-green-500 text-white border-0 rounded-lg text-xs font-bold">
                                  {t("مجاني", "Gratuit")}
                                </Badge>
                              )}
                            </div>
                          </Link>
                          <CardContent className="p-4 flex flex-col flex-1">
                            <Link href={`/courses/${course.id}`}>
                              <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-[#1A237E] transition-colors" style={{ fontFamily: "'Almarai', sans-serif" }}>
                                {course.titleAr}
                              </h3>
                            </Link>
                            <p className="text-gray-500 text-xs mb-3 line-clamp-2 flex-1">
                              {course.descriptionShortAr || course.descriptionAr || t("دورة تدريبية متخصصة", "Formation spécialisée")}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                              {course.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {course.duration} {t("ساعة", "h")}
                                </span>
                              )}
                              {course.schedule && (
                                <span className="text-xs text-gray-400 truncate max-w-[120px]">{course.schedule}</span>
                              )}
                            </div>
                            {/* Price Row */}
                            {course.originalPrice && course.originalPrice > (course.price || 0) && (
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg font-black text-orange-500">{course.price} {t("د.ت", "DT")}</span>
                                <span className="text-xs text-gray-400 line-through">{course.originalPrice} {t("د.ت", "DT")}</span>
                                <Badge className="bg-red-100 text-red-600 border-0 text-xs">
                                  -{Math.round(((course.originalPrice - (course.price || 0)) / course.originalPrice) * 100)}%
                                </Badge>
                              </div>
                            )}
                            {/* CTA Button */}
                            {user ? (
                              isEnrolled ? (
                                <Link href={`/courses/${course.id}`}>
                                  <button
                                    className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 hover:shadow-md"
                                    style={{ borderColor: "#1A237E", color: "#1A237E", background: "transparent" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#1A237E"; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A237E"; }}
                                  >
                                    {t("متابعة الدورة", "Continuer")}
                                  </button>
                                </Link>
                              ) : (
                                <Link href={`/courses/${course.id}`}>
                                  <button
                                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:brightness-110"
                                    style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)` }}
                                  >
                                    {t("تفاصيل الدورة", "Détails du cours")}
                                  </button>
                                </Link>
                              )
                            ) : (
                              <a href={getLoginUrl()}>
                                <button
                                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:brightness-110"
                                  style={{ background: "linear-gradient(135deg, #FF6D00, #FF8F00)" }}
                                >
                                  {t("سجّل الآن", "S'inscrire")}
                                </button>
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#1A237E] to-[#1565C0]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t("لم تجد ما تبحث عنه؟", "Vous n'avez pas trouvé ce que vous cherchez?")}
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            {t("تواصل معنا وسنساعدك في إيجاد الدورة المناسبة لاحتياجاتك", "Contactez-nous et nous vous aiderons à trouver la formation adaptée")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 font-bold">
                {t("تواصل معنا", "Contactez-nous")}
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl px-8 font-bold">
                <ArrowLeft className="w-5 h-5 ms-2" />
                {t("العودة للرئيسية", "Retour à l'accueil")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
