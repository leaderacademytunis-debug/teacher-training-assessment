import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search, Star, Download, Eye, TrendingUp, BookOpen, FileText,
  GraduationCap, Filter, ArrowLeft, Award, User, ChevronDown,
  Store, Sparkles, Clock, ThumbsUp, X, ExternalLink, MessageCircle, Send, Loader2
} from "lucide-react";

// Content type labels
const CONTENT_TYPES: Record<string, { label: string; color: string }> = {
  lesson_plan: { label: "جذاذة درس", color: "bg-blue-100 text-blue-800" },
  exam: { label: "اختبار", color: "bg-red-100 text-red-800" },
  evaluation: { label: "تقييم", color: "bg-green-100 text-green-800" },
  drama_script: { label: "نص مسرحي", color: "bg-purple-100 text-purple-800" },
  annual_plan: { label: "مخطط سنوي", color: "bg-orange-100 text-orange-800" },
  digitized_doc: { label: "وثيقة مرقمنة", color: "bg-teal-100 text-teal-800" },
  other: { label: "أخرى", color: "bg-gray-100 text-gray-800" },
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "سهل", color: "bg-green-100 text-green-700" },
  medium: { label: "متوسط", color: "bg-yellow-100 text-yellow-700" },
  hard: { label: "صعب", color: "bg-red-100 text-red-700" },
};

const SUBJECTS = [
  "اللغة العربية", "الرياضيات", "الإيقاظ العلمي", "اللغة الفرنسية",
  "التربية الإسلامية", "التربية التكنولوجية", "التربية المدنية",
  "التربية البدنية", "التربية الفنية", "التاريخ والجغرافيا",
  "اللغة الإنجليزية", "الإعلامية"
];

const GRADES = [
  "السنة الأولى ابتدائي", "السنة الثانية ابتدائي", "السنة الثالثة ابتدائي",
  "السنة الرابعة ابتدائي", "السنة الخامسة ابتدائي", "السنة السادسة ابتدائي",
];

const SORT_OPTIONS = [
  { value: "ranking", label: "الأفضل تقييماً" },
  { value: "newest", label: "الأحدث" },
  { value: "rating", label: "أعلى تقييم" },
  { value: "downloads", label: "الأكثر تحميلاً" },
];

export default function Marketplace() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [sortBy, setSortBy] = useState<"ranking" | "newest" | "rating" | "downloads">("ranking");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [peerComment, setPeerComment] = useState("");
  const [page, setPage] = useState(0);

  // Queries
  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    contentType: selectedContentType || undefined,
    subject: selectedSubject || undefined,
    grade: selectedGrade || undefined,
    difficulty: selectedDifficulty || undefined,
    sortBy,
    limit: 12,
    offset: page * 12,
  }), [searchQuery, selectedContentType, selectedSubject, selectedGrade, selectedDifficulty, sortBy, page]);

  const { data: listData, isLoading: listLoading } = trpc.marketplace.list.useQuery(filters);
  const { data: stats } = trpc.marketplace.getStats.useQuery();
  const { data: itemDetail } = trpc.marketplace.getById.useQuery(
    { id: selectedItem! },
    { enabled: !!selectedItem }
  );
  const { data: itemRatings } = trpc.marketplace.getItemRatings.useQuery(
    { itemId: selectedItem! },
    { enabled: !!selectedItem }
  );
  // Peer review comments
  const { data: peerComments, refetch: refetchComments } = trpc.peerReview.getComments.useQuery(
    { itemId: selectedItem! },
    { enabled: !!selectedItem }
  );
  const addCommentMutation = trpc.peerReview.addComment.useMutation({
    onSuccess: () => {
      setPeerComment("");
      refetchComments();
    },
  });
  const voteHelpfulMutation = trpc.peerReview.voteHelpful.useMutation({
    onSuccess: () => refetchComments(),
  });
  const { data: contributor } = trpc.marketplace.getContributor.useQuery(
    { userId: itemDetail?.publishedBy! },
    { enabled: !!itemDetail?.publishedBy }
  );

  // Mutations
  const rateMutation = trpc.marketplace.rate.useMutation({
    onSuccess: () => {
      setRatingValue(0);
      setReviewText("");
    },
  });
  const downloadMutation = trpc.marketplace.recordDownload.useMutation();
  const evaluateMutation = trpc.marketplace.evaluateContent.useMutation();

  const utils = trpc.useUtils();

  const handleRate = async () => {
    if (!selectedItem || ratingValue === 0) return;
    await rateMutation.mutateAsync({ itemId: selectedItem, rating: ratingValue, review: reviewText || undefined });
    utils.marketplace.getItemRatings.invalidate({ itemId: selectedItem });
    utils.marketplace.getById.invalidate({ id: selectedItem });
    utils.marketplace.list.invalidate();
  };

  const handleDownload = async (itemId: number, format: string) => {
    await downloadMutation.mutateAsync({ itemId, format });
    utils.marketplace.getById.invalidate({ id: itemId });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedContentType("");
    setSelectedSubject("");
    setSelectedGrade("");
    setSelectedDifficulty("");
    setSortBy("ranking");
    setPage(0);
  };

  const hasActiveFilters = searchQuery || selectedContentType || selectedSubject || selectedGrade || selectedDifficulty;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  // Item Detail View
  if (selectedItem && itemDetail) {
    const ct = CONTENT_TYPES[itemDetail.contentType] || CONTENT_TYPES.other;
    const diff = DIFFICULTY_LABELS[itemDetail.difficulty] || DIFFICULTY_LABELS.medium;
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" onClick={() => setSelectedItem(null)} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى السوق
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={ct.color}>{ct.label}</Badge>
                        <Badge className={diff.color}>{diff.label}</Badge>
                        {itemDetail.period && <Badge variant="outline">الفترة {itemDetail.period}</Badge>}
                      </div>
                      <CardTitle className="text-2xl">{itemDetail.title}</CardTitle>
                      {itemDetail.description && (
                        <p className="text-muted-foreground mt-2">{itemDetail.description}</p>
                      )}
                    </div>
                    {itemDetail.aiInspectorScore !== null && (
                      <div className="text-center bg-amber-50 rounded-xl p-3 min-w-[80px]">
                        <Award className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-amber-700">{itemDetail.aiInspectorScore}</div>
                        <div className="text-xs text-amber-600">درجة المتفقد</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{itemDetail.subject}</span>
                    <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{itemDetail.grade}</span>
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" />{Number(itemDetail.averageRating).toFixed(1)} ({itemDetail.totalRatings})</span>
                    <span className="flex items-center gap-1"><Download className="h-4 w-4" />{itemDetail.totalDownloads}</span>
                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{itemDetail.totalViews}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none bg-white rounded-lg p-6 border" 
                    dangerouslySetInnerHTML={{ __html: itemDetail.content?.replace(/\n/g, "<br/>") || "" }} />
                </CardContent>
                <CardFooter className="flex gap-3">
                  <Button onClick={() => handleDownload(itemDetail.id, "view")} variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                  {itemDetail.pdfExportUrl && (
                    <Button onClick={() => { handleDownload(itemDetail.id, "pdf"); window.open(itemDetail.pdfExportUrl!, "_blank"); }} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      تحميل PDF
                    </Button>
                  )}
                  {itemDetail.wordExportUrl && (
                    <Button onClick={() => { handleDownload(itemDetail.id, "word"); window.open(itemDetail.wordExportUrl!, "_blank"); }} variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      تحميل Word
                    </Button>
                  )}
                  {user && itemDetail.aiInspectorScore === null && (
                    <Button 
                      onClick={() => evaluateMutation.mutateAsync({ itemId: itemDetail.id }).then(() => {
                        utils.marketplace.getById.invalidate({ id: itemDetail.id });
                      })}
                      disabled={evaluateMutation.isPending}
                      className="gap-2 bg-amber-600 hover:bg-amber-700"
                    >
                      <Sparkles className="h-4 w-4" />
                      {evaluateMutation.isPending ? "جاري التقييم..." : "تقييم بالذكاء الاصطناعي"}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Peer Review Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    التعليقات البيداغوجية ({peerComments?.length || 0})
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">تخضع جميع التعليقات لفلتر AI لضمان المهنية</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && itemDetail.publishedBy !== user.id && (
                    <div className="bg-blue-50/50 rounded-lg p-4 space-y-3 border border-blue-100">
                      <p className="font-medium text-sm">أضف تعليقًا بناءً:</p>
                      <Textarea
                        placeholder="شارك ملاحظاتك البيداغوجية حول هذا المحتوى..."
                        value={peerComment}
                        onChange={e => setPeerComment(e.target.value)}
                        rows={3}
                        dir="rtl"
                      />
                      <Button
                        onClick={() => addCommentMutation.mutate({ itemId: selectedItem!, comment: peerComment })}
                        disabled={peerComment.length < 3 || addCommentMutation.isPending}
                        size="sm"
                        className="gap-2"
                      >
                        {addCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {addCommentMutation.isPending ? "جاري الفحص والإرسال..." : "إرسال التعليق"}
                      </Button>
                    </div>
                  )}
                  {peerComments && peerComments.length > 0 ? (
                    peerComments.map((c: any) => (
                      <div key={c.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{c.userName || "معلم"}</span>
                          <div className="flex items-center gap-2">
                            {c.aiFilterResult === "modified" && (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">معدل AI</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString("ar-TN")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2" dir="rtl">{c.comment}</p>
                        <button
                          onClick={() => voteHelpfulMutation.mutate({ commentId: c.id })}
                          className="text-xs text-muted-foreground hover:text-blue-600 flex items-center gap-1 transition"
                        >
                          <ThumbsUp className="h-3 w-3" /> مفيد ({c.helpfulCount})
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد تعليقات بعد. كن أول من يشارك ملاحظاته!</p>
                  )}
                </CardContent>
              </Card>

              {/* Ratings section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    التقييمات والمراجعات ({itemRatings?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add rating */}
                  {user && itemDetail.publishedBy !== user.id && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p className="font-medium text-sm">أضف تقييمك:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setRatingValue(star)} className="focus:outline-none">
                            <Star className={`h-7 w-7 transition-colors ${star <= ratingValue ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        placeholder="اكتب مراجعتك (اختياري)..."
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={2}
                      />
                      <Button onClick={handleRate} disabled={ratingValue === 0 || rateMutation.isPending} size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        {rateMutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
                      </Button>
                    </div>
                  )}

                  {/* Existing ratings */}
                  {itemRatings && itemRatings.length > 0 ? (
                    itemRatings.map((r: any) => (
                      <div key={r.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("ar-TN")}
                          </span>
                        </div>
                        {r.review && <p className="text-sm text-gray-700">{r.review}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Contributor */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    المساهم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-white">
                        {(contributor?.user?.arabicName || contributor?.user?.name || "م").charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">
                      {contributor?.user?.arabicName || contributor?.user?.name || "معلم"}
                    </h3>
                    {contributor?.user?.schoolName && (
                      <p className="text-sm text-muted-foreground">{contributor.user.schoolName}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-700">{contributor?.publishedCount || 0}</div>
                      <div className="text-xs text-blue-600">منشور</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-700">{contributor?.totalDownloads || 0}</div>
                      <div className="text-xs text-green-600">تحميل</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-amber-700">{Number(contributor?.averageRating || 0).toFixed(1)}</div>
                      <div className="text-xs text-amber-600">تقييم</div>
                    </div>
                  </div>
                  {contributor?.portfolio?.isPublic && contributor?.portfolio?.publicToken && (
                    <Link href={`/portfolio/public/${contributor.portfolio.publicToken}`}>
                      <Button variant="outline" className="w-full gap-2 mt-2">
                        <ExternalLink className="h-4 w-4" />
                        عرض الملف المهني
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {itemDetail.tags && (itemDetail.tags as string[]).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">الوسوم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(itemDetail.tags as string[]).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Item info */}
              <Card>
                <CardContent className="pt-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">المادة</span><span className="font-medium">{itemDetail.subject}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">المستوى</span><span className="font-medium">{itemDetail.grade}</span></div>
                  {itemDetail.trimester && <div className="flex justify-between"><span className="text-muted-foreground">الثلاثي</span><span className="font-medium">{itemDetail.trimester}</span></div>}
                  {itemDetail.period && <div className="flex justify-between"><span className="text-muted-foreground">الفترة</span><span className="font-medium">{itemDetail.period}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">تاريخ النشر</span><span className="font-medium">{new Date(itemDetail.createdAt).toLocaleDateString("ar-TN")}</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Marketplace View
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-amber-600 via-orange-500 to-amber-700 text-white py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                الرئيسية
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <Store className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">سوق المحتوى الذهبي</h1>
              <p className="text-amber-100 text-lg">الذكاء الجماعي في خدمة التعليم التونسي</p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <div className="text-sm text-amber-100">محتوى منشور</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                <div className="text-sm text-amber-100">تحميل</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalContributors}</div>
                <div className="text-sm text-amber-100">مساهم</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.topSubjects?.length || 0}</div>
                <div className="text-sm text-amber-100">مادة</div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-300" />
              <Input
                placeholder="ابحث عن جذاذات، اختبارات، تقييمات..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-amber-200 h-12 text-lg"
              />
            </div>
            <Link href="/marketplace/search">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 gap-2 h-12"
              >
                <Sparkles className="h-5 w-5" />
                بحث ذكي
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/20 text-white hover:bg-white/10 gap-2 h-12"
            >
              <Filter className="h-5 w-5" />
              تصفية
              {hasActiveFilters && <Badge className="bg-white text-amber-700 text-xs">!</Badge>}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Select value={selectedContentType} onValueChange={v => { setSelectedContentType(v === "all" ? "" : v); setPage(0); }}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="نوع المحتوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Object.entries(CONTENT_TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v === "all" ? "" : v); setPage(0); }}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={selectedGrade} onValueChange={v => { setSelectedGrade(v === "all" ? "" : v); setPage(0); }}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={v => { setSelectedDifficulty(v === "all" ? "" : v); setPage(0); }}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="الصعوبة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="easy">سهل</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">صعب</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={v => { setSortBy(v as any); setPage(0); }}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="mt-2 text-amber-200 hover:text-white gap-2 text-sm">
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {listData?.total || 0} نتيجة
            {hasActiveFilters && " (مع فلاتر)"}
          </p>
          {user && (
            <Link href="/marketplace/publish">
              <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Sparkles className="h-4 w-4" />
                نشر محتوى جديد
              </Button>
            </Link>
          )}
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listData && listData.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listData.items.map((item: any) => {
                const ct = CONTENT_TYPES[item.contentType] || CONTENT_TYPES.other;
                const diff = DIFFICULTY_LABELS[item.difficulty] || DIFFICULTY_LABELS.medium;
                return (
                  <Card
                    key={item.id}
                    className="hover:shadow-lg transition-all cursor-pointer group border-amber-100 hover:border-amber-300"
                    onClick={() => setSelectedItem(item.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${ct.color} text-xs`}>{ct.label}</Badge>
                        <Badge className={`${diff.color} text-xs`}>{diff.label}</Badge>
                        {item.aiInspectorScore !== null && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs gap-1">
                            <Award className="h-3 w-3" />
                            {item.aiInspectorScore}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.contentPreview && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.contentPreview}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{item.subject}</span>
                        <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{item.grade?.replace("السنة ", "س").replace(" ابتدائي", "")}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            {Number(item.averageRating).toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{item.totalDownloads}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{item.totalViews}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString("ar-TN")}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.contributorName || "معلم"}</span>
                        {item.contributorSchool && <span>• {item.contributorSchool}</span>}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {listData.total > 12 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  السابق
                </Button>
                <span className="text-sm text-muted-foreground">
                  صفحة {page + 1} من {Math.ceil(listData.total / 12)}
                </span>
                <Button
                  variant="outline"
                  disabled={(page + 1) * 12 >= listData.total}
                  onClick={() => setPage(p => p + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Store className="h-16 w-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "جرّب تعديل الفلاتر أو البحث بكلمات مختلفة"
                : "كن أول من ينشر محتوى في السوق!"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
