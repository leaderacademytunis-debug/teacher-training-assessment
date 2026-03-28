import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Trash2, Clock, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SavedPromptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPrompt: (promptText: string, promptId: number) => void;
}

export function SavedPromptsDialog({ open, onOpenChange, onSelectPrompt }: SavedPromptsDialogProps) {
  const { data: savedPrompts, refetch } = trpc.pedagogicalSheets.listSavedPrompts.useQuery(undefined, {
    enabled: open,
  });

  const deletePrompt = trpc.pedagogicalSheets.deletePrompt.useMutation({
    onSuccess: () => {
      toast.success("تم حذف Prompt من المفضلة");
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const handleUsePrompt = (promptText: string, promptId: number) => {
    onSelectPrompt(promptText, promptId);
    onOpenChange(false);
    toast.success("تم تطبيق Prompt المحفوظ");
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("هل أنت متأكد من حذف هذا Prompt؟")) {
      deletePrompt.mutate({ id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-purple-500" />
            مكتبة Prompts المفضلة
          </DialogTitle>
          <DialogDescription>
            اختر prompt محفوظ لإعادة استخدامه في إنشاء مذكرة جديدة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!savedPrompts || savedPrompts.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center text-gray-500">
                <Bookmark className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>لا توجد prompts محفوظة بعد</p>
                <p className="text-sm mt-2">احفظ prompt ناجح لإعادة استخدامه لاحقاً</p>
              </CardContent>
            </Card>
          ) : (
            savedPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="hover:shadow-md transition-shadow cursor-pointer border-s-4 border-s-purple-500"
                onClick={() => handleUsePrompt(prompt.promptText, prompt.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap gap-2">
                        {prompt.educationLevel && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {prompt.educationLevel === "primary" ? "ابتدائي" : 
                             prompt.educationLevel === "middle" ? "إعدادي" : "ثانوي"}
                          </span>
                        )}
                        {prompt.grade && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {prompt.grade}
                          </span>
                        )}
                        {prompt.subject && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {prompt.subject}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(prompt.id, e)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-24 overflow-y-auto">
                    {prompt.promptText.substring(0, 200)}
                    {prompt.promptText.length > 200 && "..."}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(prompt.createdAt).toLocaleDateString("ar-TN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      استخدم {prompt.usageCount} مرة
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
