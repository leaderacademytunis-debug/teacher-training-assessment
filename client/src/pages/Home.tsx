import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, GraduationCap, Users, Award, Loader2, UserPlus, MessageSquare, ClipboardCheck, Globe } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Link } from "wouter";
import { useState } from "react";
import { ChatAssistant } from "@/components/ChatAssistant";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const courseIcons: Record<string, typeof BookOpen> = {
  primary_teachers: GraduationCap,
  arabic_teachers: BookOpen,
  science_teachers: Award,
  french_teachers: BookOpen,
  preschool_facilitators: Users,
  special_needs_companions: Users,
  digital_teacher_ai: Award,
};

const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇹🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery(undefined, {
    enabled: !!user,
  });

  const enrolledCourseIds = new Set(enrollments?.map(e => e.enrollment.courseId) || []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/sfeDbyveKFJjGBLQ.png" 
                alt="Leader Academy Logo" 
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ليدر أكاديمي</h1>
                <p className="text-gray-600 mt-1">{t("نحو تعليم رقمي متميز", "Vers un enseignement numérique d'excellence", "Towards Excellence in Digital Education")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 font-medium">
                    <Globe className="w-4 h-4" />
                    <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                    <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.label}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`gap-2 cursor-pointer ${language === lang.code ? "bg-primary/10 font-semibold" : ""}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="mr-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {user ? (
                <>
                  <NotificationBell />
                  {!user.registrationCompleted && (
                    <Link href="/complete-registration">
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        <UserPlus className="w-4 h-4 ml-2" />
                        {t("إكمال التسجيل", "Compléter l'inscription", "Complete Registration")}
                      </Button>
                    </Link>
                  )}
                  {["admin", "trainer", "supervisor"].includes(user.role) && (
                    <Link href="/dashboard">
                      <Button variant="outline">{t("لوحة التحكم", "Tableau de bord", "Dashboard")}</Button>
                    </Link>
                  )}
                  <Link href="/assistant">
                    <Button 
                      variant="default" 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageSquare className="w-4 h-4 ml-2" />
                      {t("المساعد البيداغوجي", "Assistant Pédagogique", "Pedagogical Assistant")}
                    </Button>
                  </Link>
                  <Link href="/evaluate-fiche">
                    <Button 
                      variant="default"
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <ClipboardCheck className="w-4 h-4 ml-2" />
                      {t("تقييم الفيشة", "Évaluer la fiche", "Evaluate Lesson Plan")}
                    </Button>
                  </Link>
                  <Link href="/teacher-tools">
                    <Button variant="outline">{t("أدوات المدرس", "Outils enseignant", "Teacher Tools")}</Button>
                  </Link>
                  <Link href="/shared-library">
                    <Button variant="outline">{t("المكتبة المشتركة", "Bibliothèque partagée", "Shared Library")}</Button>
                  </Link>
                  <Link href="/template-library">
                    <Button variant="outline">{t("القوالب الجاهزة", "Modèles prêts", "Ready Templates")}</Button>
                  </Link>
                  <Link href="/my-courses">
                    <Button>{t("دوراتي", "Mes cours", "My Courses")}</Button>
                  </Link>
                  <Link href="/my-certificates">
                    <Button variant="outline">{t("شهاداتي", "Mes certificats", "My Certificates")}</Button>
                  </Link>
                  <Link href="/verify">
                    <Button variant="ghost">{t("التحقق من شهادة", "Vérifier un certificat", "Verify Certificate")}</Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>{t("تسجيل الدخول", "Se connecter", "Sign In")}</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            {t("ليدر أكاديمي — منصة تأهيل المدرسين", "Leader Academy — Plateforme de formation des enseignants", "Leader Academy — Teacher Training Platform")}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {t("برامج تدريبية متخصصة بالذكاء الاصطناعي لتطوير كفاءات المدرسين وتعزيز التعليم الرقمي في تونس", "Programmes de formation spécialisés en IA pour développer les compétences des enseignants et renforcer l'éducation numérique en Tunisie", "AI-powered specialized training programs to develop teachers' skills and enhance digital education in Tunisia")}
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => {
            const Icon = courseIcons[course.category] || BookOpen;
            const isEnrolled = enrolledCourseIds.has(course.id);
            
            return (
              <Card 
                key={course.id} 
                className="hover:shadow-lg transition-shadow duration-300 bg-white border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{course.titleAr}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {course.descriptionAr || t("دورة تدريبية متخصصة لتطوير مهارات المعلمين", "Formation spécialisée pour développer les compétences des enseignants", "Specialized training to develop teachers' skills")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {course.duration && (
                      <span className="text-sm text-gray-600">
                        {t("المدة:", "Durée:", "Duration:")} {course.duration} {t("ساعة", "h", "h")}
                      </span>
                    )}
                  </div>
                  {user ? (
                    isEnrolled ? (
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full" variant="outline">
                          {t("متابعة الدورة", "Continuer la formation", "Continue Course")}
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full">
                          {t("التسجيل في الدورة", "S'inscrire à la formation", "Enroll in Course")}
                        </Button>
                      </Link>
                    )
                  ) : (
                    <a href={getLoginUrl()}>
                      <Button className="w-full">
                        {t("سجل للالتحاق بالدورة", "Connectez-vous pour vous inscrire", "Sign in to Enroll")}
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!courses || courses.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("لا توجد دورات متاحة حالياً", "Aucune formation disponible actuellement", "No courses available currently")}</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 border-t">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">{t("لماذا تختار منصتنا؟", "Pourquoi choisir notre plateforme ?", "Why Choose Our Platform?")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("محتوى تعليمي متميز", "Contenu pédagogique de qualité", "Quality Educational Content")}</h4>
              <p className="text-gray-600">{t("دورات مصممة بعناية من قبل خبراء التعليم", "Formations conçues par des experts en éducation", "Courses designed by education experts")}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("تقييم فوري", "Évaluation instantanée", "Instant Assessment")}</h4>
              <p className="text-gray-600">{t("اختبارات تفاعلية مع نتائج فورية", "Tests interactifs avec résultats immédiats", "Interactive tests with instant results")}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t("متابعة مستمرة", "Suivi continu", "Continuous Follow-up")}</h4>
              <p className="text-gray-600">{t("تقارير مفصلة لتتبع تقدمك", "Rapports détaillés pour suivre votre progression", "Detailed reports to track your progress")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="text-gray-400">
            {t("© 2026 ليدر أكاديمي. جميع الحقوق محفوظة.", "© 2026 Leader Academy. Tous droits réservés.", "© 2026 Leader Academy. All rights reserved.")}
          </p>
        </div>
      </footer>
      
      <ChatAssistant 
        externalIsOpen={isChatOpen} 
        onExternalOpenChange={setIsChatOpen} 
      />
    </div>
  );
}
