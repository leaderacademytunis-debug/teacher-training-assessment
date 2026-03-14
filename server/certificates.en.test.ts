import { describe, it, expect } from 'vitest';
import { getCertificateContent } from './certificateContent';

describe('English Certificate - Video AI Course', () => {
  it('should find certificate content for the video AI course (exact match)', () => {
    const content = getCertificateContent('دورة اعداد الفيديوات التعليمية بالذكاء الاصطناعي');
    expect(content).not.toBeNull();
    expect(content!.language).toBe('en');
    expect(content!.title).toBe('CERTIFICAT');
    expect(content!.subtitle).toBe('OF PARTICIPATION');
    expect(content!.axes).toHaveLength(3);
  });

  it('should find certificate content for the video AI course (with trailing space)', () => {
    const content = getCertificateContent('دورة اعداد الفيديوات التعليمية بالذكاء الاصطناعي ');
    expect(content).not.toBeNull();
    expect(content!.language).toBe('en');
    expect(content!.title).toBe('CERTIFICAT');
  });

  it('should have correct axes/topics matching the official template', () => {
    const content = getCertificateContent('دورة اعداد الفيديوات التعليمية بالذكاء الاصطناعي');
    expect(content).not.toBeNull();
    expect(content!.axes[0]).toContain('prompt engineering');
    expect(content!.axes[1]).toContain('Artificial Intelligence tools');
    expect(content!.axes[2]).toContain('educational cartoon videos');
  });

  it('should have mainText mentioning 15 hours', () => {
    const content = getCertificateContent('دورة اعداد الفيديوات التعليمية بالذكاء الاصطناعي');
    expect(content).not.toBeNull();
    expect(content!.mainText).toContain('15 hours');
  });

  it('should still find Arabic certificate content for other courses', () => {
    const arContent = getCertificateContent('تأهيل مدرّسي العربية');
    expect(arContent).not.toBeNull();
    expect(arContent!.language).toBe('ar');
  });

  it('should still find French certificate content', () => {
    const frContent = getCertificateContent('تأهيل مدرّسي الفرنسية');
    expect(frContent).not.toBeNull();
    expect(frContent!.language).toBe('fr');
  });
});
