import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { repartitionJournaliere, servicePermissions, referenceContent } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { htmlToPdf } from "../lib/htmlToPdf";
import { generateRepartitionDocx } from "../lib/repartitionDocx";
import { storagePut } from "../storage";

// =====================================================================
// GRADE-SPECIFIC ACTIVITY CONFIGURATIONS (OFFICIAL TUNISIAN CURRICULUM)
// =====================================================================

// Activity type definition
interface ActivityConfig {
  name: string;
  duration?: string; // Only for 6ème année
  mandatorySteps: string[];
  objectifPrefix?: string;
}

// 6ème année: 5 columns with timing and Remarques
const ACTIVITIES_6EME: Record<string, ActivityConfig[]> = {
  "1": [ // J1
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Grammaire", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "2": [ // J2
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "3": [ // J3
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Orthographe", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "4": [ // J4
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [ // J5
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Grammaire", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "6": [ // J6 - similar to J2 pattern (Mise en train + Communication orale + Lecture fonctionnement + Conjugaison)
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Communication orale", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Conjugaison", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "7": [ // J7 - similar to J3 pattern (Communication orale + Lecture + Orthographe)
    { name: "Communication orale", duration: "35 mn", mandatorySteps: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], objectifPrefix: "Communiquer en situation pour :" },
    { name: "Lecture", duration: "45 mn", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Orthographe", duration: "35 mn", mandatorySteps: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"] },
  ],
  "8": [ // J8 - Journée d'intégration et d'évaluation
    { name: "Mise en train", mandatorySteps: ["Présentation", "Audition", "Évaluation"], objectifPrefix: "L'élève serait capable de" },
    { name: "Lecture fonctionnement", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet d'écriture", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
};

// 3ème-5ème année: TWO PHASES based on official guide (p.17)
// Phase 1 (M1-M4): Uses "Étude de graphies" and "Lecture-phrases/textes"
// Phase 2 (M5-M10): Replaces "Étude de graphies" with "Orthographe" and uses "Lecture (compréhension/fonctionnement)"

// Phase 1: Modules 1 à 4
const ACTIVITIES_3_5EME_PHASE1: Record<string, ActivityConfig[]> = {
  "1": [ // J1 - Poème et/ou chant
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Présentation du projet et du module", mandatorySteps: ["Exploration/anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "2": [ // J2 - Activité d'écoute
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte 1 (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
  ],
  "3": [ // J3 - Poème et/ou chant
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation n° 1", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "4": [ // J4 - Activité d'écoute
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture Texte 1 (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
    { name: "Projet (Entraînement)", mandatorySteps: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [ // J5 - Poème et/ou chant
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Étude de graphies", mandatorySteps: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "6": [ // J6 - Activité d'écoute
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture Texte 2 (compréhension et fonctionnement)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Exploitation des exercices", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
  ],
  "7": [ // J7 - Poème et/ou chant - SPÉCIAL: vocabulaire + dictée
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Page vocabulaire", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
  ],
  "8": [ // J8 - Activité d'écoute - SPÉCIAL: lecture pour s'informer/agir + projet
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture pour s'informer (page documentaire)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Lecture pour agir", mandatorySteps: ["Découverte", "Compréhension", "Exécution", "Évaluation"] },
    { name: "Projet (Entraînement ou Production)", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Production", "Évaluation"] },
  ],
};

// Phase 2: Modules 5 à 10 (replaces "Étude de graphies" with "Orthographe")
const ACTIVITIES_3_5EME_PHASE2: Record<string, ActivityConfig[]> = {
  "1": [ // J1 - Poème et/ou chant
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Présentation du projet et du module", mandatorySteps: ["Exploration/anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
    { name: "Lecture (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "2": [ // J2 - Activité d'écoute
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique", "Fixation", "Évaluation"] },
  ],
  "3": [ // J3 - Poème et/ou chant
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation n° 1", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "4": [ // J4 - Activité d'écoute
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Orthographe", mandatorySteps: ["Exploration", "Apprentissage systématique", "Fixation", "Évaluation"] },
    { name: "Projet (Entraînement)", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"] },
  ],
  "5": [ // J5 - Poème et/ou chant
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (compréhension)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "P.E.L (Pratique Écrite de la Langue)", mandatorySteps: ["Manipulation-exploration", "Manipulation-fixation"] },
  ],
  "6": [ // J6 - Activité d'écoute
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Expression orale", mandatorySteps: ["Exploration", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Lecture (fonctionnement)", mandatorySteps: ["Rappel", "Relecture", "Exploitation des exercices", "Évaluation"] },
    { name: "Écriture", mandatorySteps: ["Présentation", "Entraînement", "Écriture"] },
    { name: "Auto dictée", mandatorySteps: ["Diction", "Reproduction de mémoire", "Correction collective", "Correction individuelle"] },
  ],
  "7": [ // J7 - Poème et/ou chant - SPÉCIAL: vocabulaire + dictée
    { name: "Mise en train (Poème/Chant)", mandatorySteps: ["Audition", "Compréhension", "Évaluation"] },
    { name: "Expression orale", mandatorySteps: ["Reprise de la situation", "Apprentissage systématique/Structuré", "Intégration", "Évaluation"] },
    { name: "Page vocabulaire", mandatorySteps: ["Découverte", "Exploitation", "Fixation", "Évaluation"] },
    { name: "Dictée", mandatorySteps: ["Préparation", "Diction", "Correction collective", "Correction individuelle"] },
  ],
  "8": [ // J8 - Activité d'écoute - SPÉCIAL: lecture pour s'informer/agir + projet
    { name: "Activité d'écoute", mandatorySteps: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
    { name: "Lecture pour s'informer (page documentaire)", mandatorySteps: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
    { name: "Lecture pour agir", mandatorySteps: ["Découverte", "Compréhension", "Exécution", "Évaluation"] },
    { name: "Projet (Entraînement ou Production)", mandatorySteps: ["Exploration", "Exploitation de l'outil d'aide", "Production", "Évaluation"] },
  ],
};

// Backward compatibility alias
const ACTIVITIES_3_5EME = ACTIVITIES_3_5EME_PHASE1;

function getActivitiesForGrade(niveau: string, journee: number, moduleNum?: number): ActivityConfig[] {
  const j = String(journee);
  if (niveau === "6ème année") {
    return ACTIVITIES_6EME[j] || ACTIVITIES_6EME["1"];
  }
  // 3ème, 4ème, 5ème: choose Phase 1 (M1-M4) or Phase 2 (M5-M10) based on module number
  const mod = moduleNum || 1;
  if (mod >= 5) {
    return ACTIVITIES_3_5EME_PHASE2[j] || ACTIVITIES_3_5EME_PHASE2["1"];
  }
  return ACTIVITIES_3_5EME_PHASE1[j] || ACTIVITIES_3_5EME_PHASE1["1"];
}

function getTableStructure(niveau: string): "6eme" | "3_5eme" {
  return niveau === "6ème année" ? "6eme" : "3_5eme";
}

// ===== RÉPARTITION JOURNALIÈRE ROUTER =====
export const repartitionJournaliereRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
  }),

  // ===== GET GRADE CONFIG =====
  getGradeConfig: protectedProcedure
    .input(z.object({
      niveau: z.string(),
      journeeNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(10).optional(),
    }))
    .query(({ input }) => {
      const activities = getActivitiesForGrade(input.niveau, input.journeeNumber, input.moduleNumber);
      const tableStructure = getTableStructure(input.niveau);
      return {
        activities: activities.map(a => ({
          name: a.name,
          duration: a.duration || "",
          mandatorySteps: a.mandatorySteps,
          objectifPrefix: a.objectifPrefix || "",
        })),
        tableStructure,
        hasRemarques: tableStructure === "6eme",
        hasObjectifSpecifique: tableStructure === "3_5eme",
        hasTiming: tableStructure === "6eme",
      };
    }),

  // ===== GET HISTORY =====
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const limit = input?.limit || 20;
      const offset = input?.offset || 0;
      const items = await database.select().from(repartitionJournaliere)
        .where(eq(repartitionJournaliere.userId, ctx.user.id))
        .orderBy(desc(repartitionJournaliere.createdAt))
        .limit(limit).offset(offset);
      const [{ total }] = await database.select({ total: count() }).from(repartitionJournaliere)
        .where(eq(repartitionJournaliere.userId, ctx.user.id));
      return { items, total };
    }),

  // ===== GENERATE RÉPARTITION =====
  generate: protectedProcedure
    .input(z.object({
      uniteNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(8),
      journeeNumber: z.number().min(1).max(8),
      niveau: z.string().default("6ème année"),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      sousTheme: z.string().optional(),
      // Activity-specific inputs (dynamic based on grade/day)
      activityInputs: z.array(z.object({
        activityName: z.string(),
        objet: z.string(),
        objectifDetails: z.string().optional(),
        objectifSpecifique: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;

      // Insert pending record
      const [inserted] = await database.insert(repartitionJournaliere).values({
        userId: ctx.user.id,
        uniteNumber: input.uniteNumber,
        moduleNumber: input.moduleNumber,
        journeeNumber: input.journeeNumber,
        niveau: input.niveau,
        dateFrom: input.dateFrom || "",
        dateTo: input.dateTo || "",
        sousTheme: input.sousTheme || "",
        status: "pending",
      });

      const recordId = inserted.insertId;
      const gradeConfig = getActivitiesForGrade(input.niveau, input.journeeNumber, input.moduleNumber);
      const tableStructure = getTableStructure(input.niveau);

      try {
        // Build the activity descriptions for the LLM prompt
        const activityDescriptions = gradeConfig.map((config, idx) => {
          const userInput = input.activityInputs[idx];
          return `${idx + 1}. ${config.name}${config.duration ? ` (${config.duration})` : ""} :
   • Objet/Contenu : ${userInput?.objet || "(à déterminer par l'IA)"}
   ${userInput?.objectifDetails ? `• Précisions sur l'objectif : ${userInput.objectifDetails}` : "• Formule un objectif pédagogique adapté."}
   ${userInput?.objectifSpecifique ? `• Objectif spécifique : ${userInput.objectifSpecifique}` : ""}
   • Étapes OBLIGATOIRES : ${config.mandatorySteps.join(", ")}`;
        }).join("\n\n");

        // Build JSON schema for response
        const activitySchema = {
          type: "object" as const,
          properties: {
            activityName: { type: "string" as const },
            duration: { type: "string" as const },
            objet: { type: "string" as const },
            objectifSpecifique: { type: "string" as const },
            objectif: { type: "string" as const },
            etapes: { type: "array" as const, items: { type: "string" as const } },
            remarques: { type: "string" as const },
          },
          required: ["activityName", "duration", "objet", "objectifSpecifique", "objectif", "etapes", "remarques"] as const,
          additionalProperties: false as const,
        };

        const systemPrompt = `Tu es un EXPERT PÉDAGOGIQUE spécialisé dans le curriculum officiel tunisien de la langue française pour le cycle primaire.
Tu dois générer une "Répartition Journalière" (التوزيع اليومي) en respectant STRICTEMENT le format officiel tunisien.

═══════════════════════════════════════════════
RÈGLES ABSOLUES — AUCUNE EXCEPTION PERMISE :
═══════════════════════════════════════════════

1. LANGUE : Tout le contenu DOIT être en FRANÇAIS uniquement.

2. NIVEAU : ${input.niveau} — adapte le vocabulaire et la complexité en conséquence.

3. STRUCTURE DU TABLEAU : ${tableStructure === "6eme" 
  ? "5 colonnes : Activités (avec durée), Objet (contenu), Objectif de la séance, Étapes, Remarques"
  : "5 colonnes : Activités, Objets, Objectifs spécifiques, Objectif de la séance, Étapes"}

4. OBJECTIFS :
   - "Objectif de la séance" : commence par "L'élève serait capable de..." suivi d'un verbe d'action mesurable.
   ${tableStructure === "3_5eme" ? '- "Objectifs spécifiques" : objectifs généraux du programme officiel pour cette activité (ex: "Discriminer auditivement les phonèmes-graphèmes", "Conjuguer des verbes au présent").' : ""}
   ${tableStructure === "6eme" ? '- "Remarques" : notes pédagogiques utiles (supports, différenciation, évaluation formative). Si aucune, laisser vide.' : ""}

5. ÉTAPES PÉDAGOGIQUES : Les étapes sont FIXES et IMMUABLES pour chaque activité. Ne les modifie JAMAIS.

6. TERMINOLOGIE OFFICIELLE :
   - P.E.L = Pratique Écrite de la Langue (regroupe : Grammaire, Conjugaison, Orthographe)
   - Pour l'activité P.E.L, le contenu (Objet) doit porter sur un point de grammaire, conjugaison ou orthographe selon le programme.
   ${input.niveau !== "6ème année" ? `
7. PHASES DU PROGRAMME (4ème année) :
   - Phase 1 (Modules 1-4) : utilise "Étude de graphies" et "Lecture-phrases/textes"
   - Phase 2 (Modules 5-10) : remplace "Étude de graphies" par "Orthographe" et utilise "Lecture (compréhension/fonctionnement)"
   - Module actuel : ${input.moduleNumber} (${input.moduleNumber <= 4 ? 'Phase 1' : 'Phase 2'})
   - J7 est spécial : Expression orale + Page vocabulaire + Dictée (PAS d'Étude de graphies ni P.E.L)
   - J8 est spécial : Lecture pour s'informer + Lecture pour agir + Projet
   - Jours impairs (J1,J3,J5,J7) : commencent par Poème et/ou chant (Mise en train)
   - Jours pairs (J2,J4,J6,J8) : commencent par Activité d'écoute` : ''}

8. ACTIVITÉS : Exactement ${gradeConfig.length} activités dans cet ordre :
${gradeConfig.map((a, i) => `   ${i + 1}. ${a.name}${a.duration ? ` (${a.duration})` : ""}`).join("\n")}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "activities": [
    {
      "activityName": "...",
      "duration": "${tableStructure === "6eme" ? "XX mn" : ""}",
      "objet": "...",
      "objectifSpecifique": "${tableStructure === "3_5eme" ? "..." : ""}",
      "objectif": "L'élève serait capable de ...",
      "etapes": ["étape1", "étape2", ...],
      "remarques": "${tableStructure === "6eme" ? "..." : ""}"
    }
  ]
}`;

        const userPrompt = `Génère une Répartition Journalière STRICTEMENT conforme au curriculum tunisien pour :

══════════════════════════════════════
  Unité d'apprentissage n° ${input.uniteNumber}
  Module ${input.moduleNumber} — Journée ${input.journeeNumber}
  Niveau : ${input.niveau}
  ${input.sousTheme ? `Sous-thème : ${input.sousTheme}` : ""}
══════════════════════════════════════

ACTIVITÉS DEMANDÉES :

${activityDescriptions}

RAPPEL CRITIQUE :
- Les étapes pédagogiques sont FIXES et IMMUABLES — ne les modifie JAMAIS.
- Le contenu doit être en FRANÇAIS uniquement.
- Les objectifs doivent être précis, mesurables et adaptés au niveau ${input.niveau}.
- Chaque activité doit avoir un "objectif de la séance" commençant par "L'élève serait capable de..."`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "repartition_journaliere",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  activities: {
                    type: "array",
                    items: activitySchema,
                  },
                },
                required: ["activities"],
                additionalProperties: false,
              },
            },
          },
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) throw new Error("No response from LLM");
        const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
        const parsed = JSON.parse(content);
        const activities = parsed.activities;

        // ===== CRITICAL: ENFORCE MANDATORY STEPS (NEVER TRUST LLM ALONE) =====
        const orderedActivities = gradeConfig.map((config, idx) => {
          const llmActivity = activities[idx] || activities.find((a: any) => 
            a.activityName.toLowerCase().includes(config.name.toLowerCase().split(" ")[0])
          );
          
          const userInput = input.activityInputs[idx];

          return {
            activityName: config.name,
            duration: config.duration || "",
            objet: llmActivity?.objet || userInput?.objet || "",
            objectifSpecifique: llmActivity?.objectifSpecifique || userInput?.objectifSpecifique || "",
            objectif: llmActivity?.objectif || `L'élève serait capable de ${userInput?.objectifDetails || "réaliser les tâches demandées."}`,
            etapes: [...config.mandatorySteps], // ALWAYS use official steps
            remarques: llmActivity?.remarques || "",
          };
        });

        // Update record
        await database.update(repartitionJournaliere)
          .set({
            activities: orderedActivities,
            generatedContent: JSON.stringify({ activities: orderedActivities, tableStructure }),
            status: "completed",
          })
          .where(eq(repartitionJournaliere.id, Number(recordId)));

        return {
          id: Number(recordId),
          activities: orderedActivities,
          tableStructure,
          uniteNumber: input.uniteNumber,
          moduleNumber: input.moduleNumber,
          journeeNumber: input.journeeNumber,
          niveau: input.niveau,
          sousTheme: input.sousTheme,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
        };
      } catch (error: any) {
        await database.update(repartitionJournaliere)
          .set({ status: "failed" })
          .where(eq(repartitionJournaliere.id, Number(recordId)));
        throw error;
      }
    }),

  // ===== EXPORT PDF =====
  exportPdf: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const [record] = await database.select().from(repartitionJournaliere)
        .where(and(
          eq(repartitionJournaliere.id, input.id),
          eq(repartitionJournaliere.userId, ctx.user.id),
        ));

      if (!record) throw new Error("Record not found");
      if (!record.activities) throw new Error("No activities data");

      const activities = record.activities as any[];
      const generatedData = record.generatedContent ? JSON.parse(record.generatedContent) : {};
      const tableStructure = generatedData.tableStructure || (record.niveau === "6ème année" ? "6eme" : "3_5eme");
      const is6eme = tableStructure === "6eme";

      // Build header HTML based on grade
      const headerHtml = is6eme ? `
        <div class="header">
          <div class="header-row">
            <span><span class="header-label">Unité d'apprentissage n°</span> <span class="header-value">${record.uniteNumber}</span></span>
            <span><span class="header-label">Date :</span> <span class="header-value">de ${record.dateFrom || "……"} à ${record.dateTo || "……"}</span></span>
          </div>
          <div class="header-row">
            <span><span class="header-label">Niveau :</span> <span class="header-value">${record.niveau}</span></span>
          </div>
          <div class="header-row">
            <span><span class="header-label">Module ${record.moduleNumber}</span> — <span class="header-label">Journée ${record.journeeNumber}</span></span>
          </div>
        </div>
      ` : `
        <table class="header-table">
          <tr>
            <td style="width:40%">
              <strong>Unité : ${record.uniteNumber}</strong> / Module : ${record.moduleNumber} / Journée : ${record.journeeNumber}
              ${record.sousTheme ? `<br>Sous thème : ${record.sousTheme}` : ""}
            </td>
            <td style="width:30%; text-align:center">
              ……………… ………… ………………
            </td>
            <td style="width:30%; text-align:right">
              ${record.niveau}<br>De ${record.dateFrom || "……"} à ${record.dateTo || "……"}
            </td>
          </tr>
        </table>
      `;

      // Build table columns based on grade
      const tableHeaders = is6eme
        ? `<th style="width:14%">Activités</th>
           <th style="width:20%">Objet (contenu)</th>
           <th style="width:26%">Objectif de la séance</th>
           <th style="width:25%">Étapes</th>
           <th style="width:15%">Remarques</th>`
        : `<th style="width:16%">Activités</th>
           <th style="width:18%">Objets</th>
           <th style="width:22%">Objectifs spécifiques</th>
           <th style="width:22%">Objectif de la séance</th>
           <th style="width:22%">Étapes</th>`;

      const tableRows = activities.map((a: any) => {
        if (is6eme) {
          return `<tr>
            <td class="activity-cell">
              ${a.activityName}
              ${a.duration ? `<br><span class="duration-badge">${a.duration}</span>` : ""}
            </td>
            <td>${a.objet}</td>
            <td>${a.objectif}</td>
            <td>
              <ul class="etapes-list">
                ${a.etapes.map((e: string) => `<li>${e}</li>`).join("")}
              </ul>
            </td>
            <td>${a.remarques || ""}</td>
          </tr>`;
        } else {
          return `<tr>
            <td class="activity-cell">${a.activityName}</td>
            <td>${a.objet}</td>
            <td>${a.objectifSpecifique || ""}</td>
            <td>${a.objectif}</td>
            <td>
              <ul class="etapes-list">
                ${a.etapes.map((e: string) => `<li>${e}</li>`).join("")}
              </ul>
            </td>
          </tr>`;
        }
      }).join("");

      const html = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      direction: ltr;
      text-align: left;
      padding: 15mm 15mm;
    }
    .header {
      border: 2px solid #2c5282;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      background: #f0f5ff;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .header-row:last-child { margin-bottom: 0; }
    .header-label { font-weight: 700; color: #2c5282; font-size: 11pt; }
    .header-value { font-size: 11pt; }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border: 2px solid #2c5282;
    }
    .header-table td {
      padding: 8px 10px;
      border: 1px solid #a0aec0;
      font-size: 10pt;
      vertical-align: top;
    }
    table.main-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      border: 2px solid #2c5282;
    }
    th {
      background: #2c5282;
      color: white;
      padding: 8px 6px;
      font-size: 10pt;
      font-weight: 700;
      text-align: center;
      border: 1px solid #1a365d;
    }
    td {
      padding: 8px 6px;
      border: 1px solid #a0aec0;
      vertical-align: top;
      font-size: 9.5pt;
      line-height: 1.5;
    }
    tr:nth-child(even) td { background: #f7fafc; }
    .activity-cell {
      font-weight: 700;
      color: #2c5282;
      text-align: center;
    }
    .duration-badge {
      display: inline-block;
      background: #ebf4ff;
      color: #2c5282;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 8.5pt;
      font-weight: 600;
      margin-top: 4px;
    }
    .etapes-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .etapes-list li {
      padding: 1px 0;
      position: relative;
      padding-left: 14px;
      font-size: 9pt;
    }
    .etapes-list li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: #2c5282;
      font-weight: 700;
    }
    .footer {
      margin-top: 16px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 8pt;
      color: #718096;
    }
    .footer .brand { font-weight: 700; color: #2c5282; }
  </style>
</head>
<body>
  ${headerHtml}

  <table class="main-table">
    <thead>
      <tr>${tableHeaders}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    <span class="brand">Leader Academy</span> — المساعد البيداغوجي الذكي — نسخة تونس 2026
  </div>
</body>
</html>`;

      const s3Key = `repartition-pdf/${ctx.user.id}/${record.id}-${Date.now()}.pdf`;
      const result = await htmlToPdf(html, s3Key, {
        margins: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
      });

      // Save PDF URL
      await database.update(repartitionJournaliere)
        .set({ pdfUrl: result.url })
        .where(eq(repartitionJournaliere.id, input.id));

      return { url: result.url };
    }),

  // ===== EXPORT DOCX =====
  exportDocx: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const [record] = await database.select().from(repartitionJournaliere)
        .where(and(
          eq(repartitionJournaliere.id, input.id),
          eq(repartitionJournaliere.userId, ctx.user.id),
        ));

      if (!record) throw new Error("Record not found");
      if (!record.activities) throw new Error("No activities data");

      const generatedData = record.generatedContent ? JSON.parse(record.generatedContent) : {};
      const tableStructure = generatedData.tableStructure || (record.niveau === "6ème année" ? "6eme" : "3_5eme");

      const docxBuffer = await generateRepartitionDocx({
        niveau: record.niveau,
        uniteNumber: record.uniteNumber,
        moduleNumber: record.moduleNumber,
        journeeNumber: record.journeeNumber,
        dateFrom: record.dateFrom || undefined,
        dateTo: record.dateTo || undefined,
        sousTheme: record.sousTheme || undefined,
        activities: record.activities as any[],
        tableStructure,
      });

      const s3Key = `repartition-docx/${ctx.user.id}/${record.id}-${Date.now()}.docx`;
      const result = await storagePut(s3Key, docxBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

      return { url: result.url };
    }),

  // ===== DELETE =====
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      await database.delete(repartitionJournaliere)
        .where(and(
          eq(repartitionJournaliere.id, input.id),
          eq(repartitionJournaliere.userId, ctx.user.id),
        ));
      return { success: true };
    }),
});
