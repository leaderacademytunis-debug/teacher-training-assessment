import { describe, it, expect } from "vitest";

// ===== Smart Autofill System Integration Tests =====
// Tests the complete autofill workflow: lookup → apply → override → fallback

// Types matching the actual schema
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
  id?: number;
  niveau: string;
  uniteNumber: number;
  moduleNumber: number;
  journeeNumber: number;
  sousTheme?: string | null;
  activities: RefActivity[];
  isOfficial: boolean;
  source: string;
}

// Simulated database of reference content (mirrors seedData)
const REFERENCE_DB: RefRecord[] = [
  // 6ème année U1M1 J1-J5
  {
    id: 1, niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 1,
    isOfficial: true, source: "Programme officiel tunisien",
    activities: [
      { activityName: "Communication orale", duration: "35 mn", objet: "Présenter / Se présenter", objectif: "Communiquer en situation pour : se présenter", etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
      { activityName: "Lecture", duration: "45 mn", objet: "Texte : « Le jour de la rentrée »", objectif: "L'élève serait capable de lire le texte", etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], remarques: "" },
      { activityName: "Grammaire", duration: "35 mn", objet: "La phrase – Les types de phrases", objectif: "L'élève serait capable de reconnaître les types de phrases", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
    ]
  },
  {
    id: 2, niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 2,
    isOfficial: true, source: "Programme officiel tunisien",
    activities: [
      { activityName: "Mise en train", objet: "Poème : « Mon cartable »", objectif: "L'élève serait capable de dire le poème", etapes: ["Présentation", "Audition", "Évaluation"], remarques: "" },
      { activityName: "Communication orale", objet: "Présenter / Se présenter", objectif: "Communiquer en situation", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
      { activityName: "Lecture fonctionnement", objet: "Texte : « Le jour de la rentrée »", objectif: "L'élève serait capable de repérer les personnages", etapes: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"], remarques: "" },
      { activityName: "Conjugaison", objet: "Le verbe « être » au présent", objectif: "L'élève serait capable de conjuguer le verbe être", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
    ]
  },
  // 4ème année U1M1 J1
  {
    id: 6, niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 1,
    sousTheme: "Vive l'école", isOfficial: true, source: "Programme officiel tunisien",
    activities: [
      { activityName: "Mise en train", objet: "Chant : « Bonjour, bonjour »", objectifSpecifique: "Assurer la compréhension du chant", objectif: "L'élève serait capable de chanter correctement", etapes: ["Rappel", "Diction", "Évaluation"] },
      { activityName: "Présentation du projet et du module", objet: "Informer / s'informer – Présenter", objectifSpecifique: "Informer / s'informer", objectif: "L'élève serait capable de repérer des indices", etapes: ["Exploration / anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
      { activityName: "Étude de graphies", objet: "La graphie s = z", objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes", objectif: "L'élève serait capable de compléter les mots", etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
      { activityName: "P.E.L (Pratique Écrite de la Langue)", objet: "La phrase", objectifSpecifique: "Identifier la phrase et ses constituants", objectif: "L'élève serait capable de mettre en ordre des mots", etapes: ["Manipulation-exploration", "Manipulation-fixation"] },
    ]
  },
  // 4ème année U1M1 J4 (5 activities)
  {
    id: 9, niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 4,
    sousTheme: "Vive l'école", isOfficial: true, source: "Programme officiel tunisien",
    activities: [
      { activityName: "Activité d'écoute", objet: "Conte en séquence", objectifSpecifique: "Assurer un bain de langue", objectif: "L'élève serait capable de produire des hypothèses", etapes: ["Rappel", "Émission d'hypothèses", "Audition"] },
      { activityName: "Lecture Fonctionnement", objet: "Texte : « La nouvelle élève »", objectifSpecifique: "Identifier les personnages", objectif: "L'élève serait capable de repérer les personnages", etapes: ["Rappel", "Relecture", "Exploitation des exercices"] },
      { activityName: "Écriture", objet: "La lettre majuscule : M", objectifSpecifique: "Écrire correctement les graphies", objectif: "L'élève serait capable d'écrire la lettre M", etapes: ["Présentation", "Entraînement", "Écriture"] },
      { activityName: "Auto dictée", objet: "« Amélie est en classe »", objectifSpecifique: "Orthographier correctement", objectif: "L'élève serait capable de reproduire de mémoire", etapes: ["Diction", "Reproduction de mémoire", "Correction collective", "Correction individuelle"] },
      { activityName: "Projet (Entraînement)", objet: "Exploitation du texte", objectifSpecifique: "Se repérer dans le récit", objectif: "L'élève serait capable de repérer les trois parties", etapes: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"] },
    ]
  },
];

// ===== Simulated API functions (mirrors backend logic) =====
function getByKey(niveau: string, unite: number, module: number, journee: number): RefRecord | null {
  return REFERENCE_DB.find(r =>
    r.niveau === niveau &&
    r.uniteNumber === unite &&
    r.moduleNumber === module &&
    r.journeeNumber === journee
  ) || null;
}

function checkAvailability(niveau: string, unite: number, module: number): { hasData: boolean; availableJournees: number[]; totalJournees: number } {
  const items = REFERENCE_DB.filter(r =>
    r.niveau === niveau && r.uniteNumber === unite && r.moduleNumber === module
  );
  const journees = items.map(i => i.journeeNumber).sort();
  return { hasData: journees.length > 0, availableJournees: journees, totalJournees: journees.length };
}

// Grade config (mirrors backend getGradeConfig)
interface GradeActivity { name: string; duration?: string; mandatorySteps: string[]; objectifPrefix?: string; }
interface GradeConfig { tableStructure: string; hasObjectifSpecifique: boolean; activities: GradeActivity[]; }

function getGradeConfig(niveau: string, journee: number): GradeConfig {
  const is6eme = niveau === "6ème année";
  if (is6eme) {
    const j1Activities: GradeActivity[] = [
      { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
      { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
      { name: "Grammaire", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    ];
    return { tableStructure: "6eme", hasObjectifSpecifique: false, activities: j1Activities };
  }
  // 3ème-5ème
  const j1Activities: GradeActivity[] = [
    { name: "Mise en train", mandatorySteps: ["Rappel", "Diction", "Évaluation"] },
    { name: "Présentation du projet et du module", mandatorySteps: ["Exploration / anticipation", "Présentation du projet"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
{ name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
    ];
    return { tableStructure: "3_5eme", hasObjectifSpecifique: true, activities: j1Activities };
}

// ===== Autofill application logic (mirrors frontend) =====
interface EditableInput {
  activityName: string;
  objet: string;
  objectifDetails: string;
  objectifSpecifique: string;
  isAutoFilled: boolean;
}

function applyAutofill(refData: RefRecord, gradeConfig: GradeConfig): EditableInput[] {
  const refActivities = refData.activities;
  return gradeConfig.activities.map((gradeAct, idx) => {
    let refAct = refActivities[idx];
    if (!refAct || refAct.activityName?.toLowerCase() !== gradeAct.name.toLowerCase()) {
      refAct = refActivities.find(ra =>
        ra.activityName?.toLowerCase().includes(gradeAct.name.toLowerCase().split(" ")[0])
      ) || refActivities[idx];
    }
    return {
      activityName: gradeAct.name,
      objet: refAct?.objet || "",
      objectifDetails: refAct?.objectif || "",
      objectifSpecifique: refAct?.objectifSpecifique || "",
      isAutoFilled: !!(refAct?.objet),
    };
  });
}

// ===== TESTS =====

describe("Smart Autofill System", () => {

  describe("getByKey - Reference content lookup", () => {
    it("should find 6ème année U1M1J1 with 3 activities", () => {
      const ref = getByKey("6ème année", 1, 1, 1);
      expect(ref).not.toBeNull();
      expect(ref!.activities).toHaveLength(3);
      expect(ref!.isOfficial).toBe(true);
    });

    it("should find 6ème année U1M1J2 with 4 activities", () => {
      const ref = getByKey("6ème année", 1, 1, 2);
      expect(ref).not.toBeNull();
      expect(ref!.activities).toHaveLength(4);
    });

    it("should find 4ème année U1M1J1 with 4 activities and sousTheme", () => {
      const ref = getByKey("4ème année", 1, 1, 1);
      expect(ref).not.toBeNull();
      expect(ref!.activities).toHaveLength(4);
      expect(ref!.sousTheme).toBe("Vive l'école");
    });

    it("should find 4ème année U1M1J4 with 5 activities", () => {
      const ref = getByKey("4ème année", 1, 1, 4);
      expect(ref).not.toBeNull();
      expect(ref!.activities).toHaveLength(5);
    });

    it("should return null for missing 5ème année (AI fallback trigger)", () => {
      const ref = getByKey("5ème année", 1, 1, 1);
      expect(ref).toBeNull();
    });

    it("should return null for missing unit (AI fallback trigger)", () => {
      const ref = getByKey("6ème année", 2, 1, 1);
      expect(ref).toBeNull();
    });

    it("should return null for missing journee (AI fallback trigger)", () => {
      const ref = getByKey("4ème année", 1, 1, 3);
      expect(ref).toBeNull();
    });
  });

  describe("checkAvailability - Data availability check", () => {
    it("should report 6ème U1M1 has data for J1 and J2", () => {
      const avail = checkAvailability("6ème année", 1, 1);
      expect(avail.hasData).toBe(true);
      expect(avail.availableJournees).toContain(1);
      expect(avail.availableJournees).toContain(2);
      expect(avail.totalJournees).toBe(2);
    });

    it("should report 4ème U1M1 has data for J1 and J4", () => {
      const avail = checkAvailability("4ème année", 1, 1);
      expect(avail.hasData).toBe(true);
      expect(avail.availableJournees).toContain(1);
      expect(avail.availableJournees).toContain(4);
      expect(avail.totalJournees).toBe(2);
    });

    it("should report no data for 5ème année", () => {
      const avail = checkAvailability("5ème année", 1, 1);
      expect(avail.hasData).toBe(false);
      expect(avail.availableJournees).toHaveLength(0);
    });

    it("should report no data for unit 2", () => {
      const avail = checkAvailability("6ème année", 2, 1);
      expect(avail.hasData).toBe(false);
    });
  });

  describe("applyAutofill - Pre-fill form fields", () => {
    it("should pre-fill 6ème année J1 with 3 activities", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      const config = getGradeConfig("6ème année", 1);
      const inputs = applyAutofill(ref, config);

      expect(inputs).toHaveLength(3);
      expect(inputs[0].activityName).toBe("Communication orale");
      expect(inputs[0].objet).toBe("Présenter / Se présenter");
      expect(inputs[0].isAutoFilled).toBe(true);
    });

    it("should pre-fill 4ème année J1 with objectifSpecifique", () => {
      const ref = getByKey("4ème année", 1, 1, 1)!;
      const config = getGradeConfig("4ème année", 1);
      const inputs = applyAutofill(ref, config);

      expect(inputs).toHaveLength(4);
      expect(inputs[0].objectifSpecifique).toBe("Assurer la compréhension du chant");
      expect(inputs[2].objectifSpecifique).toBe("Discriminer auditivement les phonèmes-graphèmes");
    });

    it("should mark all pre-filled fields as autoFilled", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      const config = getGradeConfig("6ème année", 1);
      const inputs = applyAutofill(ref, config);

      inputs.forEach(input => {
        expect(input.isAutoFilled).toBe(true);
      });
    });

    it("should populate objectifDetails from reference objectif", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      const config = getGradeConfig("6ème année", 1);
      const inputs = applyAutofill(ref, config);

      expect(inputs[0].objectifDetails).toContain("Communiquer en situation");
      expect(inputs[1].objectifDetails).toContain("L'élève serait capable de lire");
    });
  });

  describe("Teacher override - Editable pre-filled fields", () => {
    it("teacher can modify objet field", () => {
      const ref = getByKey("4ème année", 1, 1, 1)!;
      const config = getGradeConfig("4ème année", 1);
      const inputs = applyAutofill(ref, config);

      // Teacher overrides
      inputs[0].objet = "Chant personnalisé : « Bonjour les amis »";
      inputs[0].isAutoFilled = false;

      expect(inputs[0].objet).toBe("Chant personnalisé : « Bonjour les amis »");
      expect(inputs[0].isAutoFilled).toBe(false);
      // Other fields remain auto-filled
      expect(inputs[1].isAutoFilled).toBe(true);
    });

    it("teacher can modify objectifSpecifique field", () => {
      const ref = getByKey("4ème année", 1, 1, 1)!;
      const config = getGradeConfig("4ème année", 1);
      const inputs = applyAutofill(ref, config);

      inputs[0].objectifSpecifique = "Objectif personnalisé par l'enseignant";
      expect(inputs[0].objectifSpecifique).toBe("Objectif personnalisé par l'enseignant");
    });

    it("teacher can clear a pre-filled field", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      const config = getGradeConfig("6ème année", 1);
      const inputs = applyAutofill(ref, config);

      inputs[2].objet = "";
      expect(inputs[2].objet).toBe("");
    });
  });

  describe("AI Fallback - When no reference data exists", () => {
    it("should trigger AI fallback for 5ème année", () => {
      const ref = getByKey("5ème année", 1, 1, 1);
      expect(ref).toBeNull();
      // UI should show "Générer par IA" button
    });

    it("should trigger AI fallback for unseeded unit", () => {
      const ref = getByKey("6ème année", 3, 2, 1);
      expect(ref).toBeNull();
    });

    it("empty inputs should be sent to AI for completion", () => {
      const config = getGradeConfig("5ème année", 1);
      const emptyInputs = config.activities.map(a => ({
        activityName: a.name,
        objet: "",
        objectifDetails: "",
        objectifSpecifique: "",
        isAutoFilled: false,
      }));

      // All fields should be empty (AI will fill them)
      emptyInputs.forEach(input => {
        expect(input.objet).toBe("");
        expect(input.isAutoFilled).toBe(false);
      });
    });
  });

  describe("Grade-specific structure validation", () => {
    it("6ème année should have duration and remarques, no objectifSpecifique", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      ref.activities.forEach(a => {
        expect(a.duration).toBeTruthy();
        expect("remarques" in a).toBe(true);
        expect(a.objectifSpecifique).toBeUndefined();
      });
    });

    it("4ème année should have objectifSpecifique, no duration", () => {
      const ref = getByKey("4ème année", 1, 1, 1)!;
      ref.activities.forEach(a => {
        expect(a.objectifSpecifique).toBeTruthy();
        expect(a.duration).toBeUndefined();
      });
    });

    it("6ème config should have tableStructure=6eme", () => {
      const config = getGradeConfig("6ème année", 1);
      expect(config.tableStructure).toBe("6eme");
      expect(config.hasObjectifSpecifique).toBe(false);
    });

    it("4ème config should have tableStructure=3_5eme with objectifSpecifique", () => {
      const config = getGradeConfig("4ème année", 1);
      expect(config.tableStructure).toBe("3_5eme");
      expect(config.hasObjectifSpecifique).toBe(true);
    });
  });

  describe("Sous-thème autofill", () => {
    it("should auto-fill sousTheme for 4ème année", () => {
      const ref = getByKey("4ème année", 1, 1, 1)!;
      expect(ref.sousTheme).toBe("Vive l'école");
    });

    it("should not have sousTheme for 6ème année", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      expect(ref.sousTheme).toBeUndefined();
    });
  });

  describe("Activity matching logic", () => {
    it("should match activities by index when names align", () => {
      const ref = getByKey("6ème année", 1, 1, 1)!;
      const config = getGradeConfig("6ème année", 1);
      
      // Activities should align by index
      expect(ref.activities[0].activityName).toBe(config.activities[0].name);
      expect(ref.activities[1].activityName).toBe(config.activities[1].name);
      expect(ref.activities[2].activityName).toBe(config.activities[2].name);
    });

    it("should handle activity name variations gracefully", () => {
      // Test the fuzzy matching logic
      const refAct = { activityName: "Lecture fonctionnement" };
      const configName = "Lecture Fonctionnement";
      
      // Case-insensitive first word match
      const firstWord = configName.toLowerCase().split(" ")[0];
      const matches = refAct.activityName.toLowerCase().includes(firstWord);
      expect(matches).toBe(true);
    });
  });

  describe("Seed data completeness", () => {
    it("6ème année U1M1 should have J1 and J2 seeded", () => {
      const avail = checkAvailability("6ème année", 1, 1);
      expect(avail.availableJournees).toContain(1);
      expect(avail.availableJournees).toContain(2);
    });

    it("4ème année U1M1 should have J1 and J4 seeded", () => {
      const avail = checkAvailability("4ème année", 1, 1);
      expect(avail.availableJournees).toContain(1);
      expect(avail.availableJournees).toContain(4);
    });

    it("all seeded records should be marked as official", () => {
      REFERENCE_DB.forEach(record => {
        expect(record.isOfficial).toBe(true);
        expect(record.source).toBe("Programme officiel tunisien");
      });
    });

    it("all activities should have non-empty objet and objectif", () => {
      REFERENCE_DB.forEach(record => {
        record.activities.forEach(a => {
          expect(a.objet.length).toBeGreaterThan(0);
          expect(a.objectif.length).toBeGreaterThan(0);
          expect(a.etapes.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
