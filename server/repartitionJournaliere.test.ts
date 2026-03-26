import { describe, it, expect } from "vitest";

// ===== Test the grade-specific activity configuration logic =====
// Now testing 3 separate configs: 4ème (Phase1/Phase2), 5ème (Impairs/Pairs), 6ème (Phase1/Phase2)

interface ActivityConfig {
  name: string;
  duration?: string;
  mandatorySteps: string[];
  objectifPrefix?: string;
}

// ═══════════════════════════════════════════════════════════════════
// 6ÈME ANNÉE CONFIGS (Phase 1 & Phase 2)
// ═══════════════════════════════════════════════════════════════════

const ACTIVITIES_6EME_PHASE1: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Poème ou chant", mandatorySteps: ["Audition", "Compréhension", "Mémorisation", "Évaluation"] },
    { name: "Expression orale (présentation du module et du projet d'écriture)", mandatorySteps: ["Présentation du module", "Présentation du projet d'écriture", "Exploration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture Compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Grammaire", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "2": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "3": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
  "4": [
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [
    { name: "Autodictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective", "Correction individuelle"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Grammaire et conjugaison (intégration)", mandatorySteps: ["Rappel", "Exercices d'intégration", "Correction", "Évaluation"] },
  ],
  "6": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "7": [
    { name: "Lecture documentaire", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Production", "Révision", "Évaluation"] },
    { name: "Lecture suivie", mandatorySteps: ["Rappel", "Lecture silencieuse", "Exploitation", "Évaluation"] },
  ],
  "8": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Page vocabulaire (jouer avec les mots)", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Lecture-action", mandatorySteps: ["Découverte", "Compréhension", "Exécution", "Évaluation"] },
    { name: "Bibliothèque de classe", mandatorySteps: ["Présentation", "Lecture libre", "Partage", "Évaluation"] },
  ],
};

const ACTIVITIES_6EME_PHASE2: Record<string, ActivityConfig[]> = {
  "1": [...ACTIVITIES_6EME_PHASE1["1"]],
  "2": [...ACTIVITIES_6EME_PHASE1["2"]],
  "3": [
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Projet d'écriture (entraînement)", mandatorySteps: ["Exploration", "Entraînement", "Intégration", "Évaluation"] },
  ],
  "4": [
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Projet d'écriture (production)", mandatorySteps: ["Exploration", "Production", "Révision", "Évaluation"] },
  ],
  "5": [
    { name: "Autodictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective", "Correction individuelle"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Grammaire et conjugaison (intégration)", mandatorySteps: ["Rappel", "Exercices d'intégration", "Correction", "Évaluation"] },
  ],
  "6": [
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Projet d'écriture (remédiation)", mandatorySteps: ["Analyse des erreurs", "Remédiation", "Réécriture partielle", "Évaluation"] },
  ],
  "7": [
    { name: "Lecture documentaire", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
    { name: "Projet d'écriture (réécriture)", mandatorySteps: ["Rappel", "Réécriture", "Révision", "Évaluation"] },
    { name: "Lecture suivie", mandatorySteps: ["Rappel", "Lecture silencieuse", "Exploitation", "Évaluation"] },
  ],
  "8": [...ACTIVITIES_6EME_PHASE1["8"]],
};

// ═══════════════════════════════════════════════════════════════════
// 4ÈME ANNÉE CONFIGS (Phase 1 & Phase 2)
// ═══════════════════════════════════════════════════════════════════

const ACTIVITIES_4EME_PHASE1: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Présentation du projet et du module", mandatorySteps: ["Exploration/anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "2": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte 1 (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
  ],
  "3": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation n° 1", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "4": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture Texte 1 (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet (Entraînement)", mandatorySteps: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "6": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte 2 (compréhension et fonctionnement)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Exploitation des exercices", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
  ],
  "7": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Page vocabulaire", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
  ],
  "8": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture pour s'informer (page documentaire)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Lecture pour agir", mandatorySteps: ["Découverte", "Compréhension", "Exécution", "Évaluation"] },
    { name: "Projet (Entraînement ou Production)", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Production", "Évaluation"] },
  ],
};

const ACTIVITIES_4EME_PHASE2: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Présentation du projet et du module", mandatorySteps: ["Exploration/anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
    { name: "Lecture (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "2": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique", "Fixation", "Évaluation"] },
  ],
  "3": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation n° 1", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "4": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique", "Fixation", "Évaluation"] },
    { name: "Projet (Entraînement)", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "6": [
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective", "Correction individuelle"] },
  ],
  "7": [...ACTIVITIES_4EME_PHASE1["7"]],
  "8": [...ACTIVITIES_4EME_PHASE1["8"]],
};

// ═══════════════════════════════════════════════════════════════════
// 5ÈME ANNÉE CONFIGS (Modules Impairs & Pairs)
// ═══════════════════════════════════════════════════════════════════

const ACTIVITIES_5EME_IMPAIRS: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Présentation du module, du projet et de la fiche-contrat", mandatorySteps: ["Présentation du module", "Présentation du projet", "Exploitation de la fiche-contrat"] },
    { name: "Élaboration de la carte d'exploration de pistes", mandatorySteps: ["Exploration", "Élaboration", "Mise en commun"] },
    { name: "Lecture Texte (1) Compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Grammaire", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "2": [
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte (1) Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Projet d'écriture (entraînement et outil d'aide)", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Entraînement", "Évaluation"] },
  ],
  "3": [
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte (2) Compréhension", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Grammaire", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "4": [
    { name: "Auto-dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective", "Correction individuelle"] },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
    { name: "Lecture suivie", mandatorySteps: ["Rappel", "Lecture silencieuse", "Exploitation", "Évaluation"] },
    { name: "Lecture-action", mandatorySteps: ["Découverte", "Compréhension", "Exécution", "Évaluation"] },
  ],
  "5": [
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte (2) Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Projet d'écriture (entraînement)", mandatorySteps: ["Exploration", "Entraînement", "Intégration", "Évaluation"] },
  ],
  "6": [
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture documentaire", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "7": [
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique", "Fixation", "Évaluation"] },
    { name: "Page vocabulaire", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Projet d'écriture (production en groupe)", mandatorySteps: ["Exploration", "Production en groupe", "Révision", "Évaluation"] },
  ],
  "8": [
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
    { name: "Projet d'écriture (remédiation)", mandatorySteps: ["Analyse des erreurs", "Remédiation", "Réécriture partielle", "Évaluation"] },
    { name: "Bibliothèque de classe", mandatorySteps: ["Présentation", "Lecture libre", "Partage", "Évaluation"] },
  ],
};

const ACTIVITIES_5EME_PAIRS: Record<string, ActivityConfig[]> = {
  "1": [...ACTIVITIES_5EME_IMPAIRS["1"]],
  "2": [...ACTIVITIES_5EME_IMPAIRS["2"]],
  "3": [...ACTIVITIES_5EME_IMPAIRS["3"]],
  "4": [...ACTIVITIES_5EME_IMPAIRS["4"]],
  "5": [
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte (2) Fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Projet d'écriture (production individuelle)", mandatorySteps: ["Exploration", "Production individuelle", "Révision", "Évaluation"] },
  ],
  "6": [...ACTIVITIES_5EME_IMPAIRS["6"]],
  "7": [
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique", "Fixation", "Évaluation"] },
    { name: "Page vocabulaire", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Projet d'écriture (remédiation)", mandatorySteps: ["Analyse des erreurs", "Remédiation", "Réécriture partielle", "Évaluation"] },
  ],
  "8": [
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
    { name: "Projet d'écriture (réécriture et finalisation)", mandatorySteps: ["Rappel", "Réécriture", "Finalisation", "Évaluation"] },
    { name: "Bibliothèque de classe", mandatorySteps: ["Présentation", "Lecture libre", "Partage", "Évaluation"] },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 3ÈME ANNÉE CONFIGS (based on Guide Méthodologique CNP)
// ═══════════════════════════════════════════════════════════════════

const ACTIVITIES_3EME: Record<string, ActivityConfig[]> = {
  "1": [
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Poème/chant", mandatorySteps: ["Audition", "Compréhension", "Mémorisation", "Évaluation"] },
    { name: "Lecture", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Observation du modèle", "Entraînement", "Production", "Évaluation"] },
  ],
  "2": [
    { name: "Communication orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Phonétique", mandatorySteps: ["Discrimination auditive", "Discrimination visuelle", "Fixation", "Évaluation"] },
    { name: "Lecture", mandatorySteps: ["Rappel", "Relecture", "Exploitation", "Évaluation"] },
    { name: "Copie", mandatorySteps: ["Observation", "Reproduction", "Vérification", "Évaluation"] },
  ],
  "3": [
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Poème/chant", mandatorySteps: ["Audition", "Compréhension", "Mémorisation", "Évaluation"] },
    { name: "Lecture", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Observation du modèle", "Entraînement", "Production", "Évaluation"] },
  ],
  "4": [
    { name: "Communication orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Phonétique", mandatorySteps: ["Discrimination auditive", "Discrimination visuelle", "Fixation", "Évaluation"] },
    { name: "Lecture (intégration)", mandatorySteps: ["Rappel", "Exercices d'intégration", "Correction", "Évaluation"] },
    { name: "Initiation à la production", mandatorySteps: ["Exploration", "Entraînement", "Production", "Évaluation"] },
  ],
  "5": [
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Poème/chant", mandatorySteps: ["Audition", "Compréhension", "Mémorisation", "Évaluation"] },
    { name: "Lecture", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Observation du modèle", "Entraînement", "Production", "Évaluation"] },
  ],
  "6": [
    { name: "Communication orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Phonétique", mandatorySteps: ["Discrimination auditive", "Discrimination visuelle", "Fixation", "Évaluation"] },
    { name: "Lecture", mandatorySteps: ["Rappel", "Relecture", "Exploitation", "Évaluation"] },
    { name: "Copie", mandatorySteps: ["Observation", "Reproduction", "Vérification", "Évaluation"] },
  ],
  "7": [
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
    { name: "Vocabulaire", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Abécédaire", mandatorySteps: ["Exploration", "Classement", "Production", "Évaluation"] },
  ],
  "8": [
    { name: "Poème/chant", mandatorySteps: ["Audition", "Compréhension", "Mémorisation", "Récitation/Chant"] },
    { name: "Lecture documentaire", mandatorySteps: ["Anticipation", "Approche globale", "Exploitation", "Évaluation"] },
    { name: "Lecture action", mandatorySteps: ["Observation", "Exploration", "Réalisation", "Évaluation"] },
    { name: "Chrono-syllabes", mandatorySteps: ["Présentation", "Lecture chronométrée", "Correction", "Évaluation"] },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// UNIFIED RESOLVER (mirrors the backend function)
// ═══════════════════════════════════════════════════════════════════

function getActivitiesForGrade(niveau: string, journee: number, moduleNum?: number): ActivityConfig[] {
  const j = String(journee);
  const mod = moduleNum || 1;

  if (niveau === "6ème année") {
    if (mod >= 5) return ACTIVITIES_6EME_PHASE2[j] || ACTIVITIES_6EME_PHASE2["1"];
    return ACTIVITIES_6EME_PHASE1[j] || ACTIVITIES_6EME_PHASE1["1"];
  }

  if (niveau === "5ème année") {
    if (mod % 2 === 0) return ACTIVITIES_5EME_PAIRS[j] || ACTIVITIES_5EME_PAIRS["1"];
    return ACTIVITIES_5EME_IMPAIRS[j] || ACTIVITIES_5EME_IMPAIRS["1"];
  }

  if (niveau === "4ème année") {
    if (mod >= 5) return ACTIVITIES_4EME_PHASE2[j] || ACTIVITIES_4EME_PHASE2["1"];
    return ACTIVITIES_4EME_PHASE1[j] || ACTIVITIES_4EME_PHASE1["1"];
  }

  // 3ème année
  return ACTIVITIES_3EME[j] || ACTIVITIES_3EME["1"];
}

function getTableStructure(niveau: string): "6eme" | "3_5eme" {
  return niveau === "6ème année" ? "6eme" : "3_5eme";
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("6ème année - Phase 1 (M1-M4)", () => {
  it("J1 should have 4 activities: Poème, Expression orale, Lecture Compréhension, Grammaire", () => {
    const a = getActivitiesForGrade("6ème année", 1, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Poème ou chant");
    expect(a[1].name).toContain("Expression orale");
    expect(a[2].name).toBe("Lecture Compréhension");
    expect(a[3].name).toBe("Grammaire");
  });

  it("J2 should have Mise en train, Expression orale, Lecture Fonctionnement, Conjugaison", () => {
    const a = getActivitiesForGrade("6ème année", 2, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Mise en train");
    expect(a[2].name).toBe("Lecture Fonctionnement");
    expect(a[3].name).toBe("Conjugaison");
  });

  it("J3 should have Projet d'écriture (generic, not entraînement)", () => {
    const a = getActivitiesForGrade("6ème année", 3, 1);
    expect(a[3].name).toBe("Projet d'écriture");
  });

  it("J4 should have Orthographe and Projet d'écriture", () => {
    const a = getActivitiesForGrade("6ème année", 4, 1);
    expect(a).toHaveLength(4);
    expect(a[2].name).toBe("Orthographe");
    expect(a[3].name).toBe("Projet d'écriture");
  });

  it("J5 should start with Autodictée and end with Grammaire et conjugaison (intégration)", () => {
    const a = getActivitiesForGrade("6ème année", 5, 1);
    expect(a[0].name).toBe("Autodictée");
    expect(a[3].name).toBe("Grammaire et conjugaison (intégration)");
  });

  it("J7 should have Lecture documentaire, Dictée, Projet d'écriture, Lecture suivie", () => {
    const a = getActivitiesForGrade("6ème année", 7, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Lecture documentaire");
    expect(a[1].name).toBe("Dictée");
    expect(a[2].name).toBe("Projet d'écriture");
    expect(a[3].name).toBe("Lecture suivie");
  });

  it("J8 should have Mise en train, Page vocabulaire, Lecture-action, Bibliothèque", () => {
    const a = getActivitiesForGrade("6ème année", 8, 1);
    expect(a).toHaveLength(4);
    expect(a[1].name).toContain("Page vocabulaire");
    expect(a[2].name).toBe("Lecture-action");
    expect(a[3].name).toBe("Bibliothèque de classe");
  });
});

describe("6ème année - Phase 2 (M5-M8)", () => {
  it("J3 Phase 2 should have Projet d'écriture (entraînement)", () => {
    const a = getActivitiesForGrade("6ème année", 3, 5);
    expect(a[3].name).toBe("Projet d'écriture (entraînement)");
  });

  it("J4 Phase 2 should have Projet d'écriture (production)", () => {
    const a = getActivitiesForGrade("6ème année", 4, 6);
    expect(a[3].name).toBe("Projet d'écriture (production)");
  });

  it("J5 Phase 2 should have Lecture Fonctionnement (not Compréhension)", () => {
    const a = getActivitiesForGrade("6ème année", 5, 7);
    expect(a[2].name).toBe("Lecture Fonctionnement");
  });

  it("J6 Phase 2 should have Projet d'écriture (remédiation)", () => {
    const a = getActivitiesForGrade("6ème année", 6, 8);
    expect(a).toHaveLength(4);
    expect(a[3].name).toBe("Projet d'écriture (remédiation)");
  });

  it("J7 Phase 2 should have Projet d'écriture (réécriture)", () => {
    const a = getActivitiesForGrade("6ème année", 7, 5);
    expect(a[2].name).toBe("Projet d'écriture (réécriture)");
  });

  it("J1 and J2 should be same in Phase 1 and Phase 2", () => {
    const p1j1 = getActivitiesForGrade("6ème année", 1, 1);
    const p2j1 = getActivitiesForGrade("6ème année", 1, 5);
    expect(p1j1.map(a => a.name)).toEqual(p2j1.map(a => a.name));
  });

  it("J8 should be same in Phase 1 and Phase 2", () => {
    const p1j8 = getActivitiesForGrade("6ème année", 8, 1);
    const p2j8 = getActivitiesForGrade("6ème année", 8, 5);
    expect(p1j8.map(a => a.name)).toEqual(p2j8.map(a => a.name));
  });
});

describe("4ème année - Phase 1 (M1-M4)", () => {
  it("J1 should have Mise en train, Présentation, Étude de graphies, P.E.L", () => {
    const a = getActivitiesForGrade("4ème année", 1, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toContain("Mise en train");
    expect(a[1].name).toContain("Présentation");
    expect(a[2].name).toBe("Étude de graphies");
    expect(a[3].name).toContain("P.E.L");
  });

  it("J2 should have Activité d'écoute, Expression orale, Lecture Texte 1 (compréhension), Écriture", () => {
    const a = getActivitiesForGrade("4ème année", 2, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Activité d'écoute");
    expect(a[1].name).toBe("Expression orale");
    expect(a[2].name).toBe("Lecture Texte 1 (compréhension)");
    expect(a[3].name).toBe("Écriture");
  });

  it("J4 should have 5 activities including Auto dictée and Projet", () => {
    const a = getActivitiesForGrade("4ème année", 4, 1);
    expect(a).toHaveLength(5);
    expect(a.map(x => x.name)).toContain("Auto dictée");
    expect(a.map(x => x.name)).toContain("Projet (Entraînement)");
  });

  it("J7 should have Page vocabulaire and Dictée (special day)", () => {
    const a = getActivitiesForGrade("4ème année", 7, 1);
    expect(a).toHaveLength(4);
    expect(a[2].name).toBe("Page vocabulaire");
    expect(a[3].name).toBe("Dictée");
  });

  it("J8 should have Lecture pour s'informer and Lecture pour agir", () => {
    const a = getActivitiesForGrade("4ème année", 8, 1);
    expect(a).toHaveLength(4);
    expect(a[1].name).toContain("Lecture pour s'informer");
    expect(a[2].name).toBe("Lecture pour agir");
  });

  it("odd days (J1,J3,J5,J7) should start with Mise en train", () => {
    for (const j of [1, 3, 5, 7]) {
      const a = getActivitiesForGrade("4ème année", j, 1);
      expect(a[0].name).toContain("Mise en train");
    }
  });

  it("even days (J2,J4,J6,J8) should start with Activité d'écoute", () => {
    for (const j of [2, 4, 6, 8]) {
      const a = getActivitiesForGrade("4ème année", j, 1);
      expect(a[0].name).toBe("Activité d'écoute");
    }
  });
});

describe("4ème année - Phase 2 (M5-M10)", () => {
  it("J1 Phase 2 should replace Étude de graphies with Lecture (compréhension)", () => {
    const a = getActivitiesForGrade("4ème année", 1, 5);
    expect(a[2].name).toBe("Lecture (compréhension)");
  });

  it("J2 Phase 2 should have Lecture (fonctionnement) and Orthographe", () => {
    const a = getActivitiesForGrade("4ème année", 2, 6);
    expect(a[2].name).toBe("Lecture (fonctionnement)");
    expect(a[3].name).toBe("Orthographe");
  });

  it("J4 Phase 2 should have 5 activities including Orthographe", () => {
    const a = getActivitiesForGrade("4ème année", 4, 7);
    expect(a).toHaveLength(5);
    expect(a.map(x => x.name)).toContain("Orthographe");
  });

  it("J6 Phase 2 should have 5 activities including Auto dictée", () => {
    const a = getActivitiesForGrade("4ème année", 6, 8);
    expect(a).toHaveLength(5);
    expect(a.map(x => x.name)).toContain("Auto dictée");
  });

  it("J7 and J8 should be same in Phase 1 and Phase 2", () => {
    const p1j7 = getActivitiesForGrade("4ème année", 7, 1);
    const p2j7 = getActivitiesForGrade("4ème année", 7, 5);
    expect(p1j7.map(a => a.name)).toEqual(p2j7.map(a => a.name));
  });
});

describe("5ème année - Modules Impairs (1,3,5,7)", () => {
  it("J1 should have Présentation, Carte d'exploration, Lecture (1) Compréhension, Grammaire", () => {
    const a = getActivitiesForGrade("5ème année", 1, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toContain("Présentation du module");
    expect(a[1].name).toContain("Élaboration de la carte");
    expect(a[2].name).toBe("Lecture Texte (1) Compréhension");
    expect(a[3].name).toBe("Grammaire");
  });

  it("J2 should have only 3 activities (no Mise en train!)", () => {
    const a = getActivitiesForGrade("5ème année", 2, 1);
    expect(a).toHaveLength(3);
    expect(a[0].name).toBe("Expression orale");
    expect(a[1].name).toBe("Lecture Texte (1) Fonctionnement");
    expect(a[2].name).toContain("Projet d'écriture");
  });

  it("J4 should have Auto-dictée, Conjugaison, Lecture suivie, Lecture-action", () => {
    const a = getActivitiesForGrade("5ème année", 4, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Auto-dictée");
    expect(a[1].name).toBe("Conjugaison");
    expect(a[2].name).toBe("Lecture suivie");
    expect(a[3].name).toBe("Lecture-action");
  });

  it("J7 should have Orthographe, Page vocabulaire, Projet (production en groupe)", () => {
    const a = getActivitiesForGrade("5ème année", 7, 1);
    expect(a).toHaveLength(3);
    expect(a[0].name).toBe("Orthographe");
    expect(a[1].name).toBe("Page vocabulaire");
    expect(a[2].name).toContain("production en groupe");
  });

  it("J8 should have Dictée, Projet (remédiation), Bibliothèque", () => {
    const a = getActivitiesForGrade("5ème année", 8, 1);
    expect(a).toHaveLength(3);
    expect(a[0].name).toBe("Dictée");
    expect(a[1].name).toContain("remédiation");
    expect(a[2].name).toBe("Bibliothèque de classe");
  });
});

describe("5ème année - Modules Pairs (2,4,6,8)", () => {
  it("J5 Pairs should have Projet (production individuelle) instead of (entraînement)", () => {
    const impairs = getActivitiesForGrade("5ème année", 5, 1);
    const pairs = getActivitiesForGrade("5ème année", 5, 2);
    expect(impairs[2].name).toContain("entraînement");
    expect(pairs[2].name).toContain("production individuelle");
  });

  it("J7 Pairs should have Projet (remédiation) instead of (production en groupe)", () => {
    const impairs = getActivitiesForGrade("5ème année", 7, 1);
    const pairs = getActivitiesForGrade("5ème année", 7, 2);
    expect(impairs[2].name).toContain("production en groupe");
    expect(pairs[2].name).toContain("remédiation");
  });

  it("J8 Pairs should have Projet (réécriture et finalisation)", () => {
    const pairs = getActivitiesForGrade("5ème année", 8, 2);
    expect(pairs[1].name).toContain("réécriture et finalisation");
  });

  it("J1-J4 should be same for Impairs and Pairs", () => {
    for (const j of [1, 2, 3, 4]) {
      const imp = getActivitiesForGrade("5ème année", j, 1);
      const par = getActivitiesForGrade("5ème année", j, 2);
      expect(imp.map(a => a.name)).toEqual(par.map(a => a.name));
    }
  });
});

describe("3ème année", () => {
  it("J1 should have Communication orale, Poème/chant, Lecture, Écriture", () => {
    const a = getActivitiesForGrade("3ème année", 1, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Communication orale");
    expect(a[1].name).toBe("Poème/chant");
    expect(a[2].name).toBe("Lecture");
    expect(a[3].name).toBe("Écriture");
  });

  it("J2 should have Communication orale, Phonétique, Lecture, Copie", () => {
    const a = getActivitiesForGrade("3ème année", 2, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Communication orale");
    expect(a[1].name).toBe("Phonétique");
    expect(a[2].name).toBe("Lecture");
    expect(a[3].name).toBe("Copie");
  });

  it("J4 should have Lecture (intégration) and Initiation à la production", () => {
    const a = getActivitiesForGrade("3ème année", 4, 1);
    expect(a).toHaveLength(4);
    expect(a[2].name).toBe("Lecture (intégration)");
    expect(a[3].name).toBe("Initiation à la production");
  });

  it("J7 should have Dictée, Vocabulaire, Abécédaire (special day)", () => {
    const a = getActivitiesForGrade("3ème année", 7, 1);
    expect(a).toHaveLength(4);
    expect(a[1].name).toBe("Dictée");
    expect(a[2].name).toBe("Vocabulaire");
    expect(a[3].name).toBe("Abécédaire");
  });

  it("J8 should have Poème/chant, Lecture documentaire, Lecture action, Chrono-syllabes", () => {
    const a = getActivitiesForGrade("3ème année", 8, 1);
    expect(a).toHaveLength(4);
    expect(a[0].name).toBe("Poème/chant");
    expect(a[1].name).toBe("Lecture documentaire");
    expect(a[2].name).toBe("Lecture action");
    expect(a[3].name).toBe("Chrono-syllabes");
  });

  it("odd days (J1,J3,J5) should have Poème/chant as 2nd activity", () => {
    for (const j of [1, 3, 5]) {
      const a = getActivitiesForGrade("3ème année", j, 1);
      expect(a[1].name).toBe("Poème/chant");
    }
  });

  it("even days (J2,J4,J6) should have Phonétique as 2nd activity", () => {
    for (const j of [2, 4, 6]) {
      const a = getActivitiesForGrade("3ème année", j, 1);
      expect(a[1].name).toBe("Phonétique");
    }
  });

  it("all days should start with Communication orale except J8", () => {
    for (const j of [1, 2, 3, 4, 5, 6, 7]) {
      const a = getActivitiesForGrade("3ème année", j, 1);
      expect(a[0].name).toBe("Communication orale");
    }
    const j8 = getActivitiesForGrade("3ème année", 8, 1);
    expect(j8[0].name).toBe("Poème/chant");
  });

  it("3ème has no phase distinction - module number doesn't affect activities", () => {
    const m1 = getActivitiesForGrade("3ème année", 1, 1);
    const m5 = getActivitiesForGrade("3ème année", 1, 5);
    expect(m1.map(a => a.name)).toEqual(m5.map(a => a.name));
  });
});

describe("Cross-grade validation", () => {
  it("3ème has completely different structure from 4ème", () => {
    const g3j1 = getActivitiesForGrade("3ème année", 1, 1);
    const g4j1 = getActivitiesForGrade("4ème année", 1, 1);
    expect(g3j1[0].name).toBe("Communication orale");
    expect(g4j1[0].name).toContain("Mise en train");
  });

  it("5ème has completely different structure from 4ème", () => {
    const g5j1 = getActivitiesForGrade("5ème année", 1, 1);
    const g4j1 = getActivitiesForGrade("4ème année", 1, 1);
    expect(g5j1[0].name).not.toBe(g4j1[0].name);
  });

  it("5ème J2 has 3 activities, 4ème J2 has 4", () => {
    const g5 = getActivitiesForGrade("5ème année", 2, 1);
    const g4 = getActivitiesForGrade("4ème année", 2, 1);
    expect(g5).toHaveLength(3);
    expect(g4).toHaveLength(4);
  });

  it("6ème J1 has 4 activities, 4ème J1 has 4, but different names", () => {
    const g6 = getActivitiesForGrade("6ème année", 1, 1);
    const g4 = getActivitiesForGrade("4ème année", 1, 1);
    expect(g6).toHaveLength(4);
    expect(g4).toHaveLength(4);
    expect(g6[0].name).not.toBe(g4[0].name);
  });

  it("all 4 grades should have activities for all 8 journées", () => {
    for (const niveau of ["3ème année", "4ème année", "5ème année", "6ème année"]) {
      for (let j = 1; j <= 8; j++) {
        const a = getActivitiesForGrade(niveau, j, 1);
        expect(a.length).toBeGreaterThan(0);
        for (const act of a) {
          expect(act.mandatorySteps.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("invalid journee should fallback to J1", () => {
    const g6 = getActivitiesForGrade("6ème année", 99);
    const g6j1 = getActivitiesForGrade("6ème année", 1);
    expect(g6.map(a => a.name)).toEqual(g6j1.map(a => a.name));
  });

  it("3ème invalid journee should fallback to J1", () => {
    const g3 = getActivitiesForGrade("3ème année", 99);
    const g3j1 = getActivitiesForGrade("3ème année", 1);
    expect(g3.map(a => a.name)).toEqual(g3j1.map(a => a.name));
  });
});

describe("Table structure", () => {
  it("6ème should return 6eme structure", () => {
    expect(getTableStructure("6ème année")).toBe("6eme");
  });

  it("4ème should return 3_5eme structure", () => {
    expect(getTableStructure("4ème année")).toBe("3_5eme");
  });

  it("5ème should return 3_5eme structure", () => {
    expect(getTableStructure("5ème année")).toBe("3_5eme");
  });

  it("3ème should return 3_5eme structure", () => {
    expect(getTableStructure("3ème année")).toBe("3_5eme");
  });
});
