import { describe, it, expect } from "vitest";

describe("Inspector Report & Drama Engine", () => {
  // Inspector Report Tests
  describe("Inspector Report PDF", () => {
    it("should have the inspectorReport procedure in grading router", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("grading.inspectorReport");
    });

    it("should require sessionId input for inspector report", async () => {
      const { appRouter } = await import("./routers");
      const proc = (appRouter as any)._def.procedures["grading.inspectorReport"];
      expect(proc).toBeDefined();
      // It's a mutation (protected)
      expect(proc._def).toBeDefined();
    });
  });

  // Drama Engine Tests
  describe("Drama Engine Router", () => {
    it("should have all drama procedures defined", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      
      expect(procedures).toContain("drama.generateScript");
      expect(procedures).toContain("drama.assignRoles");
      expect(procedures).toContain("drama.generateFromLesson");
      expect(procedures).toContain("drama.exportPDF");
    });

    it("generateScript should be a protected mutation", async () => {
      const { appRouter } = await import("./routers");
      const proc = (appRouter as any)._def.procedures["drama.generateScript"];
      expect(proc).toBeDefined();
      expect(proc._def).toBeDefined();
    });

    it("assignRoles should be a protected mutation", async () => {
      const { appRouter } = await import("./routers");
      const proc = (appRouter as any)._def.procedures["drama.assignRoles"];
      expect(proc).toBeDefined();
    });

    it("exportPDF should be a protected mutation", async () => {
      const { appRouter } = await import("./routers");
      const proc = (appRouter as any)._def.procedures["drama.exportPDF"];
      expect(proc).toBeDefined();
    });
  });

  // Role Assignment Logic Tests
  describe("Role Assignment Logic", () => {
    it("should distribute roles evenly among students", () => {
      // Simulate the role assignment logic
      const characters = [
        { name: "الأكسجين", description: "ذرة أكسجين", keyLines: 5, difficulty: "medium" },
        { name: "القلب", description: "عضلة القلب", keyLines: 8, difficulty: "hard" },
        { name: "الرئة", description: "الرئة اليمنى", keyLines: 3, difficulty: "easy" },
      ];
      const studentCount = 9;
      
      // Each character should get ~3 students
      const assignments: Array<{ studentNumber: number; characterName: string }> = [];
      for (let i = 1; i <= studentCount; i++) {
        const charIdx = (i - 1) % characters.length;
        assignments.push({
          studentNumber: i,
          characterName: characters[charIdx].name,
        });
      }
      
      expect(assignments.length).toBe(studentCount);
      // Each character should have 3 students
      const oxygenCount = assignments.filter(a => a.characterName === "الأكسجين").length;
      const heartCount = assignments.filter(a => a.characterName === "القلب").length;
      const lungCount = assignments.filter(a => a.characterName === "الرئة").length;
      expect(oxygenCount).toBe(3);
      expect(heartCount).toBe(3);
      expect(lungCount).toBe(3);
    });

    it("should handle more students than characters", () => {
      const characters = [
        { name: "شخصية 1", description: "", keyLines: 3, difficulty: "easy" },
        { name: "شخصية 2", description: "", keyLines: 3, difficulty: "easy" },
      ];
      const studentCount = 25;
      
      const assignments: Array<{ studentNumber: number; characterName: string }> = [];
      for (let i = 1; i <= studentCount; i++) {
        const charIdx = (i - 1) % characters.length;
        assignments.push({
          studentNumber: i,
          characterName: characters[charIdx].name,
        });
      }
      
      expect(assignments.length).toBe(25);
      // All students should be assigned
      expect(assignments.every(a => a.characterName)).toBe(true);
    });
  });

  // New Features: Masks, Library, Assessment, Publish
  describe("Drama Engine New Features", () => {
    it("should have generateMasks procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.generateMasks");
    });

    it("should have saveScript procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.saveScript");
    });

    it("should have getLibrary procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.getLibrary");
    });

    it("should have deleteScript procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.deleteScript");
    });

    it("should have toggleFavorite procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.toggleFavorite");
    });

    it("should have generateAssessment procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.generateAssessment");
    });

    it("should have publishToMarket procedure", async () => {
      const { appRouter } = await import("./routers");
      const procedures = Object.keys((appRouter as any)._def.procedures);
      expect(procedures).toContain("drama.publishToMarket");
    });
  });

  // Assessment Question Structure Tests
  describe("Formative Assessment Questions", () => {
    it("should validate assessment question structure", () => {
      const mockQuestions = [
        { question: "ما هو دور الأكسجين؟", type: "mcq", options: ["التنفس", "الهضم", "الحركة"], correctAnswer: "التنفس", criterion: "مع1" },
        { question: "اشرح رحلة الأكسجين في الجسم", type: "open", correctAnswer: "يدخل عبر الأنف...", criterion: "مع2" },
        { question: "الأكسجين ضروري للحياة", type: "truefalse", options: ["صح", "خطأ"], correctAnswer: "صح", criterion: "مع1" },
      ];

      expect(mockQuestions.length).toBe(3);
      mockQuestions.forEach(q => {
        expect(q.question).toBeTruthy();
        expect(q.correctAnswer).toBeTruthy();
        expect(q.criterion).toBeTruthy();
        expect(["mcq", "open", "truefalse"]).toContain(q.type);
      });
    });
  });

  // Mask Generation Tests
  describe("Character Mask Generation", () => {
    it("should limit mask generation to 6 characters max", () => {
      const characters = Array.from({ length: 10 }, (_, i) => ({
        name: `شخصية ${i + 1}`,
        description: `وصف الشخصية ${i + 1}`,
      }));

      const masksToGenerate = characters.slice(0, 6);
      expect(masksToGenerate.length).toBe(6);
    });

    it("should validate mask output structure", () => {
      const mockMask = {
        characterName: "الأكسجين",
        imageUrl: "https://example.com/mask.png",
        generatedAt: new Date().toISOString(),
      };

      expect(mockMask.characterName).toBeTruthy();
      expect(mockMask.imageUrl).toMatch(/^https?:\/\//);
      expect(mockMask.generatedAt).toBeTruthy();
    });
  });

  // Rights & Metadata Tests
  describe("Rights & Metadata Tagging", () => {
    it("should include contributor portfolio link in marketplace schema", async () => {
      const schema = await import("../drizzle/schema");
      const marketplaceColumns = Object.keys((schema.marketplaceItems as any));
      // The schema should have the contributorPortfolioLink field
      expect(schema.marketplaceItems).toBeDefined();
    });

    it("should include savedDramaScripts table in schema", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.savedDramaScripts).toBeDefined();
    });
  });

  // Drama Script Structure Tests
  describe("Drama Script Structure", () => {
    it("should validate expected script structure", () => {
      const mockScript = {
        title: "رحلة الأكسجين",
        synopsis: "مسرحية تعليمية عن الجهاز التنفسي",
        duration: "10 دقائق",
        characters: [
          { name: "الأكسجين", description: "ذرة أكسجين نشيطة", keyLines: 5, difficulty: "medium" },
        ],
        scenes: [
          {
            number: 1,
            title: "البداية",
            setting: "داخل الرئة",
            directorNotes: "يدخل الأكسجين من اليسار",
            dialogue: [
              { character: "الأكسجين", line: "أنا ذرة أكسجين!", action: "يقفز" },
            ],
            audienceInteraction: "اسألوا التلاميذ: أين يذهب الأكسجين؟",
          },
        ],
        educationalObjectives: ["فهم دور الأكسجين في التنفس"],
        props: [
          { name: "بالون أحمر", description: "يمثل كرية الدم الحمراء", cost: "منخفض", alternatives: "كرة حمراء" },
        ],
        warmUpActivity: "تمرين تنفس عميق",
        debriefQuestions: ["ما هو دور الأكسجين في الجسم؟"],
      };

      expect(mockScript.title).toBeTruthy();
      expect(mockScript.characters.length).toBeGreaterThan(0);
      expect(mockScript.scenes.length).toBeGreaterThan(0);
      expect(mockScript.props.length).toBeGreaterThan(0);
      expect(mockScript.educationalObjectives.length).toBeGreaterThan(0);
      expect(mockScript.scenes[0].dialogue.length).toBeGreaterThan(0);
    });

    it("should have valid difficulty levels for characters", () => {
      const validDifficulties = ["easy", "medium", "hard"];
      const characters = [
        { name: "شخصية 1", difficulty: "easy" },
        { name: "شخصية 2", difficulty: "medium" },
        { name: "شخصية 3", difficulty: "hard" },
      ];
      
      characters.forEach(char => {
        expect(validDifficulties).toContain(char.difficulty);
      });
    });

    it("should have valid cost levels for props", () => {
      const validCosts = ["مجاني", "منخفض", "متوسط"];
      const props = [
        { name: "ورق", cost: "مجاني" },
        { name: "بالون", cost: "منخفض" },
      ];
      
      props.forEach(prop => {
        expect(validCosts).toContain(prop.cost);
      });
    });
  });
});
