import { describe, it, expect } from 'vitest';
import { generateCertificatePDF } from './certificates';

describe('French Certificate Generation', () => {
  it('should generate French certificate successfully', async () => {
    const result = await generateCertificatePDF({
      participantName: 'علي سعدالله',
      courseName: 'تأهيل مدرسي الفرنسية', // Without diacritics
      courseType: 'french_teachers',
      completionDate: new Date('2026-02-12'),
      score: 85,
      certificateNumber: 'TEST-FRENCH-001',
    });

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
    expect(typeof result.url).toBe('string');
    expect(typeof result.key).toBe('string');
  }, 30000); // 30 second timeout for PDF generation

  it('should generate French certificate with diacritics', async () => {
    const result = await generateCertificatePDF({
      participantName: 'علي سعدالله',
      courseName: 'تأهيل مدرّسي الفرنسية', // With diacritics
      courseType: 'french_teachers',
      completionDate: new Date('2026-02-12'),
      score: 90,
      certificateNumber: 'TEST-FRENCH-002',
    });

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
  }, 30000);
});
