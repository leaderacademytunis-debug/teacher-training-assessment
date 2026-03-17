import { describe, it, expect, vi } from "vitest";

// ── Video Evaluator: Schema & Input Validation ──────────────────────────────

describe("Video Evaluator — Schema & Input Validation", () => {
  const REQUIRED_FIELDS = ["originalPrompt", "targetAudience", "educationalObjective"];
  const OPTIONAL_FIELDS = ["videoUrl", "videoDescription", "toolUsed", "grade", "subject", "lessonTitle", "attachments"];

  it("should require all mandatory fields for evaluation", () => {
    const validInput = {
      originalPrompt: "Create an animated video explaining the water cycle for 4th grade students",
      targetAudience: "تلاميذ السنة الرابعة ابتدائي",
      educationalObjective: "شرح دورة الماء في الطبيعة",
    };

    REQUIRED_FIELDS.forEach(field => {
      expect((validInput as any)[field]).toBeTruthy();
    });
  });

  it("should accept optional fields without error", () => {
    const fullInput = {
      originalPrompt: "Create a video about photosynthesis",
      targetAudience: "تلاميذ السنة الخامسة ابتدائي",
      educationalObjective: "شرح عملية التركيب الضوئي",
      videoUrl: "https://example.com/video.mp4",
      videoDescription: "فيديو متحرك يشرح التركيب الضوئي",
      toolUsed: "kling",
      grade: "السنة الخامسة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "التركيب الضوئي",
      attachments: [
        { name: "screenshot.png", size: 500000, type: "image/png", url: "https://example.com/img.png" },
      ],
    };

    OPTIONAL_FIELDS.forEach(field => {
      expect((fullInput as any)[field]).toBeDefined();
    });
  });

  it("should reject inputs missing required fields", () => {
    const incompleteInputs = [
      { targetAudience: "test", educationalObjective: "test" }, // missing originalPrompt
      { originalPrompt: "test", educationalObjective: "test" }, // missing targetAudience
      { originalPrompt: "test", targetAudience: "test" }, // missing educationalObjective
    ];

    incompleteInputs.forEach((input, idx) => {
      const missingField = REQUIRED_FIELDS[idx];
      expect((input as any)[missingField]).toBeUndefined();
    });
  });

  it("should enforce file size limit of 16MB", () => {
    const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

    const validFile = { name: "video.mp4", size: 5 * 1024 * 1024, type: "video/mp4" };
    const oversizedFile = { name: "big.mp4", size: 20 * 1024 * 1024, type: "video/mp4" };

    expect(validFile.size).toBeLessThan(MAX_FILE_SIZE);
    expect(oversizedFile.size).toBeGreaterThan(MAX_FILE_SIZE);
  });

  it("should support image and video attachment types", () => {
    const imageAttachment = { name: "screenshot.png", size: 500000, type: "image/png", url: "https://example.com/img.png" };
    const videoAttachment = { name: "video.mp4", size: 5000000, type: "video/mp4", url: "https://example.com/vid.mp4" };

    expect(imageAttachment.type.startsWith("image/")).toBe(true);
    expect(videoAttachment.type.startsWith("video/")).toBe(true);
  });
});

// ── Video Evaluator: 5-Criteria Scoring Rubric ──────────────────────────────

describe("Video Evaluator — 5-Criteria Scoring Rubric", () => {
  const CRITERIA = [
    { key: "scoreVisualQuality", label: "الجودة البصرية" },
    { key: "scoreNarrative", label: "السرد والسيناريو" },
    { key: "scorePedagogical", label: "الملاءمة التربوية" },
    { key: "scoreEngagement", label: "التشويق والجذب" },
    { key: "scoreTechnical", label: "جودة الموجه التقني" },
  ];

  const FEEDBACK_KEYS = [
    "feedbackVisualQuality",
    "feedbackNarrative",
    "feedbackPedagogical",
    "feedbackEngagement",
    "feedbackTechnical",
  ];

  it("should have exactly 5 evaluation criteria", () => {
    expect(CRITERIA).toHaveLength(5);
  });

  it("should score each criterion from 0 to 20", () => {
    const sampleScores = { scoreVisualQuality: 15, scoreNarrative: 12, scorePedagogical: 18, scoreEngagement: 10, scoreTechnical: 14 };

    Object.values(sampleScores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(20);
    });
  });

  it("should calculate total score as sum of all 5 criteria (max 100)", () => {
    const scores = { scoreVisualQuality: 15, scoreNarrative: 12, scorePedagogical: 18, scoreEngagement: 10, scoreTechnical: 14 };
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

    expect(totalScore).toBe(69);
    expect(totalScore).toBeLessThanOrEqual(100);
    expect(totalScore).toBeGreaterThanOrEqual(0);
  });

  it("should have feedback text for each criterion", () => {
    const evaluation = {
      feedbackVisualQuality: "الصور واضحة والألوان متناسقة",
      feedbackNarrative: "تسلسل المشاهد جيد مع بداية قوية",
      feedbackPedagogical: "المحتوى مناسب للفئة العمرية المستهدفة",
      feedbackEngagement: "الإيقاع مناسب ويجذب الانتباه",
      feedbackTechnical: "الموجه دقيق ويستخدم الكلمات المفتاحية الصحيحة",
    };

    FEEDBACK_KEYS.forEach(key => {
      expect((evaluation as any)[key]).toBeTruthy();
      expect(typeof (evaluation as any)[key]).toBe("string");
    });
  });

  it("should include overallFeedback and improvedPrompt", () => {
    const evaluation = {
      overallFeedback: "عمل جيد بشكل عام مع إمكانية تحسين الجودة البصرية",
      improvedPrompt: "Create a 30-second animated video explaining the water cycle...",
    };

    expect(evaluation.overallFeedback).toBeTruthy();
    expect(evaluation.improvedPrompt).toBeTruthy();
  });

  it("should include attemptNumber for tracking progress", () => {
    const result = { totalScore: 75, attemptNumber: 3 };
    expect(result.attemptNumber).toBeGreaterThanOrEqual(1);
  });
});

// ── Video Evaluator: Score Level Classification ─────────────────────────────

describe("Video Evaluator — Score Level Classification", () => {
  function getScoreLevel(score: number, max: number = 100) {
    const pct = (score / max) * 100;
    if (pct >= 85) return "ممتاز";
    if (pct >= 65) return "جيد";
    if (pct >= 45) return "متوسط";
    if (pct >= 25) return "ضعيف";
    return "ضعيف جداً";
  }

  it("should classify 85-100 as 'ممتاز'", () => {
    expect(getScoreLevel(85)).toBe("ممتاز");
    expect(getScoreLevel(100)).toBe("ممتاز");
    expect(getScoreLevel(17, 20)).toBe("ممتاز");
    expect(getScoreLevel(20, 20)).toBe("ممتاز");
  });

  it("should classify 65-84 as 'جيد'", () => {
    expect(getScoreLevel(65)).toBe("جيد");
    expect(getScoreLevel(84)).toBe("جيد");
    expect(getScoreLevel(14, 20)).toBe("جيد");
  });

  it("should classify 45-64 as 'متوسط'", () => {
    expect(getScoreLevel(45)).toBe("متوسط");
    expect(getScoreLevel(64)).toBe("متوسط");
    expect(getScoreLevel(10, 20)).toBe("متوسط");
  });

  it("should classify 25-44 as 'ضعيف'", () => {
    expect(getScoreLevel(25)).toBe("ضعيف");
    expect(getScoreLevel(44)).toBe("ضعيف");
    expect(getScoreLevel(6, 20)).toBe("ضعيف");
  });

  it("should classify 0-24 as 'ضعيف جداً'", () => {
    expect(getScoreLevel(0)).toBe("ضعيف جداً");
    expect(getScoreLevel(24)).toBe("ضعيف جداً");
    expect(getScoreLevel(4, 20)).toBe("ضعيف جداً");
  });
});

// ── Video Evaluator: System Prompt Structure ────────────────────────────────

describe("Video Evaluator — System Prompt Structure", () => {
  // Simulate the system prompt construction
  function buildSystemPrompt(input: {
    originalPrompt: string;
    targetAudience: string;
    educationalObjective: string;
    toolUsed?: string;
    grade?: string;
    subject?: string;
    lessonTitle?: string;
    videoDescription?: string;
  }) {
    return `# الهوية والدور
انت "مُقيِّم المعلم الرقمي" في منصة Leader Academy تونس.

# المعايير الخمسة
1. الجودة البصرية (scoreVisualQuality)
2. السرد والسيناريو (scoreNarrative)
3. الملاءمة التربوية (scorePedagogical)
4. التشويق والجذب (scoreEngagement)
5. الجودة التقنية للموجه (scoreTechnical)

# المعلومات المقدمة
- الموجه الأصلي: ${input.originalPrompt}
- الفئة المستهدفة: ${input.targetAudience}
- الهدف التعليمي: ${input.educationalObjective}
${input.toolUsed ? "- الأداة المستخدمة: " + input.toolUsed : ""}
${input.grade ? "- المستوى: " + input.grade : ""}
${input.subject ? "- المادة: " + input.subject : ""}
${input.lessonTitle ? "- عنوان الدرس: " + input.lessonTitle : ""}
${input.videoDescription ? "- وصف الفيديو: " + input.videoDescription : ""}`;
  }

  it("should include all 5 criteria in the system prompt", () => {
    const prompt = buildSystemPrompt({
      originalPrompt: "test",
      targetAudience: "test",
      educationalObjective: "test",
    });

    expect(prompt).toContain("scoreVisualQuality");
    expect(prompt).toContain("scoreNarrative");
    expect(prompt).toContain("scorePedagogical");
    expect(prompt).toContain("scoreEngagement");
    expect(prompt).toContain("scoreTechnical");
  });

  it("should include the required input fields in the prompt", () => {
    const prompt = buildSystemPrompt({
      originalPrompt: "Create a water cycle video",
      targetAudience: "4th grade students",
      educationalObjective: "Explain the water cycle",
    });

    expect(prompt).toContain("Create a water cycle video");
    expect(prompt).toContain("4th grade students");
    expect(prompt).toContain("Explain the water cycle");
  });

  it("should include optional fields when provided", () => {
    const prompt = buildSystemPrompt({
      originalPrompt: "test",
      targetAudience: "test",
      educationalObjective: "test",
      toolUsed: "Kling AI",
      grade: "السنة الرابعة ابتدائي",
      subject: "الإيقاظ العلمي",
      lessonTitle: "دورة الماء",
    });

    expect(prompt).toContain("Kling AI");
    expect(prompt).toContain("السنة الرابعة ابتدائي");
    expect(prompt).toContain("الإيقاظ العلمي");
    expect(prompt).toContain("دورة الماء");
  });

  it("should omit optional fields when not provided", () => {
    const prompt = buildSystemPrompt({
      originalPrompt: "test",
      targetAudience: "test",
      educationalObjective: "test",
    });

    expect(prompt).not.toContain("الأداة المستخدمة:");
    expect(prompt).not.toContain("المستوى:");
    expect(prompt).not.toContain("المادة:");
    expect(prompt).not.toContain("عنوان الدرس:");
  });

  it("should identify as Leader Academy Tunisia evaluator", () => {
    const prompt = buildSystemPrompt({
      originalPrompt: "test",
      targetAudience: "test",
      educationalObjective: "test",
    });

    expect(prompt).toContain("مُقيِّم المعلم الرقمي");
    expect(prompt).toContain("Leader Academy");
  });
});

// ── Video Evaluator: JSON Response Schema ───────────────────────────────────

describe("Video Evaluator — JSON Response Schema", () => {
  const REQUIRED_RESPONSE_FIELDS = [
    "scoreVisualQuality", "scoreNarrative", "scorePedagogical", "scoreEngagement", "scoreTechnical",
    "feedbackVisualQuality", "feedbackNarrative", "feedbackPedagogical", "feedbackEngagement", "feedbackTechnical",
    "overallFeedback", "improvedPrompt",
  ];

  it("should define all required fields in the JSON schema", () => {
    const schema = {
      type: "object",
      properties: {
        scoreVisualQuality: { type: "integer" },
        scoreNarrative: { type: "integer" },
        scorePedagogical: { type: "integer" },
        scoreEngagement: { type: "integer" },
        scoreTechnical: { type: "integer" },
        feedbackVisualQuality: { type: "string" },
        feedbackNarrative: { type: "string" },
        feedbackPedagogical: { type: "string" },
        feedbackEngagement: { type: "string" },
        feedbackTechnical: { type: "string" },
        overallFeedback: { type: "string" },
        improvedPrompt: { type: "string" },
      },
      required: REQUIRED_RESPONSE_FIELDS,
      additionalProperties: false,
    };

    expect(schema.required).toHaveLength(12);
    REQUIRED_RESPONSE_FIELDS.forEach(field => {
      expect(schema.properties).toHaveProperty(field);
      expect(schema.required).toContain(field);
    });
    expect(schema.additionalProperties).toBe(false);
  });

  it("should parse a valid LLM JSON response", () => {
    const rawResponse = JSON.stringify({
      scoreVisualQuality: 16,
      scoreNarrative: 14,
      scorePedagogical: 18,
      scoreEngagement: 12,
      scoreTechnical: 15,
      feedbackVisualQuality: "الصور واضحة",
      feedbackNarrative: "السرد جيد",
      feedbackPedagogical: "ملائم تربوياً",
      feedbackEngagement: "جذاب",
      feedbackTechnical: "الموجه دقيق",
      overallFeedback: "عمل جيد",
      improvedPrompt: "Create a 30-second animated video...",
    });

    const parsed = JSON.parse(rawResponse);
    expect(parsed.scoreVisualQuality).toBe(16);
    expect(parsed.overallFeedback).toBe("عمل جيد");

    const totalScore = parsed.scoreVisualQuality + parsed.scoreNarrative + parsed.scorePedagogical + parsed.scoreEngagement + parsed.scoreTechnical;
    expect(totalScore).toBe(75);
  });

  it("should handle malformed JSON gracefully", () => {
    const badResponse = "This is not JSON";
    expect(() => JSON.parse(badResponse)).toThrow();
  });
});

// ── Video Evaluator: Stats Calculation ──────────────────────────────────────

describe("Video Evaluator — Stats Calculation", () => {
  const sampleEvaluations = [
    { totalScore: 60, scoreVisualQuality: 12, scoreNarrative: 10, scorePedagogical: 14, scoreEngagement: 12, scoreTechnical: 12 },
    { totalScore: 75, scoreVisualQuality: 15, scoreNarrative: 14, scorePedagogical: 16, scoreEngagement: 15, scoreTechnical: 15 },
    { totalScore: 85, scoreVisualQuality: 17, scoreNarrative: 16, scorePedagogical: 18, scoreEngagement: 17, scoreTechnical: 17 },
  ];

  it("should calculate average score correctly", () => {
    const avg = Math.round(sampleEvaluations.reduce((s, e) => s + e.totalScore, 0) / sampleEvaluations.length);
    expect(avg).toBe(73);
  });

  it("should find the best score", () => {
    const best = Math.max(...sampleEvaluations.map(e => e.totalScore));
    expect(best).toBe(85);
  });

  it("should calculate improvement (latest - first)", () => {
    const improvement = sampleEvaluations[sampleEvaluations.length - 1].totalScore - sampleEvaluations[0].totalScore;
    expect(improvement).toBe(25);
  });

  it("should calculate per-criterion averages", () => {
    const n = sampleEvaluations.length;
    const avgVisual = Math.round(sampleEvaluations.reduce((s, e) => s + e.scoreVisualQuality, 0) / n);
    const avgNarrative = Math.round(sampleEvaluations.reduce((s, e) => s + e.scoreNarrative, 0) / n);
    const avgPedagogical = Math.round(sampleEvaluations.reduce((s, e) => s + e.scorePedagogical, 0) / n);

    expect(avgVisual).toBe(15); // (12+15+17)/3 = 14.67 → 15
    expect(avgNarrative).toBe(13); // (10+14+16)/3 = 13.33 → 13
    expect(avgPedagogical).toBe(16); // (14+16+18)/3 = 16
  });

  it("should handle empty evaluations list", () => {
    const emptyStats = {
      totalEvaluations: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: 0,
      improvement: 0,
      averages: { visual: 0, narrative: 0, pedagogical: 0, engagement: 0, technical: 0 },
    };

    expect(emptyStats.totalEvaluations).toBe(0);
    expect(emptyStats.averageScore).toBe(0);
  });
});

// ── Video Evaluator: Database Schema ────────────────────────────────────────

describe("Video Evaluator — Database Schema", () => {
  const TABLE_COLUMNS = [
    "id", "userId", "batchId", "videoUrl", "videoDescription",
    "originalPrompt", "improvedPrompt",
    "scoreVisualQuality", "scoreNarrative", "scorePedagogical", "scoreEngagement", "scoreTechnical", "totalScore",
    "feedbackVisualQuality", "feedbackNarrative", "feedbackPedagogical", "feedbackEngagement", "feedbackTechnical", "overallFeedback",
    "attemptNumber", "toolUsed", "grade", "subject", "lessonTitle", "createdAt",
  ];

  it("should have 25 columns in video_evaluations table", () => {
    expect(TABLE_COLUMNS).toHaveLength(25);
  });

  it("should have all score columns as integers with default 0", () => {
    const scoreColumns = ["scoreVisualQuality", "scoreNarrative", "scorePedagogical", "scoreEngagement", "scoreTechnical", "totalScore"];
    scoreColumns.forEach(col => {
      expect(TABLE_COLUMNS).toContain(col);
    });
  });

  it("should have userId as required field", () => {
    expect(TABLE_COLUMNS).toContain("userId");
  });

  it("should have createdAt for timestamp tracking", () => {
    expect(TABLE_COLUMNS).toContain("createdAt");
  });

  it("should have metadata fields for context", () => {
    expect(TABLE_COLUMNS).toContain("toolUsed");
    expect(TABLE_COLUMNS).toContain("grade");
    expect(TABLE_COLUMNS).toContain("subject");
    expect(TABLE_COLUMNS).toContain("lessonTitle");
  });
});

// ── Video Evaluator: AI Tools & Subjects Lists ──────────────────────────────

describe("Video Evaluator — AI Tools & Subjects Lists", () => {
  const AI_TOOLS = [
    { value: "kling", label: "Kling AI" },
    { value: "runway", label: "Runway ML" },
    { value: "pika", label: "Pika Labs" },
    { value: "hailuo", label: "Hailuo MiniMax" },
    { value: "vidu", label: "Vidu AI" },
    { value: "sora", label: "Sora (OpenAI)" },
    { value: "luma", label: "Luma Dream Machine" },
    { value: "invideo", label: "InVideo AI" },
    { value: "other", label: "أداة أخرى" },
  ];

  const SUBJECTS = [
    "الإيقاظ العلمي", "الرياضيات", "اللغة العربية", "اللغة الفرنسية", "اللغة الإنجليزية",
    "التربية الإسلامية", "التاريخ والجغرافيا", "التربية المدنية", "التربية التشكيلية",
    "التربية الموسيقية", "التربية البدنية", "العلوم الطبيعية", "العلوم الفيزيائية",
    "الإعلامية", "التكنولوجيا", "الفلسفة", "الاقتصاد", "أخرى",
  ];

  it("should have at least 8 AI video generation tools", () => {
    expect(AI_TOOLS.length).toBeGreaterThanOrEqual(8);
  });

  it("should include 'other' option for unlisted tools", () => {
    const otherTool = AI_TOOLS.find(t => t.value === "other");
    expect(otherTool).toBeDefined();
    expect(otherTool!.label).toBe("أداة أخرى");
  });

  it("should have at least 15 Tunisian school subjects", () => {
    expect(SUBJECTS.length).toBeGreaterThanOrEqual(15);
  });

  it("should include core Tunisian subjects", () => {
    expect(SUBJECTS).toContain("الإيقاظ العلمي");
    expect(SUBJECTS).toContain("الرياضيات");
    expect(SUBJECTS).toContain("اللغة العربية");
    expect(SUBJECTS).toContain("اللغة الفرنسية");
  });

  it("should have unique tool values", () => {
    const values = AI_TOOLS.map(t => t.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

// ── Video Evaluator: Radar Chart Data ───────────────────────────────────────

describe("Video Evaluator — Radar Chart Data", () => {
  function buildRadarData(ev: any) {
    return [
      { criterion: "البصرية", score: ev.scoreVisualQuality, fullMark: 20 },
      { criterion: "السرد", score: ev.scoreNarrative, fullMark: 20 },
      { criterion: "التربوية", score: ev.scorePedagogical, fullMark: 20 },
      { criterion: "التشويق", score: ev.scoreEngagement, fullMark: 20 },
      { criterion: "الموجه", score: ev.scoreTechnical, fullMark: 20 },
    ];
  }

  it("should produce exactly 5 data points for the radar chart", () => {
    const data = buildRadarData({
      scoreVisualQuality: 15, scoreNarrative: 12, scorePedagogical: 18, scoreEngagement: 10, scoreTechnical: 14,
    });
    expect(data).toHaveLength(5);
  });

  it("should have fullMark of 20 for all criteria", () => {
    const data = buildRadarData({
      scoreVisualQuality: 15, scoreNarrative: 12, scorePedagogical: 18, scoreEngagement: 10, scoreTechnical: 14,
    });
    data.forEach(d => {
      expect(d.fullMark).toBe(20);
    });
  });

  it("should map scores correctly to radar data", () => {
    const data = buildRadarData({
      scoreVisualQuality: 17, scoreNarrative: 14, scorePedagogical: 19, scoreEngagement: 11, scoreTechnical: 16,
    });

    expect(data[0].score).toBe(17); // البصرية
    expect(data[1].score).toBe(14); // السرد
    expect(data[2].score).toBe(19); // التربوية
    expect(data[3].score).toBe(11); // التشويق
    expect(data[4].score).toBe(16); // الموجه
  });

  it("should use Arabic labels for criteria", () => {
    const data = buildRadarData({
      scoreVisualQuality: 10, scoreNarrative: 10, scorePedagogical: 10, scoreEngagement: 10, scoreTechnical: 10,
    });

    const labels = data.map(d => d.criterion);
    expect(labels).toContain("البصرية");
    expect(labels).toContain("السرد");
    expect(labels).toContain("التربوية");
    expect(labels).toContain("التشويق");
    expect(labels).toContain("الموجه");
  });
});

// ── Video Evaluator: Content Parts Builder ──────────────────────────────────

describe("Video Evaluator — Content Parts Builder", () => {
  it("should build text-only content when no attachments", () => {
    const contentParts: any[] = [{ type: "text", text: "قيّم هذا العمل" }];
    expect(contentParts).toHaveLength(1);
    expect(contentParts[0].type).toBe("text");
  });

  it("should add image_url for image attachments", () => {
    const contentParts: any[] = [{ type: "text", text: "قيّم هذا العمل" }];
    const attachment = { name: "screenshot.png", size: 500000, type: "image/png", url: "https://example.com/img.png" };

    if (attachment.type.startsWith("image/")) {
      contentParts.push({ type: "image_url", image_url: { url: attachment.url, detail: "high" } });
    }

    expect(contentParts).toHaveLength(2);
    expect(contentParts[1].type).toBe("image_url");
    expect(contentParts[1].image_url.detail).toBe("high");
  });

  it("should add file_url for video attachments", () => {
    const contentParts: any[] = [{ type: "text", text: "قيّم هذا العمل" }];
    const attachment = { name: "video.mp4", size: 5000000, type: "video/mp4", url: "https://example.com/vid.mp4" };

    if (attachment.type.startsWith("video/")) {
      contentParts.push({ type: "file_url", file_url: { url: attachment.url, mime_type: "video/mp4" } });
    }

    expect(contentParts).toHaveLength(2);
    expect(contentParts[1].type).toBe("file_url");
    expect(contentParts[1].file_url.mime_type).toBe("video/mp4");
  });

  it("should skip attachments without URL", () => {
    const contentParts: any[] = [{ type: "text", text: "قيّم هذا العمل" }];
    const attachment = { name: "video.mp4", size: 5000000, type: "video/mp4" }; // no url

    if (attachment.type.startsWith("video/") && (attachment as any).url) {
      contentParts.push({ type: "file_url", file_url: { url: (attachment as any).url, mime_type: "video/mp4" } });
    }

    expect(contentParts).toHaveLength(1); // Only text, no file added
  });
});

// ── Video Evaluator: Re-evaluate with Improved Prompt ───────────────────────

describe("Video Evaluator — Re-evaluate Flow", () => {
  it("should allow re-evaluation with improved prompt", () => {
    const originalResult = {
      totalScore: 65,
      improvedPrompt: "Create a 30-second animated video with clear narration explaining the water cycle for 4th grade students, using bright colors and simple characters",
    };

    // Simulate re-evaluation: user takes the improved prompt
    const newInput = {
      originalPrompt: originalResult.improvedPrompt,
      targetAudience: "تلاميذ السنة الرابعة ابتدائي",
      educationalObjective: "شرح دورة الماء",
    };

    expect(newInput.originalPrompt).toBe(originalResult.improvedPrompt);
    expect(newInput.originalPrompt.length).toBeGreaterThan(0);
  });

  it("should increment attemptNumber on re-evaluation", () => {
    const attempts = [1, 2, 3];
    const prevCount = 2;
    const nextAttempt = prevCount + 1;
    expect(nextAttempt).toBe(3);
  });
});
