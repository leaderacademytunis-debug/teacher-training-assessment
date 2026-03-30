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
      content: `أنت مساعد منصة Leader Academy. تساعد المعلم على استخدام الأدوات وتجيب على أسئلته العامة حول المنصة والتدريس.
      
قواعد:
- إذا طلب المعلم إنشاء جذاذة أو اختبار أو محتوى بيداغوجي متقدم، وجّهه إلى /assistant قائلاً: "للحصول على جذاذة متقدمة، استخدم المساعد البيداغوجي في /assistant"
- أجب على أسئلة عن استخدام المنصة والأدوات
- أجب على أسئلة عامة عن التعليم والتدريس
- كن ودياً وداعماً
- استخدم العربية الفصحى المبسطة`,
    },
  ]);

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
    chatMutation.mutate({ messages: newMessages });
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
                "كيف أنشئ جذاذة؟",
                "ما هي الأدوات المتاحة؟",
                "كيف أحفظ عملي؟",
                "كيف أشارك ملفي المهني؟",
              ]}
            />
          </div>
        </div>
      )}
    </>
  );
};
