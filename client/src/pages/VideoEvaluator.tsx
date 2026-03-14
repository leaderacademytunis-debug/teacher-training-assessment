import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, File, Video, ArrowRight, Sparkles, Target, MessageSquare, Film } from "lucide-react";
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
  file?: File;
}

export default function VideoEvaluator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [educationalObjective, setEducationalObjective] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [showContextForm, setShowContextForm] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.videoEvaluator.chat.useMutation({
    onSuccess: (response: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast.error("خطأ في الاتصال بالمُقيِّم الرقمي");
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
      
      // Check file size (max 16MB for video)
      if (file.size > 16 * 1024 * 1024) {
        toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى 16 ميجابايت`);
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
        file: file,
      });
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
    
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
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const uploadFileMutation = trpc.assistant.uploadFile.useMutation();

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    setIsLoading(true);
    setShowContextForm(false);

    try {
      // Upload files to S3 if any
      const uploadedFiles: AttachedFile[] = [];
      
      for (const attachedFile of attachedFiles) {
        const fileToUpload = attachedFile.file;
        if (!fileToUpload) continue;
        
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });

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
        targetAudience: targetAudience || undefined,
        educationalObjective: educationalObjective || undefined,
        originalPrompt: originalPrompt || undefined,
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
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ background: "linear-gradient(135deg, #1A237E 0%, #0D47A1 50%, #01579B 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Cairo, sans-serif" }}>
              مُقيِّم المعلم الرقمي
            </h1>
            <p className="text-sm text-blue-100">
              وكيل ذكاء اصطناعي لتقييم الفيديوهات التعليمية وتحسين هندسة الأوامر
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 py-8">
            {/* Welcome Section */}
            <div className="text-center space-y-3 max-w-lg">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #1A237E, #0D47A1)" }}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                مرحباً بك في مُقيِّم المعلم الرقمي
              </h2>
              <p className="text-gray-600 leading-relaxed">
                أنا هنا لمساعدتك في تقييم فيديوهاتك التعليمية المُولّدة بالذكاء الاصطناعي وتحسين مهاراتك في هندسة الأوامر (Prompt Engineering).
              </p>
            </div>

            {/* Context Form */}
            {showContextForm && (
              <Card className="w-full max-w-lg p-6 space-y-4 border-2" style={{ borderColor: "rgba(26,35,126,0.15)" }}>
                <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: "#1A237E", fontFamily: "Cairo, sans-serif" }}>
                  <Target className="w-5 h-5" />
                  معلومات التقييم (اختياري)
                </h3>
                <p className="text-sm text-gray-500">يمكنك تقديم هذه المعلومات مسبقاً أو إرسالها ضمن المحادثة</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">الفئة المستهدفة</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="مثال: تلاميذ السنة الرابعة ابتدائي"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">الهدف التعليمي</label>
                    <input
                      type="text"
                      value={educationalObjective}
                      onChange={(e) => setEducationalObjective(e.target.value)}
                      placeholder="مثال: شرح دورة الماء في الطبيعة"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">الموجه (Prompt) المستخدم</label>
                    <Textarea
                      value={originalPrompt}
                      onChange={(e) => setOriginalPrompt(e.target.value)}
                      placeholder="الصق هنا الموجه الذي استخدمته لتوليد الفيديو..."
                      className="min-h-[80px] resize-none text-sm"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Start Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 text-right hover:border-blue-300 hover:bg-blue-50/50"
                onClick={() => {
                  setInput("مرحباً، أريد تقييم فيديو تعليمي قمت بإنتاجه بالذكاء الاصطناعي");
                  textareaRef.current?.focus();
                }}
              >
                <Film className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">تقييم فيديو جديد</span>
                <span className="text-xs text-gray-500">أرسل فيديوك مع الموجه المستخدم</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 text-right hover:border-blue-300 hover:bg-blue-50/50"
                onClick={() => {
                  setInput("أريد نصائح لتحسين الموجهات (Prompts) لتوليد فيديوهات تعليمية أفضل");
                  textareaRef.current?.focus();
                }}
              >
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">نصائح هندسة الأوامر</span>
                <span className="text-xs text-gray-500">تعلم كتابة موجهات أفضل</span>
              </Button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                message.role === "user"
                  ? "text-white"
                  : "bg-muted"
              }`}
              style={message.role === "user" ? { background: "linear-gradient(135deg, #1A237E, #1565C0)" } : {}}
            >
              {message.role === "assistant" ? (
                <Streamdown>{message.content}</Streamdown>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white/10 rounded-lg p-2"
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
            <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">جارٍ تحليل وتقييم عملك...</span>
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
            accept="video/*,image/*,.pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="إرفاق فيديو أو صورة"
            className="shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="أرسل الفيديو مع الموجه المستخدم... (Enter للإرسال)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            size="icon"
            className="h-[60px] w-[60px] shrink-0 text-white"
            style={{ background: "linear-gradient(135deg, #1A237E, #1565C0)" }}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
