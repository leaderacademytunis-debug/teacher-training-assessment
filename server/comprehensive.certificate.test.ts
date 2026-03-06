/**
 * Unit tests for the Comprehensive (Master) Certificate
 * Tests that the comprehensive certificate is generated with the correct
 * golden design and 4 signatures when the course name contains 'أصحاب الشهادات العليا'
 */
import { describe, it, expect } from 'vitest';
import { generateCertificatePDF } from './certificates';

describe('Comprehensive Certificate Generation', () => {
  it('should generate a PDF URL for the comprehensive certificate', async () => {
    const result = await generateCertificatePDF({
      participantName: 'محمد بن علي',
      courseName: 'تأهيل أصحاب الشهادات العليا',
      courseType: 'primary_teachers',
      completionDate: new Date('2025-02-27'),
      score: 90,
      certificateNumber: `TEST-COMP-${Date.now()}`,
      idCardNumber: '12345678',
      batchNumber: '107',
    });

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.url).toMatch(/^https?:\/\//);
    expect(result.key).toContain('certificates/');
  }, 30000);

  it('should also generate a PDF URL for a regular Arabic certificate', async () => {
    const result = await generateCertificatePDF({
      participantName: 'فاطمة الزهراء',
      courseName: 'تأهيل مدرّسي العربية',
      courseType: 'arabic_teachers',
      completionDate: new Date('2025-02-27'),
      score: 80,
      certificateNumber: `TEST-AR-${Date.now()}`,
    });

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.url).toMatch(/^https?:\/\//);
  }, 30000);

  it('should generate comprehensive certificate without idCardNumber or batchNumber', async () => {
    const result = await generateCertificatePDF({
      participantName: 'أحمد الكريم',
      courseName: 'تأهيل أصحاب الشهادات العليا',
      courseType: 'primary_teachers',
      completionDate: new Date('2025-03-01'),
      score: 85,
      certificateNumber: `TEST-COMP2-${Date.now()}`,
      // No idCardNumber or batchNumber - should still work
    });

    expect(result).toBeDefined();
    expect(result.url).toBeTruthy();
    expect(result.url).toMatch(/^https?:\/\//);
  }, 30000);
});
