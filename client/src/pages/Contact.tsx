import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SUBJECTS = [
  "الاستفسار عن دورة تدريبية",
  "طلب شراكة مؤسسية",
  "دعم تقني",
  "اقتراح أو ملاحظة",
  "طلب عرض مخصص",
  "موضوع آخر",
];

const INTERESTS = [
  "دورة توظيف الذكاء الاصطناعي في التدريس",
  "مشروع EDUGPT",
  "التكوين المستمر للمدرسين",
  "الشراكة المؤسسية",
  "أخرى",
];

export default function Contact() {
  const { language } = useLanguage();
  const isRTL = language !== "fr" && language !== "en";

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
      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("يرجى ملء جميع الحقول الإلزامية");
      return;
    }
    sendMutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full text-center shadow-xl border-0">
          <CardContent className="pt-12 pb-10 px-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">تم الإرسال بنجاح!</h2>
            <p className="text-gray-600 mb-2">
              شكراً لتواصلك مع <strong>Leader Academy</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              سيتواصل معك فريقنا عبر البريد الإلكتروني خلال 24 ساعة.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-8 text-sm text-blue-700">
              📧 يمكنك أيضاً التواصل المباشر عبر:{" "}
              <a href="mailto:leaderacademy216@gmail.com" className="font-semibold underline">
                leaderacademy216@gmail.com
              </a>
            </div>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              إرسال رسالة أخرى
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Mail className="w-4 h-4" />
            <span>تواصل معنا</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">نحن هنا لمساعدتك</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            هل لديك سؤال عن دوراتنا أو خدماتنا؟ تواصل معنا وسيرد عليك فريق Leader Academy خلال 24 ساعة.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">البريد الإلكتروني</p>
                    <a
                      href="mailto:leaderacademy216@gmail.com"
                      className="text-blue-600 text-sm hover:underline break-all"
                    >
                      leaderacademy216@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">الهاتف / واتساب</p>
                    <p className="text-gray-600 text-sm">متاح عبر البريد الإلكتروني</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">الموقع</p>
                    <p className="text-gray-600 text-sm">تونس — خدمات رقمية عبر الإنترنت</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Leader Academy</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  منصة تدريبية رائدة في توظيف الذكاء الاصطناعي في التدريس، مخصصة للمعلمين التونسيين.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-gray-800">أرسل لنا رسالة</CardTitle>
                <p className="text-gray-500 text-sm">الحقول المشار إليها بـ * إلزامية</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        placeholder="مثال: محمد بن علي"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="specialty">التخصص / المادة التي تدرّسها</Label>
                    <Input
                      id="specialty"
                      placeholder="مثال: الإيقاظ العلمي، الرياضيات..."
                      value={form.specialty}
                      onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="interest">مجال الاهتمام</Label>
                    <select
                      id="interest"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      value={form.interest}
                      onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
                    >
                      <option value="">اختر مجال الاهتمام...</option>
                      {INTERESTS.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">موضوع الرسالة *</Label>
                    <select
                      id="subject"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      required
                    >
                      <option value="">اختر موضوع الرسالة...</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">الرسالة *</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتب رسالتك هنا..."
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      required
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sendMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11"
                  >
                    {sendMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
