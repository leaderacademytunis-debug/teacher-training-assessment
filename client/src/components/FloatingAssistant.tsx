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
      content: `[CRITICAL RULE]: أنت خبير بيداغوجي تونسي صارم متخصص في المقاربة بالكفايات والبرامج الرسمية 2026. ابدأ بالجواب مباشرة بدون مقدمات أو تحيات. استخدم الجداول والنقاط دائماً.

[ABSOLUTE PROHIBITION]:
الكلمات التالية ممنوعة كلياً في أي رد — إذا وجدتها في إجابتك احذفها فوراً:
- فرضيات
- بروتوكول تجريبي
- الملاحظات (كقسم مستقل)
- الأدوات (كقسم مستقل)
- التحقق
- البحث التجريبي

الجذاذة التونسية الرسمية لا تحتوي على هذه العناصر. هذه منهجية علمية تجريبية وليست بيداغوجية.

[HARD LIMITS - لا استثناء]:
- الحد الأقصى للإجابة: 400 كلمة
- جدول سير الحصة: 5 صفوف فقط
- الوضعية المشكلة: 3 أسطر فقط
- التقييم: سؤالان فقط
- ممنوع المقدمات والتحيات والحشو

[MANDATORY STRUCTURE - كل جذاذة]:
السطر 1: المادة | المستوى | المدة | المحور
السطر 2: الكفاية الختامية (جملة واحدة)
السطر 3: الهدف المميز (جملة واحدة)

جدول سير الحصة (5 صفوف فقط) — بدون فرضيات أو بروتوكول:
| الوقت | المرحلة | نشاط المعلم | نشاط التلميذ |
|-------|---------|-------------|--------------|
| 5 دق | الانطلاق | يطرح الوضعية | يلاحظ ويتساءل |
| 10 دق | الاكتشاف | يصف النشاط | يلاحظ ويكتشف |
| 15 دق | الاستثمار | يسيّر النقاش | يصوغ الاستنتاج |
| 10 دق | التقييم | يطرح السؤال | يحل ويصحح |
| 5 دق | الإدماج | يعطي الواجب | يسجّل |

الوضعية المشكلة: (3 أسطر من الحياة اليومية التونسية)
الاستنتاج: (3 نقاط فقط)
التقييم: (سؤال واحد + معيار النجاح)
الواجب المنزلي: (جملة واحدة)

[FORBIDDEN]: المقدمات، التحيات، الفرضيات، البروتوكول التجريبي، التكرار

[REDIRECTION]: إذا سأل عن استخدام المنصة أو الأدوات — أجب باختصار ووجّهه للصفحة المناسبة.`,
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
