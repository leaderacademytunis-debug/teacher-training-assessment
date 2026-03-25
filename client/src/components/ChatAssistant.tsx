import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, Loader2, Maximize2, Minimize2 } from "lucide-react";
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

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    sendMessage.mutate({
      messages: [...messages, { role: "user", content: userMessage }],
    });
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
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold text-sm md:text-base">المساعد البيداغوجي</h3>
            </div>
            <div className="flex items-center gap-1">
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
              <div className="text-center text-muted-foreground mt-8">
                <MessageSquare className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">مرحباً! أنا مساعدك التعليمي الذكي</p>
                <p className="text-xs mt-2">
                  يمكنني مساعدتك في إعداد المذكرات البيداغوجية والتخطيط الدراسي
                </p>
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
                onClick={handleSend}
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
