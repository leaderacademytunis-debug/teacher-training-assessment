import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: AttachedFile[];
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  file?: File; // Store the actual File object
}

export default function EduGPTAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت`);
        continue;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setAttachedFiles(prev => 
            prev.map(f => f.name === file.name ? { ...f, preview } : f)
          );
        };
        reader.readAsDataURL(file);
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file, // Store the actual File object
      });
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const uploadFileMutation = trpc.assistant.uploadFile.useMutation();

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    setIsLoading(true);

    try {
      // Upload files to S3 if any
      const uploadedFiles: AttachedFile[] = [];
      
      for (const attachedFile of attachedFiles) {
        const fileToUpload = attachedFile.file;
        if (!fileToUpload) continue;

        // Convert to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1]; // Remove data:...;base64, prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });

        // Upload to S3
        const uploadResult = await uploadFileMutation.mutateAsync({
          base64Data,
          fileName: attachedFile.name,
          mimeType: attachedFile.type,
        });

        uploadedFiles.push({
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type,
          url: uploadResult.url,
        });
      }

      const userMessage: Message = {
        role: "user",
        content: input.trim(),
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setAttachedFiles([]);

      sendMessage.mutate({
        messages: [...messages, userMessage],
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("خطأ في رفع الملفات");
      setIsLoading(false);
    }
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-right mb-2">المساعد البيداغوجي</h1>
        <p className="text-muted-foreground text-right">
          مساعدك الذكي لإعداد المذكرات البيداغوجية والتخطيط الدراسي
        </p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">مرحباً بك في المساعد البيداغوجي</h3>
              <p className="text-sm max-w-md">
                يمكنني مساعدتك في إعداد المذكرات البيداغوجية، التخطيط الدراسي، واقتراح أنشطة تعليمية مبتكرة.
                يمكنك أيضاً إرفاق ملفات PDF أو صور للحصول على مساعدة أكثر دقة.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <Button
                  variant="outline"
                  className="text-right justify-start h-auto py-3 px-4"
                  onClick={() => setInput("أنشئ لي مذكرة بيداغوجية لدرس قراءة للسنة السادسة ابتدائي")}
                >
                  <span className="text-sm">أنشئ مذكرة بيداغوجية</span>
                </Button>
                <Button
                  variant="outline"
                  className="text-right justify-start h-auto py-3 px-4"
                  onClick={() => setInput("اقترح لي أنشطة تفاعلية لدرس الرياضيات")}
                >
                  <span className="text-sm">اقترح أنشطة تفاعلية</span>
                </Button>
                <Button
                  variant="outline"
                  className="text-right justify-start h-auto py-3 px-4"
                  onClick={() => setInput("ساعدني في إعداد تقييم تشخيصي")}
                >
                  <span className="text-sm">إعداد تقييم تشخيصي</span>
                </Button>
                <Button
                  variant="outline"
                  className="text-right justify-start h-auto py-3 px-4"
                  onClick={() => setInput("كيف أدمج الذكاء الاصطناعي في التدريس؟")}
                >
                  <span className="text-sm">دمج الذكاء الاصطناعي</span>
                </Button>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-muted"
                }`}
              >
                {message.role === "assistant" ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-white/10 rounded p-2"
                          >
                            {getFileIcon(file.type)}
                            <span className="text-xs truncate flex-1">{file.name}</span>
                            <span className="text-xs opacity-70">{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative group bg-muted rounded-lg p-3 flex items-center gap-2 max-w-xs"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-background rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="إرفاق ملف"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا... (اضغط Enter للإرسال، Shift+Enter لسطر جديد)"
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
