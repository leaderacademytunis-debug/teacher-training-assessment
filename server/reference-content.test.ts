import { describe, it, expect } from "vitest";

// ===== Reference Content Router Tests (Smart Autofill System) =====
// Tests for the new flexible JSON-based reference content schema

// Type matching the new schema
interface RefActivity {
  activityName: string;
  objet: string;
  objectifSpecifique?: string;
  objectif: string;
  etapes: string[];
  remarques?: string;
  duration?: string;
}

interface RefRecord {
  niveau: string;
  uniteNumber: number;
  moduleNumber: number;
  journeeNumber: number;
  sousTheme?: string | null;
  activities: RefActivity[];
}

// ===== Sample seed data for testing =====
const SEED_6EME_J1: RefRecord = {
  niveau: "6ème année",
  uniteNumber: 1,
  moduleNumber: 1,
  journeeNumber: 1,
  activities: [
    {
      activityName: "Communication orale",
      duration: "35 mn",
      objet: "Présenter / Se présenter",
      objectif: "Communiquer en situation pour : se présenter et présenter quelqu'un",
      etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
      remarques: ""
    },
    {
      activityName: "Lecture",
      duration: "45 mn",
      objet: "Texte : « Le jour de la rentrée »",
      objectif: "L'élève serait capable de lire le texte et de répondre à des questions de compréhension",
      etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"],
      remarques: ""
    },
    {
      activityName: "Grammaire",
      duration: "35 mn",
      objet: "La phrase – Les types de phrases",
      objectif: "L'élève serait capable de reconnaître les types de phrases et de les transformer",
      etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
      remarques: ""
    }
  ]
};

const SEED_4EME_J1: RefRecord = {
  niveau: "4ème année",
  uniteNumber: 1,
  moduleNumber: 1,
  journeeNumber: 1,
  sousTheme: "Vive l'école",
  activities: [
    {
      activityName: "Mise en train",
      objet: "Chant : « Bonjour, bonjour »",
      objectifSpecifique: "Assurer la compréhension du chant",
      objectif: "L'élève serait capable de chanter correctement le chant",
      etapes: ["Rappel", "Diction", "Évaluation"]
    },
    {
      activityName: "Présentation du projet et du module",
      objet: "Informer / s'informer – Présenter",
      objectifSpecifique: "Informer / s'informer – Présenter",
      objectif: "L'élève serait capable de repérer des indices à travers la fiche contrat",
      etapes: ["Exploration / anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"]
    },
    {
      activityName: "Étude de graphies",
      objet: "La graphie s = z",
      objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes",
      objectif: "L'élève serait capable de compléter les mots donnés par la graphie qui convient",
      etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"]
    },
    {
      activityName: "P.E.L (Pratique Écrite de la Langue)",
      objet: "La phrase",
      objectifSpecifique: "Identifier la phrase et ses constituants",
      objectif: "L'élève serait capable de mettre en ordre des mots pour former une phrase correcte",
      etapes: ["Manipulation-exploration", "Manipulation-fixation"]
    }
  ]
};

const SEED_4EME_J4: RefRecord = {
  niveau: "4ème année",
  uniteNumber: 1,
  moduleNumber: 1,
  journeeNumber: 4,
  sousTheme: "Vive l'école",
  activities: [
    {
      activityName: "Activité d'écoute",
      objet: "Conte en séquence au choix",
      objectifSpecifique: "Assurer un bain de langue",
      objectif: "L'élève serait capable de produire des hypothèses",
      etapes: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"]
    },
    {
      activityName: "Lecture Fonctionnement",
      objet: "Texte : « La nouvelle élève »",
      objectifSpecifique: "Identifier les personnages et les actions",
      objectif: "L'élève serait capable de repérer les personnages du texte",
      etapes: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"]
    },
    {
      activityName: "Écriture",
      objet: "La lettre majuscule : M",
      objectifSpecifique: "Écrire correctement les graphies au programme",
      objectif: "L'élève serait capable d'écrire correctement la lettre majuscule M",
      etapes: ["Présentation", "Entraînement", "Écriture"]
    },
    {
      activityName: "Auto dictée",
      objet: "« Amélie est en classe. Elle dessine des cerises et des fraises »",
      objectifSpecifique: "Orthographier correctement les mots d'usage",
      objectif: "L'élève serait capable de reproduire de mémoire le paragraphe",
      etapes: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"]
    },
    {
      activityName: "Projet (Entraînement)",
      objet: "Exploitation du texte « L'invitation »",
      objectifSpecifique: "Se repérer dans le récit",
      objectif: "L'élève serait capable de repérer les trois parties du récit",
      etapes: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"]
    }
  ]
};

describe("Reference Content - New JSON Schema", () => {

  describe("schema structure validation", () => {
    it("should have required composite key fields", () => {
      const requiredFields = ["niveau", "uniteNumber", "moduleNumber", "journeeNumber", "activities"];
      requiredFields.forEach(f => {
        expect(f in SEED_6EME_J1).toBe(true);
      });
    });

    it("should validate unit number range (1-8)", () => {
      [1, 2, 3, 4, 5, 6, 7, 8].forEach(u => expect(u >= 1 && u <= 8).toBe(true));
      [0, 9, -1].forEach(u => expect(u >= 1 && u <= 8).toBe(false));
    });

    it("should validate module number range (1-8)", () => {
      [1, 2, 3, 4, 5, 6, 7, 8].forEach(m => expect(m >= 1 && m <= 8).toBe(true));
    });

    it("should validate journee number range (1-5)", () => {
      [1, 2, 3, 4, 5].forEach(j => expect(j >= 1 && j <= 5).toBe(true));
    });
  });

  describe("6ème année seed data", () => {
    it("should have 3 activities for J1", () => {
      expect(SEED_6EME_J1.activities).toHaveLength(3);
    });

    it("should have duration on 6ème activities", () => {
      expect(SEED_6EME_J1.activities[0].duration).toBe("35 mn");
      expect(SEED_6EME_J1.activities[1].duration).toBe("45 mn");
    });

    it("should have remarques field on 6ème activities", () => {
      SEED_6EME_J1.activities.forEach(a => {
        expect("remarques" in a).toBe(true);
      });
    });

    it("should NOT have sousTheme for 6ème", () => {
      expect(SEED_6EME_J1.sousTheme).toBeUndefined();
    });

    it("should NOT have objectifSpecifique for 6ème", () => {
      SEED_6EME_J1.activities.forEach(a => {
        expect(a.objectifSpecifique).toBeUndefined();
      });
    });

    it("should have correct activity sequence: Communication orale, Lecture, Grammaire", () => {
      expect(SEED_6EME_J1.activities.map(a => a.activityName)).toEqual([
        "Communication orale", "Lecture", "Grammaire"
      ]);
    });

    it("should have etapes for each activity", () => {
      SEED_6EME_J1.activities.forEach(a => {
        expect(a.etapes.length).toBeGreaterThan(0);
      });
    });

    it("should have French pedagogical objectives", () => {
      expect(SEED_6EME_J1.activities[0].objectif).toContain("Communiquer en situation");
      expect(SEED_6EME_J1.activities[1].objectif).toContain("L'élève serait capable de");
    });
  });

  describe("4ème année seed data - J1", () => {
    it("should have 4 activities for J1", () => {
      expect(SEED_4EME_J1.activities).toHaveLength(4);
    });

    it("should have sousTheme for 4ème", () => {
      expect(SEED_4EME_J1.sousTheme).toBe("Vive l'école");
    });

    it("should have objectifSpecifique for each activity", () => {
      SEED_4EME_J1.activities.forEach(a => {
        expect(a.objectifSpecifique).toBeTruthy();
      });
    });

    it("should NOT have duration for 4ème activities", () => {
      SEED_4EME_J1.activities.forEach(a => {
        expect(a.duration).toBeUndefined();
      });
    });

    it("should NOT have remarques for 4ème activities", () => {
      SEED_4EME_J1.activities.forEach(a => {
        expect(a.remarques).toBeUndefined();
      });
    });

    it("should have correct J1 activity sequence", () => {
      expect(SEED_4EME_J1.activities.map(a => a.activityName)).toEqual([
        "Mise en train", "Présentation du projet et du module", "Étude de graphies", "P.E.L (Pratique Écrite de la Langue)"
      ]);
    });
  });

  describe("4ème année seed data - J4 (5 activities)", () => {
    it("should have 5 activities for J4", () => {
      expect(SEED_4EME_J4.activities).toHaveLength(5);
    });

    it("should have correct J4 activity sequence", () => {
      expect(SEED_4EME_J4.activities.map(a => a.activityName)).toEqual([
        "Activité d'écoute", "Lecture Fonctionnement", "Écriture", "Auto dictée", "Projet (Entraînement)"
      ]);
    });

    it("Auto dictée should have 4 etapes", () => {
      const autoDictee = SEED_4EME_J4.activities.find(a => a.activityName === "Auto dictée");
      expect(autoDictee?.etapes).toHaveLength(4);
      expect(autoDictee?.etapes).toContain("Diction");
      expect(autoDictee?.etapes).toContain("Reproduction de mémoire");
    });
  });

  describe("autofill lookup logic", () => {
    const allRecords: RefRecord[] = [SEED_6EME_J1, SEED_4EME_J1, SEED_4EME_J4];

    function lookupReference(niveau: string, unite: number, module: number, journee: number): RefRecord | null {
      return allRecords.find(r =>
        r.niveau === niveau &&
        r.uniteNumber === unite &&
        r.moduleNumber === module &&
        r.journeeNumber === journee
      ) || null;
    }

    it("should find existing reference for 6ème U1M1J1", () => {
      const ref = lookupReference("6ème année", 1, 1, 1);
      expect(ref).not.toBeNull();
      expect(ref!.activities).toHaveLength(3);
    });

    it("should find existing reference for 4ème U1M1J1", () => {
      const ref = lookupReference("4ème année", 1, 1, 1);
      expect(ref).not.toBeNull();
      expect(ref!.activities).toHaveLength(4);
    });

    it("should return null for missing reference (AI fallback trigger)", () => {
      const ref = lookupReference("5ème année", 3, 1, 1);
      expect(ref).toBeNull();
    });

    it("should return null for missing journee (AI fallback trigger)", () => {
      const ref = lookupReference("6ème année", 2, 1, 1);
      expect(ref).toBeNull();
    });

    it("autofill should populate editable fields from reference", () => {
      const ref = lookupReference("4ème année", 1, 1, 1);
      expect(ref).not.toBeNull();
      
      // Simulate autofill: each activity becomes an editable input
      const editableInputs = ref!.activities.map(a => ({
        activityName: a.activityName,
        objet: a.objet, // pre-filled but editable
        objectifDetails: a.objectifSpecifique || "", // pre-filled but editable
        isAutoFilled: true,
      }));

      expect(editableInputs).toHaveLength(4);
      expect(editableInputs[0].objet).toBe("Chant : « Bonjour, bonjour »");
      expect(editableInputs[0].isAutoFilled).toBe(true);
    });

    it("teacher can override autofilled content", () => {
      const ref = lookupReference("4ème année", 1, 1, 1);
      const editableInputs = ref!.activities.map(a => ({
        activityName: a.activityName,
        objet: a.objet,
        isAutoFilled: true,
      }));

      // Teacher overrides the first activity's objet
      editableInputs[0].objet = "Chant personnalisé : « Bonjour les amis »";
      editableInputs[0].isAutoFilled = false;

      expect(editableInputs[0].objet).toBe("Chant personnalisé : « Bonjour les amis »");
      expect(editableInputs[0].isAutoFilled).toBe(false);
      // Other fields remain auto-filled
      expect(editableInputs[1].isAutoFilled).toBe(true);
    });
  });

  describe("coverage statistics", () => {
    it("should calculate coverage correctly", () => {
      const totalPossible = 8 * 8 * 5; // 320 combinations per grade
      const seeded = 5; // U1M1 J1-J5
      const coverage = Math.round((seeded / totalPossible) * 100);
      expect(coverage).toBeGreaterThanOrEqual(0);
      expect(coverage).toBeLessThanOrEqual(100);
      expect(coverage).toBe(2); // 5/320 ≈ 1.5625 → rounds to 2%
    });

    it("should generate unique key for each combination", () => {
      const key1 = "6ème année-U1-M1-J1";
      const key2 = "6ème année-U1-M1-J2";
      const key3 = "4ème année-U1-M1-J1";
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
    });
  });
});
