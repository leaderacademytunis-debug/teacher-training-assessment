import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Send, ArrowRight, Building2, User, Clock, Archive, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import useI18n from "@/i18n";


export default function CareerMessages() {
  const { t, lang, isRTL, dir } = useI18n();
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = trpc.messaging.getConversations.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const messages = trpc.messaging.getMessages.useQuery(
    { conversationId: selectedConvoId! },
    { enabled: !!selectedConvoId, refetchInterval: 5000 }
  );
  const utils = trpc.useUtils();

  const sendMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessageText("");
      utils.messaging.getMessages.invalidate({ conversationId: selectedConvoId! });
      utils.messaging.getConversations.invalidate();
      if (data.isFiltered) {
        toast.warning("تم تعديل رسالتك لتتوافق مع معايير الاحترافية");
      }
    },
    onError: () => toast.error("فشل إرسال الرسالة"),
  });

  const archiveMutation = trpc.messaging.archiveConversation.useMutation({
    onSuccess: () => {
      toast.success("تم أرشفة المحادثة");
      setSelectedConvoId(null);
      setShowMobileList(true);
      utils.messaging.getConversations.invalidate();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data]);

  const handleSend = () => {
    if (!messageText.trim() || !selectedConvoId) return;
    sendMutation.mutate({ conversationId: selectedConvoId, content: messageText.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectConversation = (id: number) => {
    setSelectedConvoId(id);
    setShowMobileList(false);
  };

  const activeConversations = conversations.data?.filter((c: any) => c.status !== 'archived') || [];
  const selectedConvo = conversations.data?.find((c: any) => c.id === selectedConvoId);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            الرسائل المهنية
          </h1>
          <Link href="/portfolio">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowRight className="w-4 h-4" />
              ملفي المهني
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Conversations List */}
          <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 bg-white rounded-xl border shadow-sm overflow-hidden`}>
            <div className="p-3 border-b bg-slate-50">
              <p className="text-sm font-medium text-slate-600">المحادثات ({activeConversations.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeConversations.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد محادثات بعد</p>
                  <p className="text-xs mt-1">ستظهر المحادثات عند تواصل المدارس معك</p>
                </div>
              )}
              {activeConversations.map((convo: any) => (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo.id)}
                  className={`w-full p-4 border-b text-end hover:bg-blue-50 transition-colors ${
                    selectedConvoId === convo.id ? "bg-blue-50 border-e-4 border-e-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-slate-800 text-sm">{convo.school?.schoolName || 'مدرسة'}</span>
                    </div>
                    {convo.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-0">{convo.unreadCount}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    <span>{convo.otherUser?.name || 'مستخدم'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(convo.lastMessageAt).toLocaleDateString('ar-TN')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-white rounded-xl border shadow-sm overflow-hidden`}>
            {!selectedConvoId ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">اختر محادثة للبدء</p>
                  <p className="text-sm mt-1">اختر محادثة من القائمة لعرض الرسائل</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-3 md:p-4 border-b bg-gradient-to-l from-blue-50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-1">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{selectedConvo?.school?.schoolName || 'مدرسة'}</p>
                      <p className="text-xs text-slate-500">{selectedConvo?.otherUser?.name || 'مستخدم'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => archiveMutation.mutate({ conversationId: selectedConvoId })}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* AI Filter Notice */}
                <div className="px-4 py-2 bg-blue-50 border-b flex items-center gap-2 text-xs text-blue-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>جميع الرسائل تمر عبر فلتر الاحترافية لضمان محادثات مهنية بناءة</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {messages.data?.map((msg: any) => {
                    const isMe = msg.senderUserId !== (selectedConvo?.otherUser?.id);
                    const isTaskMsg = msg.messageType === 'task_request' || msg.messageType === 'task_response';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2.5 ${
                          isTaskMsg
                            ? 'bg-amber-50 border border-amber-200 text-amber-900'
                            : isMe
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white border text-slate-800 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                            <span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.isFiltered && (
                              <span className="text-[10px] text-amber-400">• معدلة</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 md:p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب رسالتك المهنية..."
                      className="flex-1 text-end"
                      disabled={sendMutation.isPending}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!messageText.trim() || sendMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
