import { describe, it, expect } from "vitest";

// ===== Test the grade-specific activity configuration logic =====

// Replicate the activity config structures from the router
interface ActivityConfig {
  name: string;
  duration?: string;
  mandatorySteps: string[];
  objectifPrefix?: string;
}

const ACTIVITIES_6EME: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Grammaire", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "2": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "3": [
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"] },
    { name: "Orthographe", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "4": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Grammaire", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "6": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "7": [
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Orthographe", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "8": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
};

const ACTIVITIES_3_5EME: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Mise en train", mandatorySteps: ["Rappel", "Diction", "Évaluation"] },
    { name: "Présentation du projet et du module", mandatorySteps: ["Exploration/anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "2": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "3": [
    { name: "Mise en train", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Communication orale", mandatorySteps: ["Reprise de la situation n° 1", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "4": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet (Entraînement)", mandatorySteps: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [
    { name: "Mise en train", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Communication orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "6": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "7": [
    { name: "Mise en train", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Communication orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "8": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet (Entraînement)", mandatorySteps: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"] },
  ],
};

function getActivitiesForGrade(niveau: string, journee: number): ActivityConfig[] {
  const j = String(journee);
  if (niveau === "6ème année") {
    return ACTIVITIES_6EME[j] || ACTIVITIES_6EME["1"];
  }
  return ACTIVITIES_3_5EME[j] || ACTIVITIES_3_5EME["1"];
}

function getTableStructure(niveau: string): "6eme" | "3_5eme" {
  return niveau === "6ème année" ? "6eme" : "3_5eme";
}

// ===== TESTS =====

describe("Répartition Journalière - Grade Configuration", () => {

  // ===== 6ème année tests =====
  describe("6ème année", () => {
    it("should return 6eme table structure", () => {
      expect(getTableStructure("6ème année")).toBe("6eme");
    });

    it("J1 should have 3 activities: Communication orale, Lecture, Grammaire", () => {
      const activities = getActivitiesForGrade("6ème année", 1);
      expect(activities).toHaveLength(3);
      expect(activities[0].name).toBe("Communication orale");
      expect(activities[1].name).toBe("Lecture");
      expect(activities[2].name).toBe("Grammaire");
    });

    it("J1 Communication orale should have duration 35 mn", () => {
      const activities = getActivitiesForGrade("6ème année", 1);
      expect(activities[0].duration).toBe("35 mn");
    });

    it("J1 Lecture should have duration 45 mn", () => {
      const activities = getActivitiesForGrade("6ème année", 1);
      expect(activities[1].duration).toBe("45 mn");
    });

    it("J2 should have 4 activities: Mise en train, Communication orale, Lecture fonctionnement, Conjugaison", () => {
      const activities = getActivitiesForGrade("6ème année", 2);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Mise en train");
      expect(activities[1].name).toBe("Communication orale");
      expect(activities[2].name).toBe("Lecture fonctionnement");
      expect(activities[3].name).toBe("Conjugaison");
    });

    it("J3 should have Orthographe instead of Grammaire", () => {
      const activities = getActivitiesForGrade("6ème année", 3);
      expect(activities).toHaveLength(3);
      expect(activities[2].name).toBe("Orthographe");
    });

    it("J4 should have 5 activities including Écriture and Auto dictée", () => {
      const activities = getActivitiesForGrade("6ème année", 4);
      expect(activities).toHaveLength(5);
      expect(activities.map(a => a.name)).toContain("Écriture");
      expect(activities.map(a => a.name)).toContain("Auto dictée");
      expect(activities.map(a => a.name)).toContain("Projet d'écriture");
    });

    it("J5 should be same structure as J1", () => {
      const j5 = getActivitiesForGrade("6ème année", 5);
      expect(j5).toHaveLength(3);
      expect(j5[0].name).toBe("Communication orale");
      expect(j5[2].name).toBe("Grammaire");
    });

    it("J6 should have 4 activities: Mise en train, Communication orale, Lecture fonctionnement, Conjugaison", () => {
      const activities = getActivitiesForGrade("6ème année", 6);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Mise en train");
      expect(activities[3].name).toBe("Conjugaison");
    });

    it("J7 should have 3 activities: Communication orale, Lecture, Orthographe", () => {
      const activities = getActivitiesForGrade("6ème année", 7);
      expect(activities).toHaveLength(3);
      expect(activities[2].name).toBe("Orthographe");
    });

    it("J8 should have 5 activities including Écriture and Auto dictée", () => {
      const activities = getActivitiesForGrade("6ème année", 8);
      expect(activities).toHaveLength(5);
      expect(activities.map(a => a.name)).toContain("Écriture");
      expect(activities.map(a => a.name)).toContain("Auto dictée");
    });

    it("all activities J1-J8 should have mandatory steps", () => {
      for (let j = 1; j <= 8; j++) {
        const activities = getActivitiesForGrade("6ème année", j);
        for (const a of activities) {
          expect(a.mandatorySteps.length).toBeGreaterThan(0);
        }
      }
    });

    it("Lecture should always have 6 mandatory steps", () => {
      const j1 = getActivitiesForGrade("6ème année", 1);
      const lecture = j1.find(a => a.name === "Lecture");
      expect(lecture?.mandatorySteps).toHaveLength(6);
      expect(lecture?.mandatorySteps).toContain("Anticipation");
      expect(lecture?.mandatorySteps).toContain("Approche globale");
      expect(lecture?.mandatorySteps).toContain("Approche analytique");
    });
  });

  // ===== 3ème-5ème année tests =====
  describe("3ème-5ème année", () => {
    it("should return 3_5eme table structure for 4ème année", () => {
      expect(getTableStructure("4ème année")).toBe("3_5eme");
    });

    it("should return 3_5eme table structure for 3ème année", () => {
      expect(getTableStructure("3ème année")).toBe("3_5eme");
    });

    it("should return 3_5eme table structure for 5ème année", () => {
      expect(getTableStructure("5ème année")).toBe("3_5eme");
    });

    it("J1 should have 4 activities: Mise en train, Présentation du projet, Étude de graphies, P.E.L", () => {
      const activities = getActivitiesForGrade("4ème année", 1);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Mise en train");
      expect(activities[1].name).toBe("Présentation du projet et du module");
      expect(activities[2].name).toBe("Étude de graphies");
      expect(activities[3].name).toBe("P.E.L (Pratique Écrite de la Langue)");
    });

    it("J2 should have Activité d'écoute and Lecture compréhension", () => {
      const activities = getActivitiesForGrade("4ème année", 2);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Activité d'écoute");
      expect(activities[1].name).toBe("Lecture compréhension");
    });

    it("J3 should have Communication orale", () => {
      const activities = getActivitiesForGrade("4ème année", 3);
      expect(activities).toHaveLength(4);
      expect(activities[1].name).toBe("Communication orale");
    });

    it("J4 should have 5 activities including Écriture, Auto dictée, Projet", () => {
      const activities = getActivitiesForGrade("4ème année", 4);
      expect(activities).toHaveLength(5);
      expect(activities.map(a => a.name)).toContain("Écriture");
      expect(activities.map(a => a.name)).toContain("Auto dictée");
      expect(activities.map(a => a.name)).toContain("Projet (Entraînement)");
    });

    it("J5 should have Mise en train, Communication orale, Étude de graphies, P.E.L", () => {
      const activities = getActivitiesForGrade("4ème année", 5);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Mise en train");
      expect(activities[1].name).toBe("Communication orale");
      expect(activities[2].name).toBe("Étude de graphies");
      expect(activities[3].name).toBe("P.E.L (Pratique Écrite de la Langue)");
    });

    it("J6 should have 4 activities: Activité d'écoute, Lecture compréhension, Étude de graphies, P.E.L", () => {
      const activities = getActivitiesForGrade("4ème année", 6);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Activité d'écoute");
      expect(activities[1].name).toBe("Lecture compréhension");
    });

    it("J7 should have 4 activities: Mise en train, Communication orale, Étude de graphies, P.E.L", () => {
      const activities = getActivitiesForGrade("4ème année", 7);
      expect(activities).toHaveLength(4);
      expect(activities[0].name).toBe("Mise en train");
      expect(activities[1].name).toBe("Communication orale");
    });

    it("J8 should have 5 activities including Écriture, Auto dictée, Projet", () => {
      const activities = getActivitiesForGrade("4ème année", 8);
      expect(activities).toHaveLength(5);
      expect(activities.map(a => a.name)).toContain("Écriture");
      expect(activities.map(a => a.name)).toContain("Auto dictée");
    });

    it("3ème-5ème activities should NOT have duration", () => {
      for (let j = 1; j <= 8; j++) {
        const activities = getActivitiesForGrade("4ème année", j);
        for (const a of activities) {
          expect(a.duration).toBeUndefined();
        }
      }
    });

    it("all activities J1-J8 should have mandatory steps", () => {
      for (let j = 1; j <= 8; j++) {
        const activities = getActivitiesForGrade("4ème année", j);
        for (const a of activities) {
          expect(a.mandatorySteps.length).toBeGreaterThan(0);
        }
      }
    });

    it("Étude de graphies should always have 2 steps: auditive + visuelle", () => {
      const j1 = getActivitiesForGrade("4ème année", 1);
      const eg = j1.find(a => a.name === "Étude de graphies");
      expect(eg?.mandatorySteps).toHaveLength(2);
      expect(eg?.mandatorySteps).toContain("Reconnaissance auditive");
      expect(eg?.mandatorySteps).toContain("Reconnaissance visuelle");
    });

    it("P.E.L should always have 2 steps: exploration + fixation", () => {
      const j1 = getActivitiesForGrade("4ème année", 1);
      const pel = j1.find(a => a.name === "P.E.L (Pratique Écrite de la Langue)");
      expect(pel?.mandatorySteps).toHaveLength(2);
      expect(pel?.mandatorySteps).toContain("Manipulation-exploration");
      expect(pel?.mandatorySteps).toContain("Manipulation-fixation");
    });
  });

  // ===== Cross-grade tests =====
  describe("Cross-grade validation", () => {
    it("different grades for same day should have different activity counts", () => {
      const g6j1 = getActivitiesForGrade("6ème année", 1);
      const g4j1 = getActivitiesForGrade("4ème année", 1);
      // 6ème has 3 activities on J1, 4ème has 4
      expect(g6j1.length).not.toBe(g4j1.length);
    });

    it("6ème J4 and 4ème J4 both have 5 activities", () => {
      const g6j4 = getActivitiesForGrade("6ème année", 4);
      const g4j4 = getActivitiesForGrade("4ème année", 4);
      expect(g6j4).toHaveLength(5);
      expect(g4j4).toHaveLength(5);
    });

    it("6ème has duration on J1 activities, 4ème does not", () => {
      const g6j1 = getActivitiesForGrade("6ème année", 1);
      const g4j1 = getActivitiesForGrade("4ème année", 1);
      expect(g6j1[0].duration).toBeDefined();
      expect(g4j1[0].duration).toBeUndefined();
    });

    it("invalid journee should fallback to J1", () => {
      const g6 = getActivitiesForGrade("6ème année", 99);
      const g6j1 = getActivitiesForGrade("6ème année", 1);
      expect(g6.length).toBe(g6j1.length);
      expect(g6[0].name).toBe(g6j1[0].name);
    });
  });
});

describe("Répartition Journalière - Table Structure", () => {
  it("6ème année should have Remarques column", () => {
    const structure = getTableStructure("6ème année");
    expect(structure).toBe("6eme");
    // 6eme means: Activités, Objet, Objectif, Étapes, Remarques
  });

  it("3ème-5ème should have Objectifs spécifiques column", () => {
    const structure = getTableStructure("4ème année");
    expect(structure).toBe("3_5eme");
    // 3_5eme means: Activités, Objets, Objectifs spécifiques, Objectif de la séance, Étapes
  });

  it("6ème should have timing in activities", () => {
    const activities = getActivitiesForGrade("6ème année", 1);
    const hasDuration = activities.some(a => a.duration);
    expect(hasDuration).toBe(true);
  });

  it("4ème should NOT have timing in activities", () => {
    const activities = getActivitiesForGrade("4ème année", 1);
    const hasDuration = activities.some(a => a.duration);
    expect(hasDuration).toBe(false);
  });
});

describe("Répartition Journalière - Activity Sequence Validation", () => {
  it("6ème J1 sequence: Communication orale → Lecture → Grammaire", () => {
    const activities = getActivitiesForGrade("6ème année", 1);
    expect(activities.map(a => a.name)).toEqual([
      "Communication orale",
      "Lecture",
      "Grammaire",
    ]);
  });

  it("4ème J1 sequence: Mise en train → Présentation → Étude de graphies → P.E.L", () => {
    const activities = getActivitiesForGrade("4ème année", 1);
    expect(activities.map(a => a.name)).toEqual([
      "Mise en train",
      "Présentation du projet et du module",
      "Étude de graphies",
      "P.E.L (Pratique Écrite de la Langue)",
    ]);
  });

  it("6ème J4 sequence: Mise en train → Lecture fonctionnement → Écriture → Auto dictée → Projet d'écriture", () => {
    const activities = getActivitiesForGrade("6ème année", 4);
    expect(activities.map(a => a.name)).toEqual([
      "Mise en train",
      "Lecture fonctionnement",
      "Écriture",
      "Auto dictée",
      "Projet d'écriture",
    ]);
  });

  it("4ème J4 sequence: Activité d'écoute → Lecture fonctionnement → Écriture → Auto dictée → Projet (Entraînement)", () => {
    const activities = getActivitiesForGrade("4ème année", 4);
    expect(activities.map(a => a.name)).toEqual([
      "Activité d'écoute",
      "Lecture fonctionnement",
      "Écriture",
      "Auto dictée",
      "Projet (Entraînement)",
    ]);
  });
});
