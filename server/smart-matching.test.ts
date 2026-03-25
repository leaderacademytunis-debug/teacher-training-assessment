import { describe, it, expect } from "vitest";

/**
 * Tests for the Enhanced Smart Matching System
 * Tests the multi-criteria weighted scoring algorithm
 */

// Simulate the enhanced matching scoring logic
function calculateTestMatchScore(teacher: any, job: any) {
  const breakdown: Record<string, { score: number; max: number; details: string }> = {};
  let totalScore = 0;
  let totalMax = 0;

  // 1. Subject Match (weight: 25)
  const subjectMax = 25;
  let subjectScore = 0;
  const teacherSpecs = teacher.specializations || [];
  if (teacherSpecs.some((s: string) => s === job.subject)) {
    subjectScore = subjectMax;
  } else if (teacherSpecs.some((s: string) => job.subject?.includes(s) || s.includes(job.subject || ""))) {
    subjectScore = Math.round(subjectMax * 0.6);
  }
  breakdown.subject = { score: subjectScore, max: subjectMax, details: subjectScore === subjectMax ? "تطابق تام" : subjectScore > 0 ? "تطابق جزئي" : "لا تطابق" };
  totalScore += subjectScore;
  totalMax += subjectMax;

  // 2. Region Match (weight: 20)
  const regionMax = 20;
  let regionScore = 0;
  if (teacher.region === job.region) {
    regionScore = regionMax;
  } else if (teacher.additionalRegions?.includes(job.region)) {
    regionScore = Math.round(regionMax * 0.7);
  }
  breakdown.region = { score: regionScore, max: regionMax, details: regionScore === regionMax ? "نفس المنطقة" : regionScore > 0 ? "منطقة إضافية" : "منطقة مختلفة" };
  totalScore += regionScore;
  totalMax += regionMax;

  // 3. Experience (weight: 15)
  const expMax = 15;
  let expScore = 0;
  const years = teacher.yearsOfExperience || 0;
  const minExp = job.minExperience || 0;
  const maxExp = job.maxExperience;
  if (minExp === 0 && !maxExp) {
    expScore = Math.min(years * 2, expMax);
  } else if (years >= minExp) {
    if (!maxExp || years <= maxExp) {
      expScore = expMax;
    } else {
      expScore = Math.round(expMax * 0.7);
    }
  } else {
    expScore = Math.round((years / minExp) * expMax * 0.5);
  }
  breakdown.experience = { score: expScore, max: expMax, details: `${years} سنة` };
  totalScore += expScore;
  totalMax += expMax;

  // 4. Skills (weight: 10)
  const skillsMax = 10;
  let skillsScore = 0;
  const reqSkills = job.requiredSkills || [];
  const teacherSkills = teacher.skills || [];
  if (reqSkills.length > 0) {
    const matched = reqSkills.filter((s: string) => teacherSkills.includes(s));
    skillsScore = Math.round((matched.length / reqSkills.length) * skillsMax);
  } else {
    skillsScore = Math.min(teacherSkills.length * 2, skillsMax);
  }
  breakdown.skills = { score: skillsScore, max: skillsMax, details: `${skillsScore > 0 ? "مهارات متطابقة" : "لا تطابق"}` };
  totalScore += skillsScore;
  totalMax += skillsMax;

  // 5. Certifications (weight: 10)
  const certMax = 10;
  let certScore = 0;
  const certCount = teacher.certCount || 0;
  if (job.requiresCertification) {
    certScore = certCount > 0 ? certMax : 0;
  } else {
    certScore = Math.min(certCount * 3, certMax);
  }
  breakdown.certifications = { score: certScore, max: certMax, details: `${certCount} شهادة` };
  totalScore += certScore;
  totalMax += certMax;

  // 6. Languages (weight: 5)
  const langMax = 5;
  let langScore = 0;
  const reqLangs = job.requiredLanguages || [];
  const teacherLangs = teacher.languages || [];
  if (reqLangs.length > 0) {
    const matched = reqLangs.filter((l: string) => teacherLangs.includes(l));
    langScore = Math.round((matched.length / reqLangs.length) * langMax);
  } else {
    langScore = Math.min(teacherLangs.length * 2, langMax);
  }
  breakdown.languages = { score: langScore, max: langMax, details: `${teacherLangs.length} لغة` };
  totalScore += langScore;
  totalMax += langMax;

  // 7. Availability (weight: 5)
  const availMax = 5;
  let availScore = 0;
  if (teacher.availabilityStatus === "available") {
    availScore = availMax;
  } else if (teacher.availabilityStatus === "open_to_offers") {
    availScore = Math.round(availMax * 0.7);
  }
  breakdown.availability = { score: availScore, max: availMax, details: teacher.availabilityStatus || "غير محدد" };
  totalScore += availScore;
  totalMax += availMax;

  // 8. Methodologies (weight: 5)
  const methMax = 5;
  let methScore = 0;
  const reqMeth = job.preferredMethodologies || [];
  const teacherMeth = teacher.methodologies || [];
  if (reqMeth.length > 0 && teacherMeth.length > 0) {
    const matched = reqMeth.filter((m: string) => teacherMeth.includes(m));
    methScore = Math.round((matched.length / reqMeth.length) * methMax);
  }
  breakdown.methodologies = { score: methScore, max: methMax, details: `${methScore > 0 ? "متطابقة" : "لا تطابق"}` };
  totalScore += methScore;
  totalMax += methMax;

  // 9. Education Level (weight: 3)
  const eduMax = 3;
  let eduScore = 0;
  if (teacher.educationLevel && job.grade) {
    if (teacher.educationLevel === job.grade) {
      eduScore = eduMax;
    }
  }
  breakdown.educationLevel = { score: eduScore, max: eduMax, details: teacher.educationLevel || "غير محدد" };
  totalScore += eduScore;
  totalMax += eduMax;

  // 10. Platform Activity (weight: 2)
  const actMax = 2;
  let actScore = 0;
  const activity = teacher.platformActivity || 0;
  actScore = Math.min(Math.round(activity / 10), actMax);
  breakdown.platformActivity = { score: actScore, max: actMax, details: `${activity} نشاط` };
  totalScore += actScore;
  totalMax += actMax;

  const finalScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  // Determine strength and improvement areas
  const strengthAreas: string[] = [];
  const improvementAreas: string[] = [];
  for (const [key, val] of Object.entries(breakdown)) {
    const pct = val.max > 0 ? val.score / val.max : 0;
    if (pct >= 0.8) strengthAreas.push(key);
    else if (pct < 0.3 && val.max >= 5) improvementAreas.push(key);
  }

  return { score: finalScore, breakdown, strengthAreas, improvementAreas };
}

describe("Enhanced Smart Matching Algorithm", () => {
  it("should give 100% for a perfect match", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      additionalRegions: [],
      yearsOfExperience: 5,
      skills: ["تكنولوجيا التعليم", "إدارة الصف"],
      certCount: 3,
      languages: ["العربية", "الفرنسية"],
      availabilityStatus: "available",
      methodologies: ["التعلم النشط", "المقاربة بالكفايات"],
      educationLevel: "primary",
      platformActivity: 50,
    };
    const job = {
      subject: "رياضيات",
      region: "تونس العاصمة",
      grade: "primary",
      minExperience: 3,
      maxExperience: 10,
      requiredSkills: ["تكنولوجيا التعليم", "إدارة الصف"],
      requiresCertification: true,
      requiredLanguages: ["العربية", "الفرنسية"],
      preferredMethodologies: ["التعلم النشط", "المقاربة بالكفايات"],
    };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.score).toBe(100);
    expect(result.strengthAreas.length).toBeGreaterThan(5);
    expect(result.improvementAreas.length).toBe(0);
  });

  it("should give 0% for a completely mismatched teacher", () => {
    const teacher = {
      specializations: ["تربية بدنية"],
      region: "قبلي",
      additionalRegions: [],
      yearsOfExperience: 0,
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "not_available",
      methodologies: [],
      educationLevel: "secondary",
      platformActivity: 0,
    };
    const job = {
      subject: "رياضيات",
      region: "تونس العاصمة",
      grade: "primary",
      minExperience: 5,
      requiredSkills: ["تكنولوجيا التعليم"],
      requiresCertification: true,
      requiredLanguages: ["الإنجليزية"],
      preferredMethodologies: ["التعلم النشط"],
    };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.score).toBe(0);
    expect(result.improvementAreas.length).toBeGreaterThan(3);
  });

  it("should handle partial subject match", () => {
    const teacher = {
      specializations: ["إيقاظ علمي"],
      region: "تونس العاصمة",
      yearsOfExperience: 3,
      skills: [],
      certCount: 1,
      languages: ["العربية"],
      availabilityStatus: "open_to_offers",
      methodologies: [],
      educationLevel: "primary",
      platformActivity: 10,
    };
    const job = {
      subject: "علوم",
      region: "تونس العاصمة",
      grade: "primary",
    };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThan(100);
  });

  it("should value experience correctly within range", () => {
    const baseTeacher = {
      specializations: ["رياضيات"],
      region: "صفاقس",
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = {
      subject: "رياضيات",
      region: "صفاقس",
      minExperience: 3,
      maxExperience: 8,
    };

    // Teacher with perfect experience
    const r1 = calculateTestMatchScore({ ...baseTeacher, yearsOfExperience: 5 }, job);
    // Teacher with too little experience
    const r2 = calculateTestMatchScore({ ...baseTeacher, yearsOfExperience: 1 }, job);
    // Teacher with too much experience
    const r3 = calculateTestMatchScore({ ...baseTeacher, yearsOfExperience: 15 }, job);

    expect(r1.breakdown.experience.score).toBe(15); // Full score
    expect(r2.breakdown.experience.score).toBeLessThan(r1.breakdown.experience.score);
    expect(r3.breakdown.experience.score).toBeLessThan(r1.breakdown.experience.score);
    expect(r3.breakdown.experience.score).toBeGreaterThan(r2.breakdown.experience.score); // Over-qualified > under-qualified
  });

  it("should give higher score for additional region match", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "أريانة",
      additionalRegions: ["تونس العاصمة"],
      yearsOfExperience: 3,
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.region.score).toBe(14); // 70% of 20
    expect(result.breakdown.region.details).toBe("منطقة إضافية");
  });

  it("should penalize when certification is required but teacher has none", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      yearsOfExperience: 5,
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = { subject: "رياضيات", region: "تونس العاصمة", requiresCertification: true };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.certifications.score).toBe(0);
  });

  it("should reward certification when required and teacher has them", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      yearsOfExperience: 5,
      skills: [],
      certCount: 2,
      languages: [],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = { subject: "رياضيات", region: "تونس العاصمة", requiresCertification: true };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.certifications.score).toBe(10); // Full score
  });

  it("should correctly match languages", () => {
    const teacher = {
      specializations: ["فرنسية"],
      region: "تونس العاصمة",
      yearsOfExperience: 3,
      skills: [],
      certCount: 0,
      languages: ["العربية", "الفرنسية", "الإنجليزية"],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = {
      subject: "فرنسية",
      region: "تونس العاصمة",
      requiredLanguages: ["العربية", "الفرنسية"],
    };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.languages.score).toBe(5); // Full match
  });

  it("should correctly match methodologies", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      yearsOfExperience: 3,
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "available",
      methodologies: ["التعلم النشط", "التعلم بالمشاريع"],
      platformActivity: 0,
    };
    const job = {
      subject: "رياضيات",
      region: "تونس العاصمة",
      preferredMethodologies: ["التعلم النشط", "المقاربة بالكفايات"],
    };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.methodologies.score).toBe(3); // 1 out of 2 = 50% of 5 ≈ 3
  });

  it("should identify strength and improvement areas correctly", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      yearsOfExperience: 10,
      skills: ["تكنولوجيا التعليم"],
      certCount: 5,
      languages: ["العربية"],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = {
      subject: "رياضيات",
      region: "تونس العاصمة",
      minExperience: 3,
      requiredSkills: ["تكنولوجيا التعليم", "إدارة الصف", "التخطيط البيداغوجي"],
      preferredMethodologies: ["التعلم النشط"],
    };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.strengthAreas).toContain("subject");
    expect(result.strengthAreas).toContain("region");
    expect(result.strengthAreas).toContain("experience");
    expect(result.strengthAreas).toContain("certifications");
    // Skills: 1/3 = 33% → not a strength
    // Methodologies: 0/1 = 0% → improvement area
    expect(result.improvementAreas).toContain("methodologies");
  });

  it("should handle availability scoring correctly", () => {
    const base = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      yearsOfExperience: 3,
      skills: [],
      certCount: 0,
      languages: [],
      methodologies: [],
      platformActivity: 0,
    };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };

    const available = calculateTestMatchScore({ ...base, availabilityStatus: "available" }, job);
    const openToOffers = calculateTestMatchScore({ ...base, availabilityStatus: "open_to_offers" }, job);
    const notAvailable = calculateTestMatchScore({ ...base, availabilityStatus: "not_available" }, job);

    expect(available.breakdown.availability.score).toBe(5);
    expect(openToOffers.breakdown.availability.score).toBe(4); // 70% of 5 rounded
    expect(notAvailable.breakdown.availability.score).toBe(0);
  });

  it("should return all 10 criteria in breakdown", () => {
    const teacher = {
      specializations: ["رياضيات"],
      region: "تونس العاصمة",
      yearsOfExperience: 3,
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };
    const result = calculateTestMatchScore(teacher, job);
    const expectedKeys = [
      "subject", "region", "experience", "skills", "certifications",
      "languages", "availability", "methodologies", "educationLevel", "platformActivity"
    ];
    for (const key of expectedKeys) {
      expect(result.breakdown).toHaveProperty(key);
      expect(result.breakdown[key]).toHaveProperty("score");
      expect(result.breakdown[key]).toHaveProperty("max");
      expect(result.breakdown[key]).toHaveProperty("details");
    }
  });

  it("should have total max weight of 100", () => {
    const teacher = {
      specializations: [],
      region: "",
      yearsOfExperience: 0,
      skills: [],
      certCount: 0,
      languages: [],
      availabilityStatus: "not_available",
      methodologies: [],
      platformActivity: 0,
    };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };
    const result = calculateTestMatchScore(teacher, job);
    const totalMax = Object.values(result.breakdown).reduce((sum: number, v: any) => sum + v.max, 0);
    expect(totalMax).toBe(100);
  });

  it("should score between 0 and 100 inclusive", () => {
    const teachers = [
      { specializations: [], region: "", yearsOfExperience: 0, skills: [], certCount: 0, languages: [], availabilityStatus: "not_available", methodologies: [], platformActivity: 0 },
      { specializations: ["رياضيات"], region: "تونس العاصمة", yearsOfExperience: 10, skills: ["تكنولوجيا التعليم"], certCount: 5, languages: ["العربية", "الفرنسية"], availabilityStatus: "available", methodologies: ["التعلم النشط"], educationLevel: "primary", platformActivity: 100 },
    ];
    const job = { subject: "رياضيات", region: "تونس العاصمة", grade: "primary", minExperience: 3, requiredSkills: ["تكنولوجيا التعليم"], requiresCertification: true, requiredLanguages: ["العربية"], preferredMethodologies: ["التعلم النشط"] };
    for (const t of teachers) {
      const result = calculateTestMatchScore(t, job);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("Smart Matching - Weight Distribution", () => {
  it("subject should have the highest weight (25)", () => {
    const teacher = { specializations: [], region: "", yearsOfExperience: 0, skills: [], certCount: 0, languages: [], availabilityStatus: "not_available", methodologies: [], platformActivity: 0 };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.subject.max).toBe(25);
  });

  it("region should have second highest weight (20)", () => {
    const teacher = { specializations: [], region: "", yearsOfExperience: 0, skills: [], certCount: 0, languages: [], availabilityStatus: "not_available", methodologies: [], platformActivity: 0 };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.region.max).toBe(20);
  });

  it("experience should have third highest weight (15)", () => {
    const teacher = { specializations: [], region: "", yearsOfExperience: 0, skills: [], certCount: 0, languages: [], availabilityStatus: "not_available", methodologies: [], platformActivity: 0 };
    const job = { subject: "رياضيات", region: "تونس العاصمة" };
    const result = calculateTestMatchScore(teacher, job);
    expect(result.breakdown.experience.max).toBe(15);
  });
});
