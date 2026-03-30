import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Copy, Share2, Award, BookOpen, BarChart3, Mail } from "lucide-react";

interface TeacherProfile {
  id: string;
  username: string;
  fullName: string;
  profileImage?: string;
  specialization: string;
  region: string;
  bio?: string;
  isVerified: boolean;
  completedCourses: number;
  publishedSheets: number;
  publishedExams: number;
  usagePoints: number;
  certificates: Array<{
    id: string;
    courseName: string;
    completedDate: string;
  }>;
  portfolioItems: Array<{
    id: string;
    title: string;
    type: "sheet" | "exam";
    description?: string;
  }>;
  isPublic: boolean;
}

export default function PublicTeacherProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch teacher profile from API
    const fetchProfile = async () => {
      try {
        // This would call your actual API endpoint
        // For now, using mock data
        const mockProfile: TeacherProfile = {
          id: "1",
          username: username || "ali-saadallah",
          fullName: "علي سعدالله",
          profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=ali",
          specialization: "الرياضيات",
          region: "تونس",
          bio: "معلم متخصص في الرياضيات مع خبرة 10 سنوات",
          isVerified: true,
          completedCourses: 5,
          publishedSheets: 23,
          publishedExams: 12,
          usagePoints: 4850,
          certificates: [
            {
              id: "1",
              courseName: "تدريب المعلمين على الذكاء الاصطناعي",
              completedDate: "2024-03-15",
            },
            {
              id: "2",
              courseName: "تطوير المناهج الرقمية",
              completedDate: "2024-02-20",
            },
            {
              id: "3",
              courseName: "التقييم الإلكتروني",
              completedDate: "2024-01-10",
            },
          ],
          portfolioItems: [
            {
              id: "1",
              title: "جذاذة الدوال الخطية",
              type: "sheet",
              description: "شرح مفصل للدوال الخطية مع تمارين تطبيقية",
            },
            {
              id: "2",
              title: "اختبار الهندسة الفراغية",
              type: "exam",
              description: "اختبار شامل للهندسة الفراغية للسنة الثالثة",
            },
            {
              id: "3",
              title: "جذاذة المتتاليات",
              type: "sheet",
              description: "درس المتتاليات الحسابية والهندسية",
            },
          ],
          isPublic: true,
        };

        if (!mockProfile.isPublic) {
          setError("هذا الملف الشخصي مخفي من قبل المعلم");
          setLoading(false);
          return;
        }

        setProfile(mockProfile);
        setLoading(false);
      } catch (err) {
        setError("حدث خطأ في تحميل الملف الشخصي");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/teacher/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">خطأ</h2>
          <p className="text-gray-600">{error || "لم يتم العثور على الملف الشخصي"}</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            العودة
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
              <div className="flex-shrink-0">
                <img
                  src={profile.profileImage}
                  alt={profile.fullName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="flex-1 pt-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                  {profile.isVerified && (
                    <Badge className="bg-green-500 text-white">
                      ✓ معتمد من Leader Academy
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-1">{profile.specialization}</p>
                <p className="text-gray-500">{profile.region}</p>
                {profile.bio && <p className="text-gray-700 mt-3">{profile.bio}</p>}
              </div>
              <div className="flex gap-2 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "تم النسخ" : "نسخ الرابط"}
                </Button>
                <Button size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.publishedSheets}</p>
            <p className="text-sm text-gray-600">جذاذات منشورة</p>
          </Card>
          <Card className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.publishedExams}</p>
            <p className="text-sm text-gray-600">اختبارات منشورة</p>
          </Card>
          <Card className="p-6 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile.completedCourses}</p>
            <p className="text-sm text-gray-600">تكوينات مكتملة</p>
          </Card>
          <Card className="p-6 text-center">
            <span className="text-3xl font-bold text-green-500">{profile.usagePoints}</span>
            <p className="text-sm text-gray-600">نقاط الاستخدام</p>
          </Card>
        </div>

        {/* Certificates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">الشهادات المحصل عليها</h2>
          <div className="grid gap-4">
            {profile.certificates.map((cert) => (
              <Card key={cert.id} className="p-4 flex items-center gap-4">
                <Award className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">{cert.courseName}</h3>
                  <p className="text-sm text-gray-600">
                    تم الإكمال في {new Date(cert.completedDate).toLocaleDateString("ar-TN")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">عينات من الأعمال</h2>
          <div className="grid gap-4">
            {profile.portfolioItems.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {item.type === "sheet" ? (
                      <BookOpen className="w-8 h-8 text-blue-500" />
                    ) : (
                      <BarChart3 className="w-8 h-8 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <Badge variant="secondary">
                      {item.type === "sheet" ? "جذاذة" : "اختبار"}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-2">هل تريد التواصل مع هذا المعلم؟</h2>
          <p className="text-gray-600 mb-6">
            سجّل دخولك لعرض معلومات التواصل والتقدم بطلب توظيف
          </p>
          <Button size="lg" className="gap-2">
            <MessageCircle className="w-5 h-5" />
            تسجيل الدخول والتواصل
          </Button>
        </Card>
      </div>
    </div>
  );
}
