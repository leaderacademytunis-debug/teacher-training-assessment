import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, GraduationCap, Star, Award, BookOpen, FileText, ChevronLeft, ChevronRight, Users, Filter, Briefcase, ExternalLink } from "lucide-react";
import useI18n from "@/i18n";


const REGIONS = [
  "تونس العاصمة", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان", "بنزرت",
  "باجة", "جندوبة", "الكاف", "سليانة", "القيروان", "القصرين", "سيدي بوزيد",
  "سوسة", "المنستير", "المهدية", "صفاقس", "قفصة", "توزر", "قبلي",
  "قابس", "مدنين", "تطاوين",
];

const GRADES = [
  { value: "primary", label: "ابتدائي" },
  { value: "middle", label: "إعدادي" },
  { value: "secondary", label: "ثانوي" },
  { value: "preschool", label: "تحضيري" },
];

const SUBJECTS = [
  "رياضيات", "علوم", "عربية", "فرنسية", "إنجليزية", "تاريخ", "جغرافيا",
  "تربية إسلامية", "تربية مدنية", "إيقاظ علمي", "تربية تكنولوجية",
  "تربية فنية", "تربية بدنية", "إعلامية",
];

export default function TalentDirectory() {
  const { t, lang, isRTL, dir } = useI18n();
  const [subject, setSubject] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [minScore, setMinScore] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const queryInput = useMemo(() => ({
    subject: subject || undefined,
    region: region || undefined,
    grade: grade || undefined,
    minScore: minScore ? parseInt(minScore) : undefined,
    page,
    limit: 12,
  }), [subject, region, grade, minScore, page]);

  const { data, isLoading } = trpc.careerHub.talentDirectory.useQuery(queryInput);

  const clearFilters = () => {
    setSubject("");
    setRegion("");
    setGrade("");
    setMinScore("");
    setPage(1);
  };

  const hasFilters = subject || region || grade || minScore;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-orange-400" />
            <h1 className="text-3xl md:text-4xl font-bold">دليل المواهب التعليمية</h1>
          </div>
          <p className="text-blue-200 text-lg max-w-2xl mb-8">
            اكتشف أفضل المعلمين المعتمدين من Leader Academy. ابحث حسب التخصص والمنطقة والمستوى.
          </p>

          {/* Quick Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 max-w-4xl">
            <div className="flex-1 relative">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
              <Select value={subject} onValueChange={(v) => { setSubject(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white pe-10 h-12 [&>span]:text-white">
                  <SelectValue placeholder="اختر المادة..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواد</SelectItem>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
              <Select value={region} onValueChange={(v) => { setRegion(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white pe-10 h-12 [&>span]:text-white">
                  <SelectValue placeholder="اختر المنطقة..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 ms-2" />
              فلاتر متقدمة
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm flex flex-col md:flex-row gap-3 max-w-4xl">
              <Select value={grade} onValueChange={(v) => { setGrade(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white [&>span]:text-white">
                  <SelectValue placeholder="المستوى الدراسي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  {GRADES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="الحد الأدنى للنقاط"
                value={minScore}
                onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-300"
              />
              {hasFilters && (
                <Button variant="ghost" className="text-orange-300 hover:text-orange-200" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {isLoading ? "جاري البحث..." : `${data?.total || 0} معلم متاح`}
          </p>
          {hasFilters && (
            <div className="flex gap-2 flex-wrap">
              {subject && <Badge variant="secondary" className="gap-1">{subject} <button onClick={() => setSubject("")}>&times;</button></Badge>}
              {region && <Badge variant="secondary" className="gap-1">{region} <button onClick={() => setRegion("")}>&times;</button></Badge>}
              {grade && <Badge variant="secondary" className="gap-1">{GRADES.find(g => g.value === grade)?.label} <button onClick={() => setGrade("")}>&times;</button></Badge>}
              {minScore && <Badge variant="secondary" className="gap-1">نقاط &ge; {minScore} <button onClick={() => setMinScore("")}>&times;</button></Badge>}
            </div>
          )}
        </div>

        {/* Teacher Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.teachers && data.teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.teachers.map((teacher: any) => (
              <Card key={teacher.userId} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
                        {teacher.displayName?.charAt(0) || "م"}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {teacher.displayName}
                          {teacher.isVerified && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                              <Award className="w-3 h-3" /> معتمد
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{teacher.schoolName || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Level Badge */}
                  <div className="flex items-center gap-2">
                    <Badge className={
                      teacher.level === "خبير متميز" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" :
                      teacher.level === "خبير" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
                      teacher.level === "متقدم" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                      teacher.level === "متوسط" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                      "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }>
                      <Star className="w-3 h-3 ms-1" /> {teacher.level}
                    </Badge>
                    <span className="text-sm text-gray-500">{teacher.totalScore} نقطة</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {teacher.region && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{teacher.region}</span>
                      </div>
                    )}
                    {teacher.educationLevel && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span>{GRADES.find(g => g.value === teacher.educationLevel)?.label || teacher.educationLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Specializations */}
                  {teacher.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {teacher.specializations.slice(0, 3).map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                      {teacher.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{teacher.specializations.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {teacher.stats?.lessonPlans || 0} جذاذة
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {teacher.stats?.exams || 0} اختبار
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {teacher.stats?.certificates || 0} شهادة
                    </span>
                  </div>

                  {/* View Profile Button */}
                  <Link href={`/showcase/${teacher.slug}`}>
                    <Button variant="outline" className="w-full mt-2 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700">
                      <ExternalLink className="w-4 h-4 ms-2" />
                      عرض الملف المهني
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500 mb-4">جرب تغيير معايير البحث أو إزالة بعض الفلاتر</p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>مسح جميع الفلاتر</Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 12 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronRight className="w-4 h-4 ms-1" /> السابق
            </Button>
            <span className="text-gray-600">
              صفحة {page} من {Math.ceil(data.total / 12)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(data.total / 12)}
              onClick={() => setPage(p => p + 1)}
            >
              التالي <ChevronLeft className="w-4 h-4 me-1" />
            </Button>
          </div>
        )}

        {/* Job Postings Section */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-700" />
            <h2 className="text-2xl font-bold text-gray-800">فرص العمل المتاحة</h2>
          </div>
          <JobPostingsSection />
        </div>
      </div>
    </div>
  );
}

function JobPostingsSection() {
  const { data, isLoading } = trpc.schoolPortal.getActiveJobs.useQuery({ page: 1 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.jobs || data.jobs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد فرص عمل متاحة حالياً</p>
          <p className="text-sm mt-1">هل أنت مدرسة؟ <Link href="/school-portal" className="text-blue-600 hover:underline">سجل كمدرسة شريكة</Link></p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.jobs.map((item: any) => (
        <Card key={item.job.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{item.job.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  {item.schoolNameAr || item.schoolName}
                  {item.isVerified && <Badge className="bg-green-100 text-green-700 text-xs me-1">موثقة</Badge>}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.job.contractType === "full_time" ? "دوام كامل" :
                 item.job.contractType === "part_time" ? "دوام جزئي" :
                 item.job.contractType === "temporary" ? "مؤقت" : "حر"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {item.job.subject}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.job.region}</span>
              {item.job.grade && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {item.job.grade}</span>}
            </div>
            {item.job.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.job.description}</p>
            )}
            {item.job.salaryRange && (
              <p className="text-sm text-green-600 font-medium mt-2">{item.job.salaryRange}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
