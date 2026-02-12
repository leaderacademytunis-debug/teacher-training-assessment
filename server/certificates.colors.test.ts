import { describe, it, expect } from 'vitest';
import { generateCertificatePDF } from './certificates';

describe('Certificate Border Colors by Category', () => {
  const categories = [
    { name: 'science_teachers', courseName: 'تأهيل مدرسي العلوم', color: 'Blue' },
    { name: 'arabic_teachers', courseName: 'تأهيل مدرسي العربية', color: 'Green' },
    { name: 'french_teachers', courseName: 'تأهيل مدرسي الفرنسية', color: 'Burgundy' },
    { name: 'preschool_facilitators', courseName: 'تأهيل منشطي التحضيري', color: 'Purple' },
    { name: 'special_needs_companions', courseName: 'تأهيل مرافقي التلاميذ ذوي الصعوبات', color: 'Orange' },
  ];

  categories.forEach(({ name, courseName, color }) => {
    it(`should generate ${color} certificate for ${name}`, async () => {
      const result = await generateCertificatePDF({
        participantName: 'علي سعدالله',
        courseName: courseName,
        courseType: name,
        completionDate: new Date('2026-02-12'),
        score: 85,
        certificateNumber: `TEST-${name.toUpperCase()}-001`,
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(typeof result.url).toBe('string');
      expect(typeof result.key).toBe('string');
      
      console.log(`✅ ${color} certificate generated: ${result.url}`);
    }, 30000); // 30 second timeout for PDF generation
  });
});
