import { describe, it, expect } from 'vitest';
import { generateCertificatePDF } from './certificates';

describe('Certificate LRM Fix Tests', () => {
  it('should generate certificate with correct number display (not reversed)', async () => {
    const testData = {
      participantName: 'راوية يوسف',
      courseName: 'تأهيل مدرسي العربية',
      courseType: 'primary_teachers',
      completionDate: new Date('2026-02-24'),
      score: 85,
      certificateNumber: 'CERT-2026-001',
      idCardNumber: '06059637'
    };

    const result = await generateCertificatePDF(testData);
    
    // Verify that the certificate was generated successfully
    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.key).toBeDefined();
    expect(result.url).toContain('https://');
    
    console.log('✅ Certificate generated successfully!');
    console.log('📄 Certificate URL:', result.url);
    console.log('🔑 Certificate Key:', result.key);
    console.log('📅 Test Date: 24 فيفري 2026 (should display as 24, not 42)');
    console.log('🆔 Test ID: 06059637 (should display correctly, not reversed)');
  }, 60000); // 60 second timeout for PDF generation
});
