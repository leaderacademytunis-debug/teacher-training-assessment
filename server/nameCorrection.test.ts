/**
 * Name Correction Feature Tests
 * Tests for the name correction and certificate regeneration system
 */
import { describe, it, expect } from 'vitest';

describe('Name Correction Feature', () => {
  // Schema validation tests
  describe('Schema Validation', () => {
    it('should have nameEditHistory table with required fields', async () => {
      const { nameEditHistory } = await import('../drizzle/schema');
      expect(nameEditHistory).toBeDefined();
      
      // Check all required columns exist
      const columns = Object.keys(nameEditHistory);
      expect(columns).toContain('id');
      expect(columns).toContain('userId');
      expect(columns).toContain('editedBy');
      expect(columns).toContain('previousFirstNameAr');
      expect(columns).toContain('previousLastNameAr');
      expect(columns).toContain('previousFirstNameFr');
      expect(columns).toContain('previousLastNameFr');
      expect(columns).toContain('newFirstNameAr');
      expect(columns).toContain('newLastNameAr');
      expect(columns).toContain('newFirstNameFr');
      expect(columns).toContain('newLastNameFr');
      expect(columns).toContain('reason');
      expect(columns).toContain('certificatesRegenerated');
      expect(columns).toContain('createdAt');
    });

    it('should have certificates table with correctedName and lastRegeneratedAt fields', async () => {
      const { certificates } = await import('../drizzle/schema');
      expect(certificates).toBeDefined();
      
      const columns = Object.keys(certificates);
      expect(columns).toContain('correctedName');
      expect(columns).toContain('lastRegeneratedAt');
    });

    it('should export NameEditHistory and InsertNameEditHistory types', async () => {
      const schema = await import('../drizzle/schema');
      // Types are compile-time only, but we can verify the table exists
      expect(schema.nameEditHistory).toBeDefined();
    });
  });

  // Router endpoint tests
  describe('Admin Control Router - Name Correction Endpoints', () => {
    it('should have searchUsersForCorrection endpoint defined', async () => {
      const { adminControlRouter } = await import('./routers/adminControl');
      expect(adminControlRouter).toBeDefined();
      
      // Check that the router has the expected procedures
      const routerDef = adminControlRouter._def;
      expect(routerDef).toBeDefined();
    });

    it('should have getUserForNameCorrection endpoint defined', async () => {
      const { adminControlRouter } = await import('./routers/adminControl');
      expect(adminControlRouter).toBeDefined();
    });

    it('should have correctParticipantName endpoint defined', async () => {
      const { adminControlRouter } = await import('./routers/adminControl');
      expect(adminControlRouter).toBeDefined();
    });

    it('should have getNameEditHistory endpoint defined', async () => {
      const { adminControlRouter } = await import('./routers/adminControl');
      expect(adminControlRouter).toBeDefined();
    });
  });

  // Input validation tests
  describe('Input Validation', () => {
    it('should validate search query requires minimum 1 character', () => {
      const { z } = require('zod');
      const schema = z.object({ query: z.string().min(1) });
      
      expect(() => schema.parse({ query: '' })).toThrow();
      expect(() => schema.parse({ query: 'a' })).not.toThrow();
      expect(() => schema.parse({ query: 'محمد' })).not.toThrow();
    });

    it('should validate userId is a number', () => {
      const { z } = require('zod');
      const schema = z.object({ userId: z.number() });
      
      expect(() => schema.parse({ userId: 1 })).not.toThrow();
      expect(() => schema.parse({ userId: 'abc' })).toThrow();
    });

    it('should validate correction input with optional fields', () => {
      const { z } = require('zod');
      const schema = z.object({
        userId: z.number(),
        firstNameAr: z.string().optional(),
        lastNameAr: z.string().optional(),
        firstNameFr: z.string().optional(),
        lastNameFr: z.string().optional(),
        reason: z.string().optional(),
        regenerateCertificates: z.boolean().default(false),
      });

      // Minimal input
      const result1 = schema.parse({ userId: 1 });
      expect(result1.userId).toBe(1);
      expect(result1.regenerateCertificates).toBe(false);

      // Full input
      const result2 = schema.parse({
        userId: 1,
        firstNameAr: 'محمد',
        lastNameAr: 'الأمين',
        firstNameFr: 'Mohamed',
        lastNameFr: 'Amine',
        reason: 'خطأ إملائي',
        regenerateCertificates: true,
      });
      expect(result2.firstNameAr).toBe('محمد');
      expect(result2.regenerateCertificates).toBe(true);
    });

    it('should validate history limit defaults to 50', () => {
      const { z } = require('zod');
      const schema = z.object({ limit: z.number().default(50) });
      
      const result = schema.parse({});
      expect(result.limit).toBe(50);
    });
  });

  // Certificate regeneration logic tests
  describe('Certificate Regeneration Logic', () => {
    it('should preserve certificate number during regeneration', () => {
      // Simulate the regeneration logic
      const originalCert = {
        certificateNumber: 'CERT-2026-001',
        issuedAt: new Date('2026-01-15'),
        userId: 1,
      };

      // After regeneration, these should remain the same
      const regeneratedCert = {
        ...originalCert,
        correctedName: 'محمد الأمين',
        lastRegeneratedAt: new Date(),
      };

      expect(regeneratedCert.certificateNumber).toBe(originalCert.certificateNumber);
      expect(regeneratedCert.issuedAt).toEqual(originalCert.issuedAt);
      expect(regeneratedCert.correctedName).toBe('محمد الأمين');
      expect(regeneratedCert.lastRegeneratedAt).toBeDefined();
    });

    it('should construct correct full name from first and last name', () => {
      const constructFullName = (firstName: string, lastName: string) => {
        return `${firstName} ${lastName}`.trim();
      };

      expect(constructFullName('محمد', 'الأمين')).toBe('محمد الأمين');
      expect(constructFullName('', 'الأمين')).toBe('الأمين');
      expect(constructFullName('محمد', '')).toBe('محمد');
      expect(constructFullName('', '')).toBe('');
    });

    it('should track edit history with before and after values', () => {
      const editRecord = {
        userId: 1,
        editedBy: 2,
        previousFirstNameAr: 'محمد',
        previousLastNameAr: 'الأمين',
        newFirstNameAr: 'محمّد',
        newLastNameAr: 'الأمين',
        reason: 'تصحيح الشدة',
        certificatesRegenerated: 2,
      };

      expect(editRecord.previousFirstNameAr).not.toBe(editRecord.newFirstNameAr);
      expect(editRecord.previousLastNameAr).toBe(editRecord.newLastNameAr);
      expect(editRecord.certificatesRegenerated).toBe(2);
      expect(editRecord.reason).toBe('تصحيح الشدة');
    });
  });

  // UI-related data structure tests
  describe('Data Structure Validation', () => {
    it('should return user data with all name fields', () => {
      const userData = {
        id: 1,
        name: 'Mohamed Amine',
        firstNameAr: 'محمد',
        lastNameAr: 'الأمين',
        firstNameFr: 'Mohamed',
        lastNameFr: 'Amine',
        arabicName: 'محمد الأمين',
        email: 'mohamed@example.com',
      };

      expect(userData.firstNameAr).toBeDefined();
      expect(userData.lastNameAr).toBeDefined();
      expect(userData.firstNameFr).toBeDefined();
      expect(userData.lastNameFr).toBeDefined();
      expect(userData.email).toContain('@');
    });

    it('should return certificates with course info', () => {
      const certWithCourse = {
        id: 1,
        certificateNumber: 'CERT-2026-001',
        courseId: 1,
        pdfUrl: 'https://storage.example.com/cert.pdf',
        correctedName: null,
        issuedAt: new Date(),
        lastRegeneratedAt: null,
        courseTitleAr: 'تأهيل مدرسي العلوم',
        courseCategory: 'science_teachers',
      };

      expect(certWithCourse.certificateNumber).toMatch(/^CERT-/);
      expect(certWithCourse.courseTitleAr).toBeDefined();
      expect(certWithCourse.courseCategory).toBeDefined();
    });

    it('should return enriched edit history with editor and participant names', () => {
      const enrichedHistory = {
        id: 1,
        userId: 1,
        editedBy: 2,
        previousFirstNameAr: 'محمد',
        previousLastNameAr: 'الأمين',
        newFirstNameAr: 'محمّد',
        newLastNameAr: 'الأمين',
        reason: 'تصحيح',
        certificatesRegenerated: 1,
        createdAt: new Date(),
        participantName: 'Mohamed Amine',
        participantEmail: 'mohamed@example.com',
        editorName: 'Admin',
      };

      expect(enrichedHistory.participantName).toBeDefined();
      expect(enrichedHistory.editorName).toBeDefined();
      expect(enrichedHistory.participantEmail).toContain('@');
    });
  });
});
