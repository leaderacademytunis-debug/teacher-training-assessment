import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, Loader2, Maximize2, Minimize2, Plus, BookOpen, FileText, ClipboardList, GraduationCap, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatAssistantProps {
  externalIsOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

const QUICK_PROMPTS = [
  {
    icon: FileText,
    label: "إعداد مذكرة درس",
    prompt: "أريد إعداد مذكرة درس. ما المادة والمستوى الذي تريده؟",
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    icon: ClipboardList,
    label: "تقييم تشخيصي",
    prompt: "أريد إعداد تقييم تشخيصي لتلاميذي. ساعدني في ذلك.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
  {
    icon: BookOpen,
    label: "اختبار ثلاثي",
    prompt: "أريد إنشاء اختبار ثلاثي وفق المعايير الرسمية التونسية.",
    color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    icon: Calendar,
    label: "توزيع سنوي",
    prompt: "أريد إعداد توزيع سنوي للدروس. ما المادة والمستوى؟",
    color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    icon: GraduationCap,
    label: "نشاط بيداغوجي",
    prompt: "اقترح لي نشاطاً بيداغوجياً تفاعلياً لتلاميذي.",
    color: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100",
  },
  {
    icon: Sparkles,
    label: "تحسين وثيقة",
    prompt: "أريد تحسين وثيقة تربوية موجودة. كيف يمكنك مساعدتي؟",
    color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
];

export function ChatAssistant({ externalIsOpen, onExternalOpenChange }: ChatAssistantProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onExternalOpenChange) {
      onExternalOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = trpc.assistant.chat.useMutation({
    onSuccess: (response: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast.error("خطأ في الاتصال بالمساعد الذكي");
      console.error(error);
      setIsLoading(false);
    },
  });

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setInput("");
    setIsLoading(true);

    sendMessage.mutate({
      messages: [...messages, { role: "user", content: messageText }],
    });
  };

  const handleNewChat = () => {
    if (isLoading) return;
    setMessages([]);
    setInput("");
    toast.success("تم بدء محادثة جديدة");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // On mobile, auto-fullscreen when opened
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      setIsFullScreen(true);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bg-background border shadow-2xl flex flex-col z-50 transition-all duration-300 ${
            isFullScreen
              ? "inset-0 md:inset-4 rounded-none md:rounded-lg"
              : "bottom-6 left-6 w-[90vw] max-w-[600px] h-[80vh] max-h-[700px] rounded-lg"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b bg-blue-600 text-white rounded-t-none md:rounded-t-lg shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 shrink-0" />
              <h3 className="font-semibold text-sm md:text-base truncate">المساعد البيداغوجي</h3>
            </div>
            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
              {/* New Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="text-white hover:bg-blue-700 h-8 w-8 md:h-9 md:w-9"
                title="محادثة جديدة"
                disabled={isLoading || messages.length === 0}
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-white hover:bg-blue-700 h-8 w-8 md:h-9 md:w-9"
                title={isFullScreen ? "تصغير" : "تكبير"}
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsFullScreen(false);
                  setIsOpen(false);
                }}
                className="text-white hover:bg-blue-700 h-8 w-8 md:h-9 md:w-9"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                {/* Welcome Section */}
                <div className="text-center mb-6 md:mb-8">
                  <div className="relative inline-block mb-4">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <MessageSquare className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 md:h-6 md:w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                    </div>
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-foreground mb-1">مرحباً! أنا مساعدك التعليمي الذكي</h4>
                  <p className="text-xs md:text-sm text-muted-foreground max-w-[280px] md:max-w-[320px] mx-auto">
                    يمكنني مساعدتك في إعداد المذكرات البيداغوجية والتخطيط الدراسي وفق المنهج التونسي الرسمي
                  </p>
                </div>

                {/* Quick Prompts Grid */}
                <div className="w-full max-w-[480px] px-2">
                  <p className="text-xs text-muted-foreground text-center mb-3">ابدأ بسرعة باختيار أحد الاقتراحات:</p>
                  <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                    {QUICK_PROMPTS.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(item.prompt)}
                          className={`flex items-center gap-2 p-2.5 md:p-3 rounded-xl border text-right transition-all duration-200 ${item.color} cursor-pointer group`}
                          disabled={isLoading}
                        >
                          <div className="shrink-0">
                            <Icon className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
                          </div>
                          <span className="text-xs md:text-sm font-medium leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2.5 md:p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown>{message.content}</Streamdown>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك هنا..."
                className="min-h-[50px] md:min-h-[60px] max-h-[100px] md:max-h-[120px] resize-none text-sm md:text-base"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] shrink-0"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
