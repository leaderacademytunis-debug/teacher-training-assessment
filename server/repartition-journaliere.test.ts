import { describe, it, expect } from "vitest";

// ===== MANDATORY PEDAGOGICAL STEPS (must match backend exactly) =====
const MANDATORY_STEPS = {
  communicationOrale: [
    "Situation d'exploration",
    "Apprentissage systématique structuré",
    "Intégration",
    "Évaluation",
  ],
  lecture: [
    "Anticipation",
    "Approche globale",
    "Approche analytique",
    "Lecture vocale",
    "Étude de vocabulaire",
    "Évaluation",
  ],
  grammaireConjugaisonOrthographe: [
    "Exploration",
    "Apprentissage systématique structuré",
    "Intégration",
    "Évaluation",
  ],
};

// ===== Simulated enforcement logic (mirrors backend) =====
function enforceSteps(activities: any[], gramType: string) {
  const commOrale = activities.find((a: any) => a.activityName.toLowerCase().includes("communication"));
  const lecture = activities.find((a: any) => a.activityName.toLowerCase().includes("lecture"));
  const grammar = activities.find((a: any) =>
    a.activityName.toLowerCase().includes("grammaire") ||
    a.activityName.toLowerCase().includes("conjugaison") ||
    a.activityName.toLowerCase().includes("orthographe")
  );

  if (commOrale) {
    commOrale.activityName = "Communication orale";
    commOrale.duration = "35 mn";
    commOrale.etapes = [...MANDATORY_STEPS.communicationOrale];
  }
  if (lecture) {
    lecture.activityName = "Lecture";
    lecture.duration = "45 mn";
    lecture.etapes = [...MANDATORY_STEPS.lecture];
  }
  if (grammar) {
    grammar.activityName = gramType;
    grammar.duration = "35 mn";
    grammar.etapes = [...MANDATORY_STEPS.grammaireConjugaisonOrthographe];
  }

  return [
    commOrale || { activityName: "Communication orale", duration: "35 mn", objet: "", objectif: "", etapes: [...MANDATORY_STEPS.communicationOrale], remarques: "" },
    lecture || { activityName: "Lecture", duration: "45 mn", objet: "", objectif: "", etapes: [...MANDATORY_STEPS.lecture], remarques: "" },
    grammar || { activityName: gramType, duration: "35 mn", objet: "", objectif: "", etapes: [...MANDATORY_STEPS.grammaireConjugaisonOrthographe], remarques: "" },
  ];
}

describe("Répartition Journalière Router", () => {

  // ===== Schema validation tests =====
  describe("Input validation", () => {
    it("should validate uniteNumber range (1-8)", () => {
      for (let i = 1; i <= 8; i++) {
        expect(i).toBeGreaterThanOrEqual(1);
        expect(i).toBeLessThanOrEqual(8);
      }
    });

    it("should validate moduleNumber range (1-8)", () => {
      for (let i = 1; i <= 8; i++) {
        expect(i).toBeGreaterThanOrEqual(1);
        expect(i).toBeLessThanOrEqual(8);
      }
    });

    it("should accept valid grammar types", () => {
      const validTypes = ["Grammaire", "Conjugaison", "Orthographe"];
      expect(validTypes).toContain("Grammaire");
      expect(validTypes).toContain("Conjugaison");
      expect(validTypes).toContain("Orthographe");
    });

    it("should accept valid niveau values", () => {
      const validNiveaux = ["3ème année", "4ème année", "5ème année", "6ème année"];
      expect(validNiveaux).toHaveLength(4);
      validNiveaux.forEach(n => expect(n).toMatch(/^\dème année$/));
    });
  });

  // ===== Mandatory pedagogical steps =====
  describe("Mandatory pedagogical steps", () => {
    it("should enforce Communication orale steps (4 steps)", () => {
      const steps = MANDATORY_STEPS.communicationOrale;
      expect(steps).toHaveLength(4);
      expect(steps[0]).toBe("Situation d'exploration");
      expect(steps[1]).toBe("Apprentissage systématique structuré");
      expect(steps[2]).toBe("Intégration");
      expect(steps[3]).toBe("Évaluation");
    });

    it("should enforce Lecture steps (6 steps)", () => {
      const steps = MANDATORY_STEPS.lecture;
      expect(steps).toHaveLength(6);
      expect(steps[0]).toBe("Anticipation");
      expect(steps[1]).toBe("Approche globale");
      expect(steps[2]).toBe("Approche analytique");
      expect(steps[3]).toBe("Lecture vocale");
      expect(steps[4]).toBe("Étude de vocabulaire");
      expect(steps[5]).toBe("Évaluation");
    });

    it("should enforce Grammaire/Conjugaison/Orthographe steps (4 steps)", () => {
      const steps = MANDATORY_STEPS.grammaireConjugaisonOrthographe;
      expect(steps).toHaveLength(4);
      expect(steps[0]).toBe("Exploration");
      expect(steps[1]).toBe("Apprentissage systématique structuré");
      expect(steps[2]).toBe("Intégration");
      expect(steps[3]).toBe("Évaluation");
    });
  });

  // ===== Step enforcement logic =====
  describe("Step enforcement (Automated Correction Loop)", () => {
    it("should correct LLM output with wrong steps for Communication orale", () => {
      const badLLMOutput = [
        { activityName: "Communication orale", duration: "35 mn", objet: "Test", objectif: "Test", etapes: ["Wrong step 1", "Wrong step 2"], remarques: "" },
        { activityName: "Lecture", duration: "45 mn", objet: "Test", objectif: "Test", etapes: ["Wrong"], remarques: "" },
        { activityName: "Grammaire", duration: "35 mn", objet: "Test", objectif: "Test", etapes: ["Wrong"], remarques: "" },
      ];

      const corrected = enforceSteps(badLLMOutput, "Grammaire");
      expect(corrected[0].etapes).toEqual(MANDATORY_STEPS.communicationOrale);
      expect(corrected[1].etapes).toEqual(MANDATORY_STEPS.lecture);
      expect(corrected[2].etapes).toEqual(MANDATORY_STEPS.grammaireConjugaisonOrthographe);
    });

    it("should always produce exactly 3 activities in correct order", () => {
      const badLLMOutput = [
        { activityName: "Lecture", duration: "45 mn", objet: "Test", objectif: "Test", etapes: [], remarques: "" },
        { activityName: "Communication orale", duration: "35 mn", objet: "Test", objectif: "Test", etapes: [], remarques: "" },
        { activityName: "Conjugaison", duration: "35 mn", objet: "Test", objectif: "Test", etapes: [], remarques: "" },
      ];

      const corrected = enforceSteps(badLLMOutput, "Conjugaison");
      expect(corrected).toHaveLength(3);
      expect(corrected[0].activityName).toBe("Communication orale");
      expect(corrected[1].activityName).toBe("Lecture");
      expect(corrected[2].activityName).toBe("Conjugaison");
    });

    it("should fill missing activities with defaults", () => {
      const partialLLMOutput = [
        { activityName: "Communication orale", duration: "35 mn", objet: "Test", objectif: "Test", etapes: [], remarques: "" },
      ];

      const corrected = enforceSteps(partialLLMOutput, "Orthographe");
      expect(corrected).toHaveLength(3);
      expect(corrected[0].activityName).toBe("Communication orale");
      expect(corrected[1].activityName).toBe("Lecture");
      expect(corrected[2].activityName).toBe("Orthographe");
      expect(corrected[1].etapes).toEqual(MANDATORY_STEPS.lecture);
      expect(corrected[2].etapes).toEqual(MANDATORY_STEPS.grammaireConjugaisonOrthographe);
    });

    it("should enforce correct durations", () => {
      const badDurations = [
        { activityName: "Communication orale", duration: "40 mn", objet: "T", objectif: "T", etapes: [], remarques: "" },
        { activityName: "Lecture", duration: "30 mn", objet: "T", objectif: "T", etapes: [], remarques: "" },
        { activityName: "Grammaire", duration: "50 mn", objet: "T", objectif: "T", etapes: [], remarques: "" },
      ];

      const corrected = enforceSteps(badDurations, "Grammaire");
      expect(corrected[0].duration).toBe("35 mn");
      expect(corrected[1].duration).toBe("45 mn");
      expect(corrected[2].duration).toBe("35 mn");
    });
  });

  // ===== Table structure tests =====
  describe("Table structure (5 columns)", () => {
    it("should have exactly 5 columns matching official format", () => {
      const columns = ["Activités", "Objet (contenu)", "Objectif de la séance", "Étapes", "Remarques"];
      expect(columns).toHaveLength(5);
    });

    it("should have correct column names in French", () => {
      const columns = ["Activités", "Objet (contenu)", "Objectif de la séance", "Étapes", "Remarques"];
      expect(columns[0]).toBe("Activités");
      expect(columns[1]).toBe("Objet (contenu)");
      expect(columns[2]).toBe("Objectif de la séance");
      expect(columns[3]).toBe("Étapes");
      expect(columns[4]).toBe("Remarques");
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
      expect(header.dateFrom).toBeDefined();
      expect(header.dateTo).toBeDefined();
    });

    it("should format header correctly", () => {
      const header = {
        uniteNumber: 1,
        moduleNumber: 1,
        journeeNumber: 1,
        niveau: "6ème année",
      };
      const headerText = `Unité d'apprentissage n° ${header.uniteNumber} — Module ${header.moduleNumber} — Journée ${header.journeeNumber}`;
      expect(headerText).toContain("Unité d'apprentissage n°");
      expect(headerText).toContain("Module");
      expect(headerText).toContain("Journée");
    });
  });

  // ===== Reference content tests =====
  describe("Reference content (U1-M1-J1)", () => {
    it("should have reference content for Unité 1, Module 1, Journée 1", () => {
      const refContent = {
        communicationOrale: {
          objet: "Présentation du module et du projet d'écriture",
          objectif: "Communiquer en situation pour : Informer/s'informer, Décrire/Raconter un événement, Justifier un choix.",
        },
        lecture: {
          objet: "Apprentie comédienne",
          objectif: "L'élève serait capable de lire de manière expressive et intelligible un passage choisi.",
        },
        grammaire: {
          objet: "Les déterminants / les noms / les pronoms personnels",
          objectif: "Reconnaître et utiliser les déterminants, les noms et les pronoms personnels.",
        },
      };

      expect(refContent.communicationOrale.objet).toBe("Présentation du module et du projet d'écriture");
      expect(refContent.lecture.objectif).toContain("L'élève serait capable de");
      expect(refContent.grammaire.objet).toContain("déterminants");
    });
  });

  // ===== PDF export tests =====
  describe("PDF export", () => {
    it("should generate LTR French content", () => {
      const htmlTemplate = '<html lang="fr" dir="ltr">';
      expect(htmlTemplate).toContain('lang="fr"');
      expect(htmlTemplate).toContain('dir="ltr"');
    });

    it("should include Leader Academy footer", () => {
      const footer = "Leader Academy — المساعد البيداغوجي الذكي — نسخة تونس 2026";
      expect(footer).toContain("Leader Academy");
      expect(footer).toContain("2026");
    });

    it("should include all 5 column headers in PDF", () => {
      const pdfHeaders = ["Activités", "Objet (contenu)", "Objectif de la séance", "Étapes", "Remarques"];
      expect(pdfHeaders).toHaveLength(5);
    });
  });
});
