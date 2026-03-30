import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";

export type FloatingAssistantProps = {
  /**
   * Hide floating assistant on specific routes
   */
  hiddenRoutes?: string[];
};

export const FloatingAssistant = ({ hiddenRoutes = [] }: FloatingAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `أنت EDUGPT، خبير بيداغوجي تونسي متخصص في إعداد الجذاذات والاختبارات وفق البرامج الرسمية التونسية 2026.

[VERROU NIVEAU]:
- إذا ذُكرت السنة الدراسية → تُقفل داخلياً ولا تتغير
- إذا لم تُذكر السنة → اطلبها وحدها فقط
- السنة هي المرجع الأعلى دائماً

[ANALYSE DEMANDE]:
المعطيات مكتملة إذا وُجدت: المادة + السنة + المدة + عنوان الدرس
إذا نقص عنصر واحد فقط → اطلبه وحده
لا تقاطع طلباً مكتملاً بأسئلة

[STRUCTURE PRIMAIRE - الجذاذة الرسمية التونسية]:
كل مرحلة تحتوي على: الهدف + دور المعلم + نشاط المتعلم + صيغة العمل + تقويم

1. وضعية الانطلاق
2. الاكتشاف
3. التعلم المنهجي
4. الإدماج
5. التقييم
6. الدعم
7. الإثراء
8. شبكة تقييم مختصرة (مع1 / مع2 / مع3)

[VERROU LANGUE]:
- اكتشف لغة الطلب تلقائياً
- الرد بنفس اللغة كاملاً
- عربي → عربي | فرنسي → فرنسي | مختلط → لغة المادة

[SERVICES المسموح بها فقط]:
- إعداد جذاذة
- إعداد اختبار
- تقييم وثيقة بيداغوجية
- خطة تحسين
أي طلب غير بيداغوجي → ارفضه بأدب ووجّه للصفحة المناسبة

[QOWAID]:
- لا مقدمات ولا تحيات — ابدأ بالجواب مباشرة
- لا اختراع نصوص رسمية
- لا روابط وهمية
- لا خلط بين المستويات الدراسية`,
    },
  ]);

  // Auto-detect subject and level from user message
  const detectSubjectAndLevel = (message: string) => {
    let subject = null;
    let level = null;

    // Subject detection
    if (message.includes("كسور")) subject = "الرياضيات";
    else if (message.includes("إيقاظ")) subject = "الإيقاظ العلمي";
    else if (message.includes("عربية") || message.includes("لغة")) subject = "اللغة العربية";
    else if (message.includes("فرنسية")) subject = "اللغة الفرنسية";

    // Level detection
    if (message.includes("خامسة") || message.includes("5")) level = "السنة الخامسة ابتدائي";
    else if (message.includes("رابعة") || message.includes("4")) level = "السنة الرابعة ابتدائي";
    else if (message.includes("سادسة") || message.includes("6")) level = "السنة السادسة ابتدائي";

    return { subject, level };
  };

  const chatMutation = trpc.assistant.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    
    // Auto-detect subject and level
    const { subject, level } = detectSubjectAndLevel(content);
    
    // Pass detected values to backend
    chatMutation.mutate({ 
      messages: newMessages,
      subject: subject || undefined,
      level: level || undefined,
    });
  };

  // Check if we should hide on current route
  const currentPath = window.location.pathname;
  const shouldHide = hiddenRoutes.some((route) => currentPath.startsWith(route));

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700 z-40"
          title="مساعد المنصة"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-green-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-sm">مساعد المنصة</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Box */}
          <div className="flex-1 overflow-hidden">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={chatMutation.isPending}
              placeholder="اسأل عن المنصة أو الأدوات..."
              className="h-full"
              height="100%"
              emptyStateMessage="مرحباً! أنا هنا لمساعدتك على استخدام منصة Leader Academy. كيف يمكنني مساعدتك؟"
              suggestedPrompts={[
                "درس الكسور السنة الخامسة",
                "جذاذة إيقاظ علمي رابعة",
                "كيف أنشئ جذاذة؟",
                "كيف أحفظ عملي؟",
              ]}
            />
          </div>
        </div>
      )}
    </>
  );
};
