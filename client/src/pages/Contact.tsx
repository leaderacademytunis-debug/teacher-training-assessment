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
      label: t("الهاتف", "Téléphone", "Phone"),
      value: "52 339 339 / 99 997 729",
      href: "tel:+21652339339",
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
          <div className="absolute top-10 end-20 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,109,0,0.3), transparent)" }} />
          <div className="absolute bottom-10 start-20 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(21,101,192,0.4), transparent)" }} />
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
                      <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm text-blue-700">
                        {t("📧 يمكنك أيضاً التواصل المباشر عبر: ", "📧 Vous pouvez aussi nous contacter directement : ", "📧 You can also contact us directly: ")}
                        <a href="mailto:leaderacademy216@gmail.com" className="font-semibold underline">
                          leaderacademy216@gmail.com
                        </a>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 mb-6 text-sm text-green-700">
                        {t("📱 أو عبر الواتساب: ", "📱 Ou par WhatsApp : ", "📱 Or via WhatsApp: ")}
                        <a href="https://wa.me/21652339339" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                          +216 52 339 339
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
                      href="https://www.facebook.com/leaderacademy.tn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Facebook</p>
                        <p className="text-gray-500 text-xs">@leaderacademy.tn</p>
                      </div>
                    </a>
                    <a
                      href="https://www.instagram.com/leaderacademytn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-pink-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Instagram</p>
                        <p className="text-gray-500 text-xs">@leaderacademytn</p>
                      </div>
                    </a>
                    <a
                      href="https://www.youtube.com/channel/UCEZWPqq_ONwn-CzD_GwLuVg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">YouTube</p>
                        <p className="text-gray-500 text-xs">Leader Academy</p>
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

              {/* WhatsApp Direct */}
              <a
                href="https://wa.me/21652339339"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p className="font-bold text-green-800 text-sm">{t("تواصل عبر الواتساب", "Contactez via WhatsApp", "Contact via WhatsApp")}</p>
                  <p className="text-green-600 text-xs font-semibold" dir="ltr">+216 52 339 339</p>
                </div>
              </a>

              {/* Leader Academy Card */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="p-6" style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}>
                  <h3 className="font-bold text-lg mb-2 text-white">Leader Academy</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-3">
                    {t(
                      "هيكل تكوين خاص مرخّص في تعاطي نشاط التكوين المستمر، ترجع بالنظر إلى وزارة التكوين المهني والتشغيل.",
                      "Centre de formation privé agréé pour la formation continue, sous la tutelle du Ministère de la Formation Professionnelle et de l'Emploi.",
                      "Licensed private training center for continuous education, under the Ministry of Vocational Training and Employment."
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white/90">عدد 6130916</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white/90" dir="ltr">1457091MAM000</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm mb-2">
          &copy; {new Date().getFullYear()} Leader Academy — {t("جميع الحقوق محفوظة", "Tous droits réservés", "All rights reserved")}
        </p>
        <p className="text-gray-500 text-xs">
          {t(
            "هيكل تكوين خاص مرخّص — وزارة التكوين المهني والتشغيل — عدد 6130916",
            "Centre de formation privé agréé — Ministère de la Formation Professionnelle — N° 6130916",
            "Licensed private training center — Ministry of Vocational Training — No. 6130916"
          )}
        </p>
      </footer>
    </div>
  );
}
