import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Award,
  Loader2,
  ChevronRight,
  Filter,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function CareerShowcase() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  // Fetch teachers with public profiles
  const { data: teachers, isLoading } = trpc.career.getPublicTeacherProfiles.useQuery({
    search: searchQuery,
    specialty: selectedSpecialty || undefined,
  });

  // Fetch job postings
  const { data: jobs, isLoading: jobsLoading } = trpc.career.getActiveJobPostings.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">المسار المهني</h1>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول لعرض الفرص الوظيفية</p>
          <Button onClick={() => navigate("/login")} className="bg-green-600 hover:bg-green-700">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">المسار المهني</h1>
          <p className="text-lg text-gray-600">
            اكتشف فرصاً وظيفية وتواصل مع معلمين معتمدين
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>ابحث عن فرصتك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن معلم أو تخصص..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                تصفية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teachers Showcase */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">المعلمون المعتمدون</h2>
              <span className="text-sm text-gray-600">
                {teachers?.length || 0} معلم
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : teachers && teachers.length > 0 ? (
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <Card key={teacher.id} className="hover:shadow-lg transition cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {teacher.fullName}
                            </h3>
                            {teacher.isVerified && (
                              <Award className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              {teacher.specialty}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {teacher.region}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">{teacher.totalPoints} نقطة</span>
                            </div>
                            <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {teacher.level}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate(`/teacher/${teacher.username}`)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          عرض الملف
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد نتائج</p>
              </div>
            )}
          </div>

          {/* Job Opportunities Sidebar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">الفرص الوظيفية</h2>
              <span className="text-sm text-gray-600">
                {jobs?.length || 0}
              </span>
            </div>

            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Briefcase className="h-4 w-4" />
                        {job.schoolName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/job/${job.id}`)}
                      >
                        عرض التفاصيل
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد فرص وظيفية حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
