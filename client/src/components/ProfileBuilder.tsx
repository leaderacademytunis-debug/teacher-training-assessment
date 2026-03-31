import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileBuilderProps {
  onComplete?: () => void;
}

const SUBJECTS = [
  'رياضيات',
  'لغة عربية',
  'إيقاظ علمي',
  'لغة فرنسية',
  'لغة إنجليزية',
  'تاريخ وجغرافيا',
  'تربية إسلامية',
  'تربية مدنية',
  'تربية فنية',
  'تربية رياضية',
];

const TEACHING_LEVELS = [
  { value: 'primary', label: 'ابتدائي' },
  { value: 'middle', label: 'إعدادي' },
  { value: 'secondary', label: 'ثانوي' },
];

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'بدون خبرة' },
  { value: '1', label: '1 سنة' },
  { value: '2', label: '2 سنة' },
  { value: '3', label: '3 سنوات' },
  { value: '5', label: '5 سنوات' },
  { value: '10', label: '10 سنوات' },
  { value: '15', label: '15 سنة فأكثر' },
];

export default function ProfileBuilder({ onComplete }: ProfileBuilderProps) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    subject: '',
    teachingLevel: '',
    yearsOfExperience: '0',
    isAvailableForJobs: true,
  });

  const uploadAvatarMutation = trpc.profileBuilder.uploadAvatar.useMutation();
  const saveProfileMutation = trpc.profileBuilder.saveProfile.useMutation();
  const getProfileQuery = trpc.profileBuilder.getProfile.useQuery();

  // Load existing profile if available
  useEffect(() => {
    if (getProfileQuery.data) {
      const profile = getProfileQuery.data;
      if (profile) {
        setFormData({
          fullName: profile.bio || '',
          phone: '',
          subject: profile.subject || '',
          teachingLevel: profile.teachingLevel || '',
          yearsOfExperience: profile.yearsOfExperience?.toString() || '0',
          isAvailableForJobs: profile.isAvailableForJobs || true,
        });
        if (profile.avatarUrl) {
          setAvatarUrl(profile.avatarUrl);
          setAvatarPreview(profile.avatarUrl);
        }
      }
    }
  }, [getProfileQuery.data]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setLoading(true);
      const base64 = await new Promise<string>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const base64String = (fileReader.result as string).split(',')[1];
          resolve(base64String);
        };
        fileReader.readAsDataURL(file);
      });

      const extension = file.name.split('.').pop() || 'jpg';
      const result = await uploadAvatarMutation.mutateAsync({
        base64Data: base64,
        fileExtension: extension,
        mimeType: file.type,
      });

      setAvatarUrl(result.url);
      setError('');
    } catch (err) {
      setError('فشل رفع الصورة. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.fullName.trim()) {
      setError('الاسم الكامل مطلوب');
      return;
    }
    if (!formData.phone.trim()) {
      setError('رقم الهاتف مطلوب');
      return;
    }
    if (!formData.subject) {
      setError('المادة مطلوبة');
      return;
    }
    if (!formData.teachingLevel) {
      setError('مستوى التدريس مطلوب');
      return;
    }

    try {
      setLoading(true);
      await saveProfileMutation.mutateAsync({
        avatarUrl,
        fullName: formData.fullName,
        phone: formData.phone,
        subject: formData.subject,
        teachingLevel: formData.teachingLevel as 'primary' | 'middle' | 'secondary',
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        isAvailableForJobs: formData.isAvailableForJobs,
      });

      setSuccess(true);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          setLocation('/assistant');
        }
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'فشل حفظ الملف المهني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 إعداد الملف المهني
          </h1>
          <p className="text-gray-600">
            أكمل بيانات ملفك المهني لتظهر في رادار الكفاءات وتستقبل عروض عمل من المدارس الشريكة
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                📸 الصورة الشخصية
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">👨‍🏫</span>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-purple-50">
                    <div className="flex items-center gap-2">
                      <Upload size={20} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">
                        اختر صورة
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="font-semibold text-gray-900">المعلومات الأساسية</h2>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <Input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <Input
                  type="tel"
                  placeholder="+216 98 123 456"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 هذا الرقم سيظهر فقط لمديري المدارس المشتركة للتواصل معك للانتداب
                </p>
              </div>
            </div>

            {/* Specialization & Experience */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="font-semibold text-gray-900">التخصص والخبرة</h2>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المادة التي تدرسها
                </label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    handleInputChange('subject', value)
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teaching Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى التدريس
                </label>
                <Select
                  value={formData.teachingLevel}
                  onValueChange={(value) =>
                    handleInputChange('teachingLevel', value)
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEACHING_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سنوات الخبرة (اختياري)
                </label>
                <Select
                  value={formData.yearsOfExperience}
                  onValueChange={(value) =>
                    handleInputChange('yearsOfExperience', value)
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر سنوات الخبرة" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Availability Toggle */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-green-900 cursor-pointer">
                    🟢 متاح لعروض الشغل
                  </label>
                  <p className="text-xs text-green-700 mt-1">
                    اجعل ملفك مرئياً للمدارس الخاصة والشريكة
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAvailableForJobs}
                  onChange={(e) =>
                    handleInputChange('isAvailableForJobs', e.target.checked)
                  }
                  className="w-6 h-6 rounded cursor-pointer accent-green-600"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  تم حفظ الملف المهني بنجاح! جاري التوجيه...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={20} />
                  تم الحفظ بنجاح
                </>
              ) : (
                <>
                  💾 حفظ وبدء العمل
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              بعد الحفظ، ستنتقل مباشرة إلى لوحة تحكم المساعد البيداغوجي لتبدأ بتوليد جذاذاتك
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
