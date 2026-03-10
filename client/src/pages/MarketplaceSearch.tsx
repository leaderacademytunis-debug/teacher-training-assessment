import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Star, Download, Eye, TrendingUp, BookOpen,
  GraduationCap, ArrowLeft, Loader2, Compass, Sparkles,
  Target, Clock, Award, Lightbulb
} from "lucide-react";

const CONTENT_TYPES: Record<string, { label: string; color: string }> = {
  lesson_plan: { label: "جذاذة درس", color: "bg-blue-100 text-blue-800" },
  exam: { label: "اختبار", color: "bg-red-100 text-red-800" },
  evaluation: { label: "تقييم", color: "bg-green-100 text-green-800" },
  drama_script: { label: "نص مسرحي", color: "bg-purple-100 text-purple-800" },
  annual_plan: { label: "مخطط سنوي", color: "bg-orange-100 text-orange-800" },
  digitized_doc: { label: "وثيقة مرقمنة", color: "bg-teal-100 text-teal-800" },
  other: { label: "أخرى", color: "bg-gray-100 text-gray-800" },
};

export default function MarketplaceSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const stableQuery = useMemo(() => searchQuery, [hasSearched]);

  const { data: searchResults, isLoading: searchLoading } = trpc.search.globalSearch.useQuery(
    { query: stableQuery },
    { enabled: hasSearched && stableQuery.length >= 2 }
  );

  const { data: recommendations, isLoading: recsLoading } = trpc.search.getRecommendations.useQuery(
    undefined,
    { enabled: !!user }
  );

  const handleSearch = () => {
    if (searchQuery.length >= 2) {
      setHasSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/marketplace">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 ml-1" /> السوق الذهبي</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Compass className="w-7 h-7 text-amber-600" />
                بحث وتوصيات ذكية
              </h1>
              <p className="text-sm text-muted-foreground">اكتشف محتوى مخصص لموقعك في المنهج</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="ابحث عن جذاذات، اختبارات، تقييمات... (مثال: رياضيات السنة الرابعة الكسور)"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setHasSearched(false); }}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="pr-10 py-6 text-lg rounded-xl border-amber-200 focus:border-amber-400"
                dir="rtl"
              />
            </div>
            <Button onClick={handleSearch} disabled={searchQuery.length < 2} className="px-6 py-6 bg-amber-600 hover:bg-amber-700 rounded-xl gap-2">
              <Search className="w-5 h-5" />
              بحث
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-600" />
              نتائج البحث {searchResults?.results && `(${searchResults.results.length})`}
            </h2>
            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                <span className="mr-3 text-muted-foreground">جاري البحث...</span>
              </div>
            ) : searchResults?.results && searchResults.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.results.map((item: any) => {
                  const ct = CONTENT_TYPES[item.contentType] || CONTENT_TYPES.other;
                  return (
                    <Link key={item.id} href="/marketplace">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`text-xs ${ct.color}`}>{ct.label}</Badge>
                                {item.grade && <Badge variant="outline" className="text-xs">{item.grade}</Badge>}
                              </div>
                              <h3 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">{item.title}</h3>
                              {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{item.subject}</span>
                                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{Number(item.averageRating || 0).toFixed(1)}</span>
                                <span className="flex items-center gap-1"><Download className="w-3 h-3" />{item.totalDownloads || 0}</span>
                              </div>
                            </div>
                            {item.aiInspectorScore !== null && (
                              <div className="text-center bg-amber-50 rounded-lg p-2 min-w-[50px]">
                                <Award className="w-4 h-4 text-amber-600 mx-auto" />
                                <span className="text-sm font-bold text-amber-700">{item.aiInspectorScore}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">لم يتم العثور على نتائج لـ "{stableQuery}"</p>
                  <p className="text-sm text-muted-foreground mt-1">جرّب كلمات مختلفة أو أقل تحديداً</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations Section */}
        {user && (
          <div className="space-y-8">
            {/* GPS-based Recommendations (forYou) */}
            {recommendations?.forYou && recommendations.forYou.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  مقترحات حسب موقعك في المنهج
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  <Lightbulb className="w-4 h-4 inline ml-1 text-amber-500" />
                  بناءً على تقدمك في GPS المنهج، هذه الموارد قد تفيدك الآن
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.forYou.map((item: any) => {
                    const ct = CONTENT_TYPES[item.contentType] || CONTENT_TYPES.other;
                    return (
                      <Link key={item.id} href="/marketplace">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-emerald-100 bg-emerald-50/30">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs ${ct.color}`}>{ct.label}</Badge>
                                </div>
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{item.subject}</span>
                                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{Number(item.averageRating || 0).toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trending Items */}
            {recommendations?.trending && recommendations.trending.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  الأكثر رواجاً الآن
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  زملاؤك يحضّرون هذه الدروس حالياً، اطلع على أفضل الجذاذات
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.trending.map((item: any) => {
                    const ct = CONTENT_TYPES[item.contentType] || CONTENT_TYPES.other;
                    return (
                      <Link key={item.id} href="/marketplace">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <Badge className={`text-xs mb-2 ${ct.color}`}>{ct.label}</Badge>
                            <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{Number(item.averageRating || 0).toFixed(1)}</span>
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{item.totalDownloads || 0}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colleagues' Picks */}
            {recommendations?.colleagues && recommendations.colleagues.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  اختيارات الزملاء
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  محتوى حصل على أعلى تقييمات من معلمين يدرّسون نفس المواد
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.colleagues.map((item: any) => {
                    const ct = CONTENT_TYPES[item.contentType] || CONTENT_TYPES.other;
                    return (
                      <Link key={item.id} href="/marketplace">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100 bg-purple-50/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs ${ct.color}`}>{ct.label}</Badge>
                              {item.grade && <Badge variant="outline" className="text-xs">{item.grade}</Badge>}
                            </div>
                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{item.subject}</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{Number(item.averageRating || 0).toFixed(1)}</span>
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{item.totalDownloads || 0}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!recsLoading && (!recommendations?.forYou?.length && !recommendations?.trending?.length && !recommendations?.colleagues?.length) && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Compass className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">لا توجد توصيات بعد</h3>
                  <p className="text-muted-foreground">ابدأ باستخدام GPS المنهج وتصفح السوق الذهبي لتحصل على توصيات مخصصة</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Not logged in */}
        {!user && !hasSearched && (
          <Card>
            <CardContent className="p-8 text-center">
              <Compass className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">سجّل دخولك للحصول على توصيات مخصصة</h3>
              <p className="text-muted-foreground mb-4">يمكنك البحث بدون تسجيل دخول، لكن التوصيات الذكية تحتاج حساباً</p>
              <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                تسجيل الدخول
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
