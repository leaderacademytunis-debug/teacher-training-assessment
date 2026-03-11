import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send, User, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface SubmissionCommentsProps {
  submissionId: number;
}

export default function SubmissionComments({ submissionId }: SubmissionCommentsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");

  const commentsQuery = trpc.submissionComment.list.useQuery(
    { submissionId },
    { enabled: !!submissionId, refetchInterval: 15000 }
  );

  const addComment = trpc.submissionComment.add.useMutation({
    onSuccess: () => {
      setNewComment("");
      commentsQuery.refetch();
      toast.success("تم إضافة التعليق");
    },
    onError: (err) => {
      toast.error(err.message || "فشل إضافة التعليق");
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addComment.mutate({ submissionId, content: newComment.trim() });
  };

  const isAdmin = user && ["admin", "trainer", "supervisor"].includes(user.role);

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MessageSquare className="h-4 w-4 text-blue-600" />
        المحادثة ({commentsQuery.data?.length || 0})
      </div>

      {/* Comments list */}
      <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50">
        {commentsQuery.isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        ) : !commentsQuery.data?.length ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>لا توجد تعليقات بعد</p>
            <p className="text-xs mt-1">ابدأ المحادثة بإضافة تعليق</p>
          </div>
        ) : (
          commentsQuery.data.map((comment: any) => {
            const isInstructor = comment.role === "instructor";
            return (
              <div
                key={comment.id}
                className={`flex gap-2 ${isInstructor ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isInstructor ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                  {isInstructor ? <GraduationCap className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[80%] ${isInstructor ? "text-right" : "text-left"}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm ${isInstructor ? "bg-blue-100 text-blue-900" : "bg-white border text-gray-900"}`}>
                    <div className="text-[10px] font-medium mb-1 opacity-70">
                      {comment.arabicName || comment.userName || comment.userEmail}
                      {isInstructor && <span className="mr-1 text-blue-600">(المدرب)</span>}
                    </div>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 px-1">
                    {new Date(comment.createdAt).toLocaleString("ar-TN", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New comment input */}
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAdmin ? "اكتب تعليقاً للمشارك..." : "اكتب ردك هنا..."}
          className="min-h-[60px] text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!newComment.trim() || addComment.isPending}
          className="self-end"
        >
          {addComment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
