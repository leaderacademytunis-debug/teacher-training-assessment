import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Mail, Phone, MapPin, Send, CheckCircle, Loader2,
  Clock, Globe, MessageSquare,
} from "lucide-react";

const SUBJECTS_I18N = [
  { value: "inquiry", ar: "استفسار عام", fr: "Demande générale", en: "General Inquiry" },
  { value: "course", ar: "الاستفسار عن دورة تدريبية", fr: "Renseignement sur une formation", en: "Course Inquiry" },
  { value: "technical", ar: "دعم تقني", fr: "Support technique", en: "Technical Support" },
  { value: "partnership", ar: "طلب شراكة مؤسسية", fr: "Demande de partenariat", en: "Partnership Request" },
  { value: "training", ar: "طلب عرض تكوين مخصص", fr: "Demande de formation personnalisée", en: "Custom Training Request" },
  { value: "feedback", ar: "اقتراح أو ملاحظة", fr: "Suggestion ou remarque", en: "Feedback or Suggestion" },
  { value: "other", ar: "موضوع آخر", fr: "Autre sujet", en: "Other" },
];

export default function Contact() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    specialty: "",
    interest: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const sendMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(t(
        "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.",
        "Votre message a été envoyé avec succès !",
        "Your message has been sent successfully!"
      ));
    },
    onError: () => {
      toast.error(t(
        "حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.",
        "Une erreur est survenue. Veuillez réessayer.",
        "An error occurred. Please try again."
      ));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error(t("يرجى ملء جميع الحقول الإلزامية", "Veuillez remplir tous les champs obligatoires", "Please fill in all required fields"));
      return;
    }
    sendMutation.mutate(form);
  };

  const CONTACT_INFO = [
    {
      icon: Mail,
      label: t("البريد الإلكتروني", "Email", "Email"),
      value: "leaderacademy216@gmail.com",
      href: "mailto:leaderacademy216@gmail.com",
      color: "#1A237E",
      bg: "bg-blue-100",
    },
    {
      icon: Phone,
      label: t("الهاتف / واتساب", "Téléphone / WhatsApp", "Phone / WhatsApp"),
      value: t("متاح عبر البريد الإلكتروني", "Disponible par email", "Available via email"),
      href: "#",
      color: "#FF6D00",
      bg: "bg-orange-100",
    },
    {
      icon: MapPin,
      label: t("الموقع", "Localisation", "Location"),
      value: t("تونس — خدمات رقمية عبر الإنترنت", "Tunisie — Services numériques en ligne", "Tunisia — Online Digital Services"),
      href: "#",
      color: "#2E7D32",
      bg: "bg-green-100",
    },
    {
      icon: Clock,
      label: t("ساعات العمل", "Heures de travail", "Working Hours"),
      value: t("الإثنين - السبت: 8:00 - 18:00", "Lundi - Samedi : 8h00 - 18h00", "Monday - Saturday: 8:00 AM - 6:00 PM"),
      href: "#",
      color: "#1565C0",
      bg: "bg-sky-100",
    },
  ];

  const FAQ = [
    {
      q: t("كيف أبدأ باستخدام المنصة؟", "Comment commencer à utiliser la plateforme ?", "How do I start using the platform?"),
      a: t("سجّل حسابك مجاناً ثم اكتشف أدوات EDUGPT.", "Créez votre compte gratuitement puis découvrez les outils EDUGPT.", "Create your free account then explore EDUGPT tools."),
    },
    {
      q: t("هل المنصة متوافقة مع البرامج الرسمية؟", "La plateforme est-elle conforme aux programmes officiels ?", "Is the platform aligned with official curricula?"),
      a: t("نعم، جميع أدواتنا متوافقة مع البرامج التونسية 2026.", "Oui, tous nos outils sont conformes aux programmes tunisiens 2026.", "Yes, all our tools are aligned with the 2026 Tunisian curricula."),
    },
    {
      q: t("كيف أحصل على شهادة معتمدة؟", "Comment obtenir un certificat accrédité ?", "How do I get an accredited certificate?"),
      a: t("أكمل دورة تكوينية واجتز الاختبار بنجاح.", "Terminez une formation et réussissez l'examen.", "Complete a training course and pass the exam."),
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <SEOHead
        title={t("تواصل معنا", "Contactez-nous", "Contact Us")}
        description="تواصل مع فريق Leader Academy. نحن هنا لمساعدتك في كل ما يتعلق بالمنصة والتكوين والدعم التقني."
        descriptionFr="Contactez l'équipe Leader Academy. Nous sommes là pour vous aider."
        ogUrl="/contact"
      />
      <UnifiedNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg, #0D1B5E 0%, #1A237E 50%, #1565C0 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,109,0,0.3), transparent)" }} />
          <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(21,101,192,0.4), transparent)" }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ background: "rgba(255,109,0,0.2)", color: "#FFB74D" }}>
            <MessageSquare className="w-4 h-4" />
            {t("نحن هنا لمساعدتك", "Nous sommes là pour vous aider", "We're here to help")}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            {t("تواصل معنا", "Contactez-nous", "Contact Us")}
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            {t(
              "لديك سؤال أو اقتراح؟ فريق Leader Academy جاهز للإجابة على جميع استفساراتك ومساعدتك في رحلتك التعليمية.",
              "Vous avez une question ou une suggestion ? L'équipe Leader Academy est prête à répondre à toutes vos questions.",
              "Have a question or suggestion? The Leader Academy team is ready to answer all your inquiries."
            )}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map((info, i) => (
              <a
                key={i}
                href={info.href}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 text-center group"
              >
                <div className={`w-12 h-12 rounded-full ${info.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <info.icon className="w-6 h-6" style={{ color: info.color }} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{info.label}</h3>
                <p className="text-gray-500 text-xs">{info.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Side Info */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {t("شكراً لتواصلك معنا!", "Merci de nous avoir contacté !", "Thank you for contacting us!")}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {t(
                          "تم استلام رسالتك بنجاح. سيتواصل معك فريقنا عبر البريد الإلكتروني خلال 24 ساعة.",
                          "Votre message a été reçu. Notre équipe vous contactera par email sous 24 heures.",
                          "Your message has been received. Our team will contact you via email within 24 hours."
                        )}
                      </p>
                      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
                        {t("📧 يمكنك أيضاً التواصل المباشر عبر: ", "📧 Vous pouvez aussi nous contacter directement : ", "📧 You can also contact us directly: ")}
                        <a href="mailto:leaderacademy216@gmail.com" className="font-semibold underline">
                          leaderacademy216@gmail.com
                        </a>
                      </div>
                      <Button onClick={() => setSubmitted(false)} style={{ background: "#1A237E" }} className="text-white">
                        {t("إرسال رسالة أخرى", "Envoyer un autre message", "Send another message")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {t("أرسل لنا رسالة", "Envoyez-nous un message", "Send us a message")}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {t(
                            "الحقول المشار إليها بـ * إلزامية",
                            "Les champs marqués d'un * sont obligatoires",
                            "Fields marked with * are required"
                          )}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              {t("الاسم الكامل", "Nom complet", "Full Name")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              placeholder={t("مثال: محمد بن علي", "Ex: Mohamed Ben Ali", "e.g. Mohamed Ben Ali")}
                              value={form.name}
                              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              {t("البريد الإلكتروني", "Email", "Email")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="example@email.com"
                              value={form.email}
                              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specialty">
                            {t("التخصص / المادة التي تدرّسها", "Spécialité / Matière enseignée", "Specialty / Subject Taught")}
                          </Label>
                          <Input
                            id="specialty"
                            placeholder={t("مثال: الإيقاظ العلمي، الرياضيات...", "Ex: Sciences, Mathématiques...", "e.g. Science, Mathematics...")}
                            value={form.specialty}
                            onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">
                            {t("موضوع الرسالة", "Sujet du message", "Message Subject")} <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="subject"
                            className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={form.subject}
                            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                          >
                            <option value="">{t("اختر موضوع الرسالة...", "Choisir le sujet...", "Select subject...")}</option>
                            {SUBJECTS_I18N.map((s) => (
                              <option key={s.value} value={t(s.ar, s.fr, s.en)}>
                                {t(s.ar, s.fr, s.en)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">
                            {t("الرسالة", "Message", "Message")} <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            placeholder={t(
                              "اكتب رسالتك هنا... كن محدداً قدر الإمكان لنتمكن من مساعدتك بشكل أفضل",
                              "Écrivez votre message ici... Soyez aussi précis que possible",
                              "Write your message here... Be as specific as possible"
                            )}
                            rows={5}
                            value={form.message}
                            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={sendMutation.isPending}
                          className="w-full h-12 text-base font-bold text-white gap-2"
                          style={{ background: sendMutation.isPending ? "#999" : "#1A237E" }}
                        >
                          {sendMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {t("جاري الإرسال...", "Envoi en cours...", "Sending...")}
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              {t("إرسال الرسالة", "Envoyer le message", "Send Message")}
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* FAQ */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="p-1" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" style={{ color: "#1A237E" }} />
                      {t("أسئلة شائعة", "Questions fréquentes", "FAQ")}
                    </h3>
                    <div className="space-y-3">
                      {FAQ.map((faq, i) => (
                        <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <p className="font-semibold text-gray-800 text-sm">{faq.q}</p>
                          <p className="text-gray-500 text-xs mt-1">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Social & About */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {t("تابعنا على", "Suivez-nous sur", "Follow us on")}
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="https://www.facebook.com/LeaderAcademyTunisia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Facebook</p>
                        <p className="text-gray-500 text-xs">Leader Academy Tunisia</p>
                      </div>
                    </a>
                    <a
                      href="https://leaderacademy.school"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{t("الموقع الرسمي", "Site officiel", "Official Website")}</p>
                        <p className="text-gray-500 text-xs">leaderacademy.school</p>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Leader Academy Card */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="p-6" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                  <h3 className="font-bold text-lg mb-2 text-white">Leader Academy</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {t(
                      "منصة تدريبية رائدة في توظيف الذكاء الاصطناعي في التدريس، مخصصة للمعلمين التونسيين.",
                      "Plateforme de formation leader dans l'intégration de l'IA dans l'enseignement, dédiée aux enseignants tunisiens.",
                      "A leading training platform for integrating AI in education, dedicated to Tunisian teachers."
                    )}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Leader Academy — {t("جميع الحقوق محفوظة", "Tous droits réservés", "All rights reserved")}
        </p>
      </footer>
    </div>
  );
}
