import React, { useState, useMemo } from 'react';
import { Search, Lock, Award, BookOpen, Video, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface TeacherProfile {
  id: number;
  userId: number;
  avatarUrl: string | null;
  subject: string | null;
  teachingLevel: string | null;
  yearsOfExperience: number | null;
  lessonsCreated: number;
  videosCreated: number;
  isAvailableForJobs: boolean;
  userName: string | null;
  userPhone: string | null;
  userEmail: string | null;
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

export function TalentRadar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Fetch real teacher profiles from database
  const { data: teacherProfiles = [], isLoading } = trpc.profileBuilder.getAllTeacherProfiles.useQuery();

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return teacherProfiles.filter((teacher) => {
      const matchesSearch =
        (teacher.userName?.includes(searchQuery) || false) ||
        (teacher.subject?.includes(searchQuery) || false);
      const matchesSubject = !selectedSubject || teacher.subject === selectedSubject;
      const matchesLevel = !selectedLevel || teacher.teachingLevel === selectedLevel;

      return matchesSearch && matchesSubject && matchesLevel;
    });
  }, [teacherProfiles, searchQuery, selectedSubject, selectedLevel]);

  const getLevelLabel = (level: string | null) => {
    const found = TEACHING_LEVELS.find((l) => l.value === level);
    return found?.label || level || 'غير محدد';
  };

  const getAvatarDisplay = (avatarUrl: string | null, name: string | null) => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name || 'معلم'}
          className="w-16 h-16 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-2xl">
        👨‍🏫
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">جاري تحميل بيانات المعلمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 رادار الكفاءات
          </h1>
          <p className="text-gray-600 text-lg">
            اكتشف أفضل المعلمين المعتمدين من Leader Academy
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ابحث عن معلم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
              >
                <option value="">جميع المواد</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
              >
                <option value="">جميع المستويات</option>
                {TEACHING_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-900 font-semibold">
                {filteredTeachers.length} معلم متاح
              </p>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              لم نجد معلمين يطابقون معايير البحث. حاول تغيير المرشحات.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex items-center gap-4">
                  {getAvatarDisplay(teacher.avatarUrl, teacher.userName)}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      {teacher.userName || 'معلم'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {teacher.subject || 'غير محدد'}
                    </p>
                  </div>
                  {teacher.yearsOfExperience && teacher.yearsOfExperience > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Award size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Level Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">المستوى:</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getLevelLabel(teacher.teachingLevel)}
                    </span>
                  </div>

                  {/* Experience */}
                  {teacher.yearsOfExperience !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">الخبرة:</span>
                      <span className="text-gray-900 font-medium">
                        {teacher.yearsOfExperience} سنة
                      </span>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} className="text-purple-600" />
                      <div>
                        <p className="text-gray-600 text-xs">جذاذات</p>
                        <p className="text-gray-900 font-bold">
                          {teacher.lessonsCreated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video size={18} className="text-orange-600" />
                      <div>
                        <p className="text-gray-600 text-xs">فيديوهات</p>
                        <p className="text-gray-900 font-bold">
                          {teacher.videosCreated}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Contact Info with Blur Paywall */}
                <div className="relative bg-gray-50 p-6 border-t border-gray-200">
                  {/* Blur Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-lg z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <Lock size={24} className="text-slate-400" />
                    <p className="text-xs text-slate-600 text-center px-2">
                      حصري للمدارس المشتركة. قم بترقية باقتك للوصول لبيانات الانتداب.
                    </p>
                  </div>

                  {/* Blurred Content */}
                  <div className="space-y-3 filter blur-sm select-none pointer-events-none">
                    <p className="text-sm font-semibold text-slate-700">
                      {teacher.userPhone}
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {teacher.userEmail}
                    </p>
                    <button className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                      بيانات الاتصال والانتداب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
