import React from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Target, Users, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export function CareerPathwaySection() {
  const [, navigate] = useLocation();
  
  // Fetch career statistics from database
  const { data: stats, isLoading } = trpc.career.getCareerPathwayStats.useQuery();

  const steps = [
    {
      icon: TrendingUp,
      title: "طوّر مهاراتك",
      description: "استخدم الأدوات وارتقِ من مبتدئ إلى ماهر رقمي",
    },
    {
      icon: Briefcase,
      title: "ابنِ ملفك",
      description: "ملف مهني رقمي قابل للمشاركة مع badge المعتمد",
    },
    {
      icon: Target,
      title: "تواصل مع المدارس",
      description: "عروض شغل مباشرة من مدارس شريكة",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-green-50" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ملفك المهني يصل للمدارس الشريكة
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            كل أداة تستخدمها تُضاف لملفك المهني الرقمي وتثبت كفاءتك. المدارس الشريكة تبحث عن معلمين معتمدين — كن في نتائج البحث.
          </p>
        </div>

        {/* Three Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Teachers in Showcase */}
              <Card className="border-2 border-green-100 hover:border-green-300 transition">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">معلمون في المعرض</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats?.teachersInShowcase || 0}
                      </p>
                    </div>
                    <Users className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              {/* Job Opportunities */}
              <Card className="border-2 border-blue-100 hover:border-blue-300 transition">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">عروض شغل متاحة</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats?.activeJobPostings || 0}
                      </p>
                    </div>
                    <Briefcase className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              {/* Partner Schools */}
              <Card className="border-2 border-purple-100 hover:border-purple-300 transition">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">مدارس شريكة</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats?.partnerSchoolsCount || 0}
                      </p>
                    </div>
                    <Target className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/my-portfolio")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition"
          >
            ابنِ ملفك المهني الآن
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
