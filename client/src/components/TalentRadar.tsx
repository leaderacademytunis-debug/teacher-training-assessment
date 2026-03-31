'use client';

import React, { useState } from 'react';
import { Search, Lock, Award, BookOpen, Video } from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  arabicName: string;
  specialty: string;
  subject: string;
  level: string;
  teachingLanguage: string;
  avatar: string;
  badge: boolean;
  stats: {
    lessonsCreated: number;
    videosCreated: number;
  };
  phone: string;
  email: string;
}

const dummyTeachers: Teacher[] = [
  {
    id: 1,
    name: 'أستاذ أحمد',
    arabicName: 'أحمد محمد علي',
    specialty: 'خبير تدريس تفاعلي - رياضيات',
    subject: 'رياضيات',
    level: 'ابتدائي',
    teachingLanguage: 'عربية',
    avatar: '👨‍🏫',
    badge: true,
    stats: {
      lessonsCreated: 15,
      videosCreated: 4,
    },
    phone: '+216 98 123 456',
    email: 'ahmed@leaderacademy.tn',
  },
  {
    id: 2,
    name: 'أستاذة سارة',
    arabicName: 'سارة محمود حسن',
    specialty: 'متخصصة في اللغة العربية - تعليم ذكي',
    subject: 'لغة عربية',
    level: 'إعدادي',
    teachingLanguage: 'عربية',
    avatar: '👩‍🏫',
    badge: true,
    stats: {
      lessonsCreated: 22,
      videosCreated: 7,
    },
    phone: '+216 98 234 567',
    email: 'sarah@leaderacademy.tn',
  },
  {
    id: 3,
    name: 'أستاذ محمود',
    arabicName: 'محمود علي محمد',
    specialty: 'متخصص في العلوم - إيقاظ علمي',
    subject: 'إيقاظ علمي',
    level: 'ابتدائي',
    teachingLanguage: 'عربية',
    avatar: '👨‍🔬',
    badge: true,
    stats: {
      lessonsCreated: 18,
      videosCreated: 5,
    },
    phone: '+216 98 345 678',
    email: 'mahmoud@leaderacademy.tn',
  },
];

export function TalentRadar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const subjects = ['رياضيات', 'لغة عربية', 'إيقاظ علمي', 'لغة فرنسية', 'اللغة الإنجليزية'];
  const levels = ['ابتدائي', 'إعدادي', 'ثانوي'];
  const languages = ['عربية', 'فرنسية', 'إنجليزية'];

  const filteredTeachers = dummyTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.includes(searchQuery) ||
      teacher.arabicName.includes(searchQuery) ||
      teacher.specialty.includes(searchQuery);
    const matchesSubject = !selectedSubject || teacher.subject === selectedSubject;
    const matchesLevel = !selectedLevel || teacher.level === selectedLevel;
    const matchesLanguage = !selectedLanguage || teacher.teachingLanguage === selectedLanguage;

    return matchesSearch && matchesSubject && matchesLevel && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🎯 رادار الكفاءات</h1>
        <p className="text-slate-600 text-lg">
          اكتشف أفضل المعلمين المعتمدين من Leader Academy في تخصصك
        </p>
      </div>

      {/* Smart Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="ابحث عن اسم المعلم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">المادة</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">المستوى</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">لغة التدريس</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              {/* Avatar */}
              <div className="text-6xl mb-4 flex justify-center">{teacher.avatar}</div>

              {/* Name and Badge */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">{teacher.name}</h3>
                {teacher.badge && (
                  <span className="bg-yellow-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award size={14} />
                    معتمد
                  </span>
                )}
              </div>

              {/* Specialty */}
              <p className="text-green-50 text-sm">{teacher.specialty}</p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Stats Bar */}
              <div className="bg-slate-100 rounded-lg p-4 mb-6 flex justify-around text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-green-600 font-bold mb-1">
                    <BookOpen size={16} />
                    {teacher.stats.lessonsCreated}
                  </div>
                  <p className="text-xs text-slate-600">جذاذة مُنتجة</p>
                </div>
                <div className="border-r border-slate-300"></div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-bold mb-1">
                    <Video size={16} />
                    {teacher.stats.videosCreated}
                  </div>
                  <p className="text-xs text-slate-600">فيديو تفاعلي</p>
                </div>
              </div>

              {/* Contact Info with Blur Paywall */}
              <div className="relative">
                {/* Blur Paywall Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent rounded-lg z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <Lock size={24} className="text-slate-400" />
                  <p className="text-xs text-slate-600 text-center px-2">
                    حصري للمدارس المشتركة. قم بترقية باقتك للوصول لبيانات الانتداب.
                  </p>
                </div>

                {/* Contact Info (Blurred) */}
                <div className="space-y-3 filter blur-sm select-none pointer-events-none">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">الهاتف</p>
                    <p className="text-sm font-semibold text-slate-700">{teacher.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">البريد الإلكتروني</p>
                    <p className="text-sm font-semibold text-slate-700">{teacher.email}</p>
                  </div>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                    بيانات الاتصال والانتداب
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 text-lg">لا توجد نتائج تطابق معايير البحث الخاصة بك</p>
        </div>
      )}
    </div>
  );
}
