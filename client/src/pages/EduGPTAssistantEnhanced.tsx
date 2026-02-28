import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, File, Menu, Search, Trash2, Download, Plus, MessageSquare, ArrowRight, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  timestamp: number;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  file?: File;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
  lastMessageAt: Date | string;
}

const SUBJECTS = [
  "اللغة العربية",
  "اللغة الفرنسية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم",
  "التربية الإسلامية",
  "التربية المدنية",
  "التاريخ",
  "الجغرافيا",
  "الفلسفة",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "التكنولوجيا",
  "الفنون",
  "التربية البدنية",
  "أخرى",
];

const LEVELS = [
  // ابتدائي
  "السنة الأولى ابتدائي",
  "السنة الثانية ابتدائي",
  "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي",
  "السنة الخامسة ابتدائي",
  "السنة السادسة ابتدائي",
  // إعدادي
  "السنة السابعة إعدادي",
  "السنة الثامنة إعدادي",
  "السنة التاسعة إعدادي",
  // ثانوي
  "السنة العاشرة ثانوي",
  "السنة الحادية عشرة ثانوي",
  "السنة الثانية عشرة ثانوي",
  "السنة الثالثة عشرة ثانوي",
];

export default function EduGPTAssistantEnhanced() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversationTitle, setConversationTitle] = useState("محادثة جديدة");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const { language: globalLanguage, setLanguage } = useLanguage();
  const [teachingLanguage, setTeachingLanguage] = useState<"arabic" | "french" | "english" | null>(() => {
    // Sync with global language on first load
    if (globalLanguage === "fr") return "french";
    if (globalLanguage === "en") return "english";
    return null;
  });
  const [showContextSelector, setShowContextSelector] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC queries and mutations
  const { data: conversations = [], refetch: refetchConversations } = trpc.assistant.getConversations.useQuery({
    searchQuery: searchQuery || undefined,
  });

  const sendMessage = trpc.assistant.chat.useMutation({
    onSuccess: async (response: { message: string }) => {
      const newMessages = [
        ...messages,
        { role: "assistant" as const, content: response.message, timestamp: Date.now() },
      ];
      setMessages(newMessages);
      setIsLoading(false);

      // Auto-save conversation
      await saveCurrentConversation(newMessages);
    },
    onError: (error: any) => {
      toast.error("خطأ في الاتصال بالمساعد الذكي");
      console.error(error);
      setIsLoading(false);
    },
  });

  const saveConversationMutation = trpc.assistant.saveConversation.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      refetchConversations();
      toast.success("تم حفظ المحادثة");
    },
  });

  const updateConversationMutation = trpc.assistant.updateConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  const deleteConversationMutation = trpc.assistant.deleteConversation.useMutation({
    onSuccess: () => {
      refetchConversations();
      toast.success("تم حذف المحادثة");
    },
  });

  const uploadFileMutation = trpc.assistant.uploadFile.useMutation();
  const analyzeFileMutation = trpc.assistant.analyzeFile.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate conversation title from first message
  const generateTitle = (firstMessage: string): string => {
    const words = firstMessage.split(" ").slice(0, 6).join(" ");
    return words.length > 50 ? words.substring(0, 50) + "..." : words;
  };

  // Save or update conversation
  const saveCurrentConversation = async (msgs: Message[]) => {
    if (msgs.length === 0) return;

    const title = conversationTitle === "محادثة جديدة" 
      ? generateTitle(msgs[0].content)
      : conversationTitle;

    if (currentConversationId) {
      await updateConversationMutation.mutateAsync({
        id: currentConversationId,
        messages: msgs,
      });
    } else {
      const saved = await saveConversationMutation.mutateAsync({
        title,
        messages: msgs,
      });
      setConversationTitle(title);
      setCurrentConversationId(saved.id);
    }
  };

  // Load conversation
  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setCurrentConversationId(conv.id);
    setConversationTitle(conv.title);
    setAttachedFiles([]);
    setInput("");
  };

  // Start new conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setConversationTitle("محادثة جديدة");
    setAttachedFiles([]);
    setInput("");
    setSelectedSubject(null);
    setSelectedLevel(null);
    setTeachingLanguage(null);
  };

  // Delete conversation
  const deleteConversation = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المحادثة؟")) {
      await deleteConversationMutation.mutateAsync({ id });
      if (currentConversationId === id) {
        startNewConversation();
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const newFiles: AttachedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت`);
        continue;
      }

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = event.target?.result as string;
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
      fileInputRef.current.value = "";
    }
  };

  // Remove attached file
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message with file analysis
  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    setIsLoading(true);

    try {
      // Upload and analyze files
      const uploadedFiles: AttachedFile[] = [];
      let analyzedText = "";
      
      for (const attachedFile of attachedFiles) {
        const fileToUpload = attachedFile.file;
        if (!fileToUpload) continue;

        // Convert to base64
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

        // Upload to S3
        const uploadResult = await uploadFileMutation.mutateAsync({
          base64Data,
          fileName: attachedFile.name,
          mimeType: attachedFile.type,
        });

      const fileWithUrl: AttachedFile = {
        name: attachedFile.name,
        size: attachedFile.size,
        type: attachedFile.type,
        url: uploadResult.url,
      };
      uploadedFiles.push(fileWithUrl);

        // Analyze file if it's PDF or image
        if (attachedFile.type === "application/pdf" || attachedFile.type.startsWith("image/")) {
          try {
            const analysis = await analyzeFileMutation.mutateAsync({
              fileUrl: uploadResult.url,
              mimeType: attachedFile.type,
            });
            analyzedText += `\n\n[محتوى الملف ${attachedFile.name}]:\n${analysis.text}\n`;
          } catch (error) {
            console.error("Error analyzing file:", error);
            toast.error(`تعذر تحليل الملف ${attachedFile.name}`);
          }
        }
      }

      // Combine user input with analyzed text
      const fullContent = input.trim() + analyzedText;

      // Filter files to ensure they have URLs
      const validAttachments = uploadedFiles.filter(f => f.url !== undefined).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url!,
      }));

      const userMessage: Message = {
        role: "user",
        content: fullContent,
        attachments: validAttachments.length > 0 ? validAttachments : undefined,
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setAttachedFiles([]);

      sendMessage.mutate({
        messages: newMessages,
        subject: selectedSubject || undefined,
        level: selectedLevel || undefined,
        teachingLanguage: teachingLanguage || undefined,
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

  const exportPDFMutation = trpc.assistant.exportConversationAsPDF.useMutation({
    onSuccess: (data) => {
      // Download the file
      window.open(data.url, "_blank");
      toast.success("تم تصدير المحادثة بنجاح");
    },
    onError: () => {
      toast.error("خطأ في تصدير المحادثة");
    },
  });

  const exportWordMutation = trpc.assistant.exportConversationAsWord.useMutation({
    onSuccess: (data) => {
      // Download the file
      window.open(data.url, "_blank");
      toast.success("تم تصدير المحادثة بنجاح");
    },
    onError: () => {
      toast.error("خطأ في تصدير المحادثة");
    },
  });

  // Export conversation as PDF
  const exportAsPDF = async () => {
    if (messages.length === 0) return;
    
    toast.info("جاري تصدير المحادثة...");
    await exportPDFMutation.mutateAsync({
      title: conversationTitle,
      messages,
      createdAt: new Date().toISOString(),
    });
  };

  // Export conversation as Word
  const exportAsWord = async () => {
    if (messages.length === 0) return;
    
    toast.info("جاري تصدير المحادثة...");
    await exportWordMutation.mutateAsync({
      title: conversationTitle,
      messages,
      createdAt: new Date().toISOString(),
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "اليوم";
    if (days === 1) return "أمس";
    if (days < 7) return `منذ ${days} أيام`;
    return date.toLocaleDateString("ar-TN");
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 border-l border-gray-200 bg-white flex flex-col overflow-hidden`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">المحادثات السابقة</h2>
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={startNewConversation}
            >
              <Plus className="h-4 w-4 ml-1" />
              جديد
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث في المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group ${
                  currentConversationId === conv.id ? "bg-blue-50 border border-blue-200" : ""
                }`}
                onClick={() => loadConversation(conv)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <h3 className="font-medium text-sm truncate">{conv.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(conv.lastMessageAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد محادثات سابقة</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/")}
              title="العودة إلى الصفحة الرئيسية"
              className="text-gray-600 hover:text-blue-600"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{conversationTitle}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {selectedSubject && selectedLevel ? (
                  <button
                    onClick={() => setShowContextSelector(true)}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 hover:bg-blue-100 transition-colors"
                  >
                    <span>📚 {selectedSubject}</span>
                    <span className="text-blue-400">|</span>
                    <span>🎓 {selectedLevel}</span>
                    {teachingLanguage && (
                      <><span className="text-blue-400">|</span>
                      <span>{teachingLanguage === "french" ? "🇫🇷 Français" : teachingLanguage === "english" ? "🇬🇧 English" : "🇹🇳 عربية"}</span></>
                    )}
                    <span className="text-blue-400 mr-1">• تغيير</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowContextSelector(true)}
                    className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-2 py-0.5 hover:bg-orange-100 transition-colors animate-pulse"
                  >
                    <span>⚠️ حدد المادة والمستوى</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 font-medium">
                  <Globe className="h-4 w-4" />
                  <span>
                    {globalLanguage === "fr" ? "🇫🇷" : globalLanguage === "en" ? "🇬🇧" : "🇹🇳"}
                  </span>
                  <span className="hidden md:inline text-xs">
                    {globalLanguage === "fr" ? "Français" : globalLanguage === "en" ? "English" : "العربية"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {[
                  { code: "ar" as const, label: "العربية", flag: "🇹🇳", teaching: null },
                  { code: "fr" as const, label: "Français", flag: "🇫🇷", teaching: "french" as const },
                  { code: "en" as const, label: "English", flag: "🇬🇧", teaching: "english" as const },
                ].map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setTeachingLanguage(lang.teaching);
                    }}
                    className={`gap-2 cursor-pointer ${globalLanguage === lang.code ? "bg-primary/10 font-semibold" : ""}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {globalLanguage === lang.code && <span className="mr-auto text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={exportAsPDF}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 ml-1" />
              PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportAsWord}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 ml-1" />
              Word
            </Button>
          </div>
        </div>

        {/* Context Selector Modal */}
        {showContextSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => {
            if (selectedSubject && selectedLevel) setShowContextSelector(false);
          }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">🎓 تحديد سياق التعليم</h2>
              <p className="text-sm text-gray-500 text-center mb-5">حدد المادة والمستوى ولغة التدريس لتخصيص إجابات المساعد بدقة</p>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📚 المادة الدراسية</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSubject(s)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selectedSubject === s
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🎓 المستوى الدراسي</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setSelectedLevel(l)}
                      className={`px-3 py-2 rounded-lg text-sm border text-right transition-all ${
                        selectedLevel === l
                          ? "bg-green-600 text-white border-green-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* لغة التدريس */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🌐 لغة التدريس (اختياري)</label>
                <div className="flex gap-2">
                  {([
                    { value: "arabic", label: "🇹🇳 عربية", desc: "المواد بالعربية" },
                    { value: "french", label: "🇫🇷 Français", desc: "Matières en français" },
                    { value: "english", label: "🇬🇧 English", desc: "English subjects" },
                  ] as const).map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => setTeachingLanguage(teachingLanguage === lang.value ? null : lang.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-all text-center ${
                        teachingLanguage === lang.value
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:text-purple-600"
                      }`}
                    >
                      <div className="font-medium">{lang.label}</div>
                      <div className="text-xs opacity-75 mt-0.5">{lang.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedSubject || !selectedLevel}
                onClick={() => setShowContextSelector(false)}
              >
                {selectedSubject && selectedLevel
                  ? `تأكيد: ${selectedSubject} — ${selectedLevel}${teachingLanguage ? " — " + (teachingLanguage === "french" ? "Français" : teachingLanguage === "english" ? "English" : "عربية") : ""}`
                  : "يرجى اختيار المادة والمستوى"}
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-blue-100 p-6 rounded-full mb-4">
                <MessageSquare className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">مرحباً بك في المساعد البيداغوجي</h2>
              {!selectedSubject || !selectedLevel ? (
                <>
                  <p className="text-gray-600 mb-4 max-w-md">
                    لبدء المحادثة، يرجى تحديد المادة الدراسية والمستوى أولاً حتى يتمكن المساعد من تقديم إجابات دقيقة ومتوافقة مع البرامج الرسمية التونسية.
                  </p>
                  <Button
                    onClick={() => setShowContextSelector(true)}
                    className="bg-blue-600 hover:bg-blue-700 mb-6 gap-2"
                  >
                    📚 حدد المادة والمستوى الدراسي
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-2 max-w-md">
                    {teachingLanguage === "french" ? "Prêt à vous aider en" : teachingLanguage === "english" ? "Ready to help you with" : "جاهز لمساعدتك في"} <strong>{selectedSubject}</strong> — <strong>{selectedLevel}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {teachingLanguage === "french"
                      ? "Expert pédagogique numérique tunisien. Je vous aide à préparer vos fiches et évaluations selon les programmes officiels."
                      : teachingLanguage === "english"
                      ? "Tunisian digital pedagogical expert. I help you prepare lesson plans and assessments according to official programs."
                      : "الخبير البيداغوجي الرقمي التونسي. أساعدك في إعداد المذكرات والتقييمات وفق البرامج الرسمية."}
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-2xl">
                    {teachingLanguage === "french" ? (
                      <>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("Je veux préparer une fiche de préparation officielle selon les programmes tunisiens")}>
                          <p className="text-sm font-medium">Fiche de préparation officielle</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("Aide-moi à créer des exercices différenciés (remédiation, soutien, excellence)")}>
                          <p className="text-sm font-medium">Exercices différenciés (pédagogie différenciée)</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("J'ai besoin d'une répartition annuelle/trimestrielle du programme")}>
                          <p className="text-sm font-medium">Répartition annuelle/trimestrielle</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("Évalue cette fiche sur 20 selon les critères du ministère de l'éducation")}>
                          <p className="text-sm font-medium">Évaluation pédagogique sur 20</p>
                        </Card>
                      </>
                    ) : teachingLanguage === "english" ? (
                      <>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("I want to prepare an official lesson plan according to Tunisian programs")}>
                          <p className="text-sm font-medium">Official Lesson Plan</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("Help me create differentiated exercises (remediation, support, excellence)")}>
                          <p className="text-sm font-medium">Differentiated Exercises</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("I need an annual/term distribution of the program")}>
                          <p className="text-sm font-medium">Annual/Term Distribution</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("Evaluate this lesson plan out of 20 according to Ministry of Education criteria")}>
                          <p className="text-sm font-medium">Pedagogical Evaluation /20</p>
                        </Card>
                      </>
                    ) : (
                      <>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("أريد إعداد مذكرة بيداغوجية (Fiche de préparation) وفق البرامج الرسمية التونسية")}>
                          <p className="text-sm font-medium">إعداد مذكرة بيداغوجية رسمية</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("ساعدني في بناء تمارين متمايزة (علاجي، دعم، تميّز)")}>
                          <p className="text-sm font-medium">تمارين متمايزة (بيداغوجيا فارقية)</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("أحتاج توزيعاً سنوياً/فصلياً (Répartition) للبرنامج")}>
                          <p className="text-sm font-medium">توزيع سنوي/فصلي</p>
                        </Card>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setInput("قيّم هذه المذكرة على 20 وفق معايير وزارة التربية")}>
                          <p className="text-sm font-medium">تقييم بيداغوجي على 20</p>
                        </Card>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <Card className={`max-w-3xl p-4 ${
                message.role === "user" 
                  ? "bg-white border-gray-200" 
                  : "bg-blue-600 text-white border-blue-600"
              }`}>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {message.attachments.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center gap-2 text-sm">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                        <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <Streamdown>{message.content}</Streamdown>
                </div>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-end">
              <Card className="max-w-3xl p-4 bg-blue-600 text-white border-blue-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الكتابة...</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 pr-3"
                >
                  {file.preview ? (
                    <img src={file.preview} alt={file.name} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا... (أو أرفق ملف PDF/صورة)"
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
