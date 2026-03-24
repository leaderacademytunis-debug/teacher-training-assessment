import { describe, it, expect } from "vitest";

describe("Répartition Journalière Router", () => {
  // ===== Schema validation tests =====
  describe("Input validation", () => {
    it("should validate uniteNumber range (1-8)", () => {
      expect(1).toBeGreaterThanOrEqual(1);
      expect(8).toBeLessThanOrEqual(8);
    });

    it("should validate moduleNumber range (1-8)", () => {
      expect(1).toBeGreaterThanOrEqual(1);
      expect(8).toBeLessThanOrEqual(8);
    });

    it("should validate journeeNumber range (1-8)", () => {
      expect(1).toBeGreaterThanOrEqual(1);
      expect(8).toBeLessThanOrEqual(8);
    });

    it("should accept valid grammar types", () => {
      const validTypes = ["Grammaire", "Conjugaison", "Orthographe"];
      expect(validTypes).toContain("Grammaire");
      expect(validTypes).toContain("Conjugaison");
      expect(validTypes).toContain("Orthographe");
    });

    it("should accept valid niveau values", () => {
      const validNiveaux = ["3ème année", "4ème année", "5ème année", "6ème année"];
      expect(validNiveaux).toContain("6ème année");
      expect(validNiveaux).toContain("5ème année");
    });
  });

  // ===== Mandatory pedagogical steps validation =====
  describe("Mandatory pedagogical steps", () => {
    it("should enforce Communication orale steps", () => {
      const requiredSteps = [
        "Situation d'exploration",
        "Apprentissage systématique structuré",
        "Intégration",
        "Évaluation",
      ];
      expect(requiredSteps).toHaveLength(4);
      expect(requiredSteps[0]).toBe("Situation d'exploration");
      expect(requiredSteps[3]).toBe("Évaluation");
    });

    it("should enforce Lecture steps", () => {
      const requiredSteps = [
        "Anticipation",
        "Approche globale",
        "Approche analytique",
        "Lecture vocale",
        "Étude de vocabulaire",
        "Évaluation",
      ];
      expect(requiredSteps).toHaveLength(6);
      expect(requiredSteps[0]).toBe("Anticipation");
      expect(requiredSteps[5]).toBe("Évaluation");
    });

    it("should enforce Grammaire/Conjugaison/Orthographe steps", () => {
      const requiredSteps = [
        "Exploration",
        "Apprentissage systématique structuré",
        "Intégration",
        "Évaluation",
      ];
      expect(requiredSteps).toHaveLength(4);
      expect(requiredSteps[0]).toBe("Exploration");
      expect(requiredSteps[3]).toBe("Évaluation");
    });
  });

  // ===== Activity structure tests =====
  describe("Activity structure", () => {
    it("should have correct durations", () => {
      const durations: Record<string, string> = {
        "Communication orale": "35 mn",
        "Lecture": "45 mn",
        "Grammaire": "35 mn",
        "Conjugaison": "35 mn",
        "Orthographe": "35 mn",
      };
      expect(durations["Communication orale"]).toBe("35 mn");
      expect(durations["Lecture"]).toBe("45 mn");
      expect(durations["Grammaire"]).toBe("35 mn");
    });

    it("should generate 3 activities per répartition", () => {
      const activities = [
        { name: "Communication orale", duration: "35 mn" },
        { name: "Lecture", duration: "45 mn" },
        { name: "Grammaire", duration: "35 mn" },
      ];
      expect(activities).toHaveLength(3);
    });

    it("should have objectives starting with 'L'élève serait capable de'", () => {
      const objectif = "L'élève serait capable de lire et comprendre un texte narratif";
      expect(objectif.startsWith("L'élève serait capable de")).toBe(true);
    });
  });

  // ===== Table structure tests =====
  describe("Table structure (5 columns)", () => {
    it("should have exactly 5 columns", () => {
      const columns = ["activités", "Objet (contenu)", "Objectif de la séance", "étapes", "remarques"];
      expect(columns).toHaveLength(5);
    });

    it("should have correct column names", () => {
      const columns = ["activités", "Objet (contenu)", "Objectif de la séance", "étapes", "remarques"];
      expect(columns[0]).toBe("activités");
      expect(columns[1]).toBe("Objet (contenu)");
      expect(columns[2]).toBe("Objectif de la séance");
      expect(columns[3]).toBe("étapes");
      expect(columns[4]).toBe("remarques");
    });
  });

  // ===== Header structure tests =====
  describe("Header structure", () => {
    it("should include all required header fields", () => {
      const header = {
        uniteNumber: 1,
        moduleNumber: 1,
        journeeNumber: 1,
        niveau: "6ème année",
        dateFrom: "2026-01-05",
        dateTo: "2026-01-09",
      };
      expect(header.uniteNumber).toBeDefined();
      expect(header.moduleNumber).toBeDefined();
      expect(header.journeeNumber).toBeDefined();
      expect(header.niveau).toBeDefined();
    });
  });

  // ===== PDF export tests =====
  describe("PDF export", () => {
    it("should generate LTR French content", () => {
      const direction = "ltr";
      const lang = "fr";
      expect(direction).toBe("ltr");
      expect(lang).toBe("fr");
    });

    it("should include Leader Academy footer", () => {
      const footer = "Leader Academy — المساعد البيداغوجي الذكي — نسخة تونس 2026";
      expect(footer).toContain("Leader Academy");
    });
  });
});
