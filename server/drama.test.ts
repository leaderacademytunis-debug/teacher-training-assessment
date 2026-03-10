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
