import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { referenceContent } from "../../drizzle/schema";
import { eq, and, count, asc } from "drizzle-orm";

// ===== Activity schema for validation =====
const activitySchema = z.object({
  activityName: z.string().min(1),
  objet: z.string().min(1),
  objectifSpecifique: z.string().optional(),
  objectif: z.string().min(1),
  etapes: z.array(z.string()).min(1),
  remarques: z.string().optional(),
  duration: z.string().optional(),
});

// ===== REFERENCE CONTENT ROUTER (Smart Autofill System) =====
// Manages official Tunisian curriculum content for Répartition Journalière
// Uses flexible JSON activities array to support all grade levels (3ème-6ème)
export const referenceContentRouter = router({

  // ===== LIST ALL REFERENCE CONTENT =====
  list: protectedProcedure
    .input(z.object({
      niveau: z.string().optional(),
      uniteNumber: z.number().min(1).max(8).optional(),
      moduleNumber: z.number().min(1).max(8).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const conditions = [];
      if (input?.niveau) conditions.push(eq(referenceContent.niveau, input.niveau));
      if (input?.uniteNumber) conditions.push(eq(referenceContent.uniteNumber, input.uniteNumber));
      if (input?.moduleNumber) conditions.push(eq(referenceContent.moduleNumber, input.moduleNumber));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const limit = input?.limit || 50;
      const offset = input?.offset || 0;

      const items = await database.select().from(referenceContent)
        .where(whereClause)
        .orderBy(asc(referenceContent.niveau), asc(referenceContent.uniteNumber), asc(referenceContent.moduleNumber), asc(referenceContent.journeeNumber))
        .limit(limit).offset(offset);

      const [{ total }] = await database.select({ total: count() }).from(referenceContent)
        .where(whereClause);

      return { items, total };
    }),

  // ===== GET SINGLE REFERENCE CONTENT =====
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const [item] = await database.select().from(referenceContent)
        .where(eq(referenceContent.id, input.id)).limit(1);
      return item || null;
    }),

  // ===== SMART AUTOFILL: GET BY NIVEAU/UNITÉ/MODULE/JOURNÉE =====
  // This is the main endpoint for the Smart Autofill System
  getByKey: publicProcedure
    .input(z.object({
      niveau: z.string(),
      uniteNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(8),
      journeeNumber: z.number().min(1).max(5),
    }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const [item] = await database.select().from(referenceContent)
        .where(and(
          eq(referenceContent.niveau, input.niveau),
          eq(referenceContent.uniteNumber, input.uniteNumber),
          eq(referenceContent.moduleNumber, input.moduleNumber),
          eq(referenceContent.journeeNumber, input.journeeNumber),
        )).limit(1);
      return item || null;
    }),

  // ===== CHECK AVAILABILITY: Does reference data exist for this combination? =====
  checkAvailability: publicProcedure
    .input(z.object({
      niveau: z.string(),
      uniteNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(8),
    }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const items = await database.select({
        journeeNumber: referenceContent.journeeNumber,
      }).from(referenceContent)
        .where(and(
          eq(referenceContent.niveau, input.niveau),
          eq(referenceContent.uniteNumber, input.uniteNumber),
          eq(referenceContent.moduleNumber, input.moduleNumber),
        ))
        .orderBy(asc(referenceContent.journeeNumber));

      const availableJournees = items.map(i => i.journeeNumber);
      return {
        hasData: availableJournees.length > 0,
        availableJournees,
        totalJournees: availableJournees.length,
      };
    }),

  // ===== CREATE REFERENCE CONTENT =====
  create: protectedProcedure
    .input(z.object({
      niveau: z.string(),
      uniteNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(8),
      journeeNumber: z.number().min(1).max(5),
      sousTheme: z.string().optional(),
      activities: z.array(activitySchema).min(1),
      isOfficial: z.boolean().default(true),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;

      // Check if entry already exists
      const [existing] = await database.select().from(referenceContent)
        .where(and(
          eq(referenceContent.niveau, input.niveau),
          eq(referenceContent.uniteNumber, input.uniteNumber),
          eq(referenceContent.moduleNumber, input.moduleNumber),
          eq(referenceContent.journeeNumber, input.journeeNumber),
        )).limit(1);

      if (existing) {
        throw new Error(`Un contenu de référence existe déjà pour ${input.niveau} U${input.uniteNumber}-M${input.moduleNumber}-J${input.journeeNumber}. Utilisez la modification.`);
      }

      const [inserted] = await database.insert(referenceContent).values({
        niveau: input.niveau,
        uniteNumber: input.uniteNumber,
        moduleNumber: input.moduleNumber,
        journeeNumber: input.journeeNumber,
        sousTheme: input.sousTheme || null,
        activities: input.activities,
        isOfficial: input.isOfficial,
        source: input.source || "Programme officiel tunisien",
        notes: input.notes || null,
        addedBy: ctx.user.id,
      });

      return { id: inserted.insertId, success: true };
    }),

  // ===== UPDATE REFERENCE CONTENT =====
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      sousTheme: z.string().optional(),
      activities: z.array(activitySchema).min(1).optional(),
      isOfficial: z.boolean().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const { id, ...updates } = input;

      const cleanUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) cleanUpdates[key] = value;
      }

      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error("Aucune modification fournie.");
      }

      await database.update(referenceContent)
        .set(cleanUpdates)
        .where(eq(referenceContent.id, id));

      return { success: true };
    }),

  // ===== DELETE REFERENCE CONTENT =====
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      await database.delete(referenceContent)
        .where(eq(referenceContent.id, input.id));
      return { success: true };
    }),

  // ===== GET STATISTICS =====
  getStats: protectedProcedure
    .query(async () => {
      const database = (await getDb())!;
      const [{ total }] = await database.select({ total: count() }).from(referenceContent);

      const allItems = await database.select({
        niveau: referenceContent.niveau,
        unite: referenceContent.uniteNumber,
        module: referenceContent.moduleNumber,
      }).from(referenceContent);

      const niveaux = new Set(allItems.map(i => i.niveau));
      const unites = new Set(allItems.map(i => `${i.niveau}-U${i.unite}`));
      const modules = new Set(allItems.map(i => `${i.niveau}-U${i.unite}-M${i.module}`));

      return {
        totalEntries: total,
        totalNiveaux: niveaux.size,
        totalUnites: unites.size,
        totalModules: modules.size,
        niveauxList: Array.from(niveaux),
      };
    }),

  // ===== SEED OFFICIAL DATA =====
  seedData: protectedProcedure
    .mutation(async ({ ctx }) => {
      const database = (await getDb())!;

      // Check if data already exists
      const [{ total }] = await database.select({ total: count() }).from(referenceContent);
      if (total > 0) {
        return { message: "Les données existent déjà.", seeded: 0 };
      }

      // ===== 6ème année - U1 M1 J1-J5 =====
      const SIXEME_U1M1 = [
        {
          niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 1,
          activities: [
            { activityName: "Communication orale", duration: "35 mn", objet: "Présenter / Se présenter", objectif: "Communiquer en situation pour : se présenter et présenter quelqu'un", etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
            { activityName: "Lecture", duration: "45 mn", objet: "Texte : \"Le jour de la rentrée\"", objectif: "L'élève serait capable de lire le texte et de répondre à des questions de compréhension", etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], remarques: "" },
            { activityName: "Grammaire", duration: "35 mn", objet: "La phrase – Les types de phrases", objectif: "L'élève serait capable de reconnaître les types de phrases et de les transformer", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
          ]
        },
        {
          niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 2,
          activities: [
            { activityName: "Mise en train", objet: "Poème : \"Mon cartable\"", objectif: "L'élève serait capable de dire le poème de manière expressive", etapes: ["Présentation", "Audition", "Évaluation"], remarques: "" },
            { activityName: "Communication orale", objet: "Présenter / Se présenter", objectif: "Communiquer en situation pour : se présenter et présenter quelqu'un", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
            { activityName: "Lecture fonctionnement", objet: "Texte : \"Le jour de la rentrée\"", objectif: "L'élève serait capable de repérer les personnages et de comprendre les actions", etapes: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"], remarques: "" },
            { activityName: "Conjugaison", objet: "Le verbe \"être\" au présent", objectif: "L'élève serait capable de conjuguer le verbe être au présent", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
          ]
        },
        {
          niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 3,
          activities: [
            { activityName: "Communication orale", duration: "35 mn", objet: "Présenter / Se présenter (suite)", objectif: "Communiquer en situation pour : décrire et informer", etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
            { activityName: "Lecture", duration: "45 mn", objet: "Texte : \"Le jour de la rentrée\" (suite)", objectif: "L'élève serait capable de lire le texte de manière fluide et de répondre aux questions", etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], remarques: "" },
            { activityName: "Orthographe", duration: "35 mn", objet: "Les accents", objectif: "L'élève serait capable d'utiliser correctement les accents dans les mots étudiés", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
          ]
        },
        {
          niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 4,
          activities: [
            { activityName: "Mise en train", objet: "Poème : \"Mon cartable\"", objectif: "L'élève serait capable de réciter le poème de mémoire", etapes: ["Présentation", "Audition", "Évaluation"], remarques: "" },
            { activityName: "Lecture fonctionnement", objet: "Texte : \"Le jour de la rentrée\"", objectif: "L'élève serait capable d'exploiter les exercices de fonctionnement du cahier d'activités", etapes: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"], remarques: "" },
            { activityName: "Écriture", objet: "La lettre majuscule cursive", objectif: "L'élève serait capable d'écrire correctement en respectant les normes", etapes: ["Présentation", "Entraînement", "Écriture"], remarques: "" },
            { activityName: "Auto dictée", objet: "Paragraphe à mémoriser", objectif: "L'élève serait capable de reproduire de mémoire le paragraphe étudié", etapes: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"], remarques: "" },
            { activityName: "Projet d'écriture", objet: "Rédiger une invitation", objectif: "L'élève serait capable de produire un texte court en respectant la structure étudiée", etapes: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"], remarques: "" },
          ]
        },
        {
          niveau: "6ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 5,
          activities: [
            { activityName: "Communication orale", duration: "35 mn", objet: "Présenter / Se présenter (bilan)", objectif: "Communiquer en situation pour : se présenter dans des situations variées", etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
            { activityName: "Lecture", duration: "45 mn", objet: "Texte : \"Le jour de la rentrée\" (bilan)", objectif: "L'élève serait capable de lire le texte de manière autonome et expressive", etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"], remarques: "" },
            { activityName: "Grammaire", duration: "35 mn", objet: "La phrase – Les types de phrases (bilan)", objectif: "L'élève serait capable d'identifier et produire les différents types de phrases", etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"], remarques: "" },
          ]
        },
      ];

      // ===== 4ème année - U1 M1 J1-J5 =====
      const QUATRIEME_U1M1 = [
        {
          niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 1, sousTheme: "Vive l'école",
          activities: [
            { activityName: "Mise en train", objet: "Chant : \"Bonjour, bonjour\"", objectifSpecifique: "Assurer la compréhension du chant", objectif: "L'élève serait capable de chanter correctement le chant", etapes: ["Rappel", "Diction", "Évaluation"] },
            { activityName: "Présentation du projet et du module", objet: "Informer / s'informer – Présenter", objectifSpecifique: "Informer / s'informer – Présenter", objectif: "L'élève serait capable de repérer des indices à travers la fiche contrat", etapes: ["Exploration / anticipation", "Présentation du projet", "Exploitation de la fiche contrat", "Élaboration de la carte d'exploration de pistes"] },
            { activityName: "Étude de graphies", objet: "La graphie s = z", objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes. Reconnaître visuellement les graphèmes", objectif: "L'élève serait capable de compléter les mots donnés par la graphie qui convient", etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
            { activityName: "P.E.L", objet: "La phrase", objectifSpecifique: "Identifier la phrase et ses constituants", objectif: "L'élève serait capable de mettre en ordre des mots pour former une phrase correcte", etapes: ["Manipulation-exploration", "Manipulation-fixation"] },
          ]
        },
        {
          niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 2, sousTheme: "Vive l'école",
          activities: [
            { activityName: "Activité d'écoute", objet: "Conte en séquence au choix", objectifSpecifique: "Assurer un bain de langue", objectif: "L'élève serait capable de comprendre la 1ère séquence du conte", etapes: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
            { activityName: "Lecture compréhension", objet: "Texte : \"La nouvelle élève\"", objectifSpecifique: "Identifier les personnages et les actions", objectif: "L'élève serait capable de lire le texte et de répondre aux questions de compréhension", etapes: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"] },
            { activityName: "Étude de graphies", objet: "La graphie s = z (suite)", objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes", objectif: "L'élève serait capable de lire et écrire des mots contenant la graphie étudiée", etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
            { activityName: "P.E.L", objet: "La phrase (suite)", objectifSpecifique: "Identifier la phrase et ses constituants", objectif: "L'élève serait capable de produire des phrases simples et correctes", etapes: ["Manipulation-exploration", "Manipulation-fixation"] },
          ]
        },
        {
          niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 3, sousTheme: "Vive l'école",
          activities: [
            { activityName: "Mise en train", objet: "Poème : \"L'école\"", objectifSpecifique: "Assurer la compréhension du poème", objectif: "L'élève serait capable de répondre correctement à la question : le poète aime-t-il l'école ?", etapes: ["Audition", "Compréhension", "Évaluation"] },
            { activityName: "Communication orale", objet: "La phrase à présentatif – La phrase à verbe être", objectifSpecifique: "Rendre compte d'un événement de la vie quotidienne", objectif: "L'élève serait capable de produire un énoncé oral de 3 phrases au moins", etapes: ["Reprise de la situation n° 1", "Apprentissage systématique / Structuré", "Intégration", "Évaluation"] },
            { activityName: "Étude de graphies", objet: "La graphie k_q", objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes", objectif: "L'élève serait capable de produire une phrase avec des mots contenant la graphie étudiée", etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
            { activityName: "P.E.L", objet: "Le verbe être au présent", objectifSpecifique: "Conjuguer des verbes au présent de l'indicatif", objectif: "L'élève serait capable de compléter les phrases par le verbe être au présent", etapes: ["Manipulation-exploration", "Manipulation-fixation"] },
          ]
        },
        {
          niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 4, sousTheme: "Vive l'école",
          activities: [
            { activityName: "Activité d'écoute", objet: "Conte en séquence au choix", objectifSpecifique: "Assurer un bain de langue", objectif: "L'élève serait capable de produire des hypothèses", etapes: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"] },
            { activityName: "Lecture Fonctionnement", objet: "Texte : \"La nouvelle élève\"", objectifSpecifique: "Identifier les personnages et les actions", objectif: "L'élève serait capable de repérer les personnages du texte et leurs paroles", etapes: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"] },
            { activityName: "Écriture", objet: "La lettre majuscule : M", objectifSpecifique: "Écrire correctement les graphies au programme", objectif: "L'élève serait capable d'écrire correctement la lettre majuscule M", etapes: ["Présentation", "Entraînement", "Écriture"] },
            { activityName: "Auto dictée", objet: "\"Amélie est en classe. Elle dessine des cerises et des fraises\"", objectifSpecifique: "Orthographier correctement les mots d'usage", objectif: "L'élève serait capable de reproduire de mémoire le paragraphe", etapes: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"] },
            { activityName: "Projet (Entraînement)", objet: "Exploitation du texte \"L'invitation\"", objectifSpecifique: "Se repérer dans le récit", objectif: "L'élève serait capable de repérer les trois parties du récit", etapes: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"] },
          ]
        },
        {
          niveau: "4ème année", uniteNumber: 1, moduleNumber: 1, journeeNumber: 5, sousTheme: "Vive l'école",
          activities: [
            { activityName: "Mise en train", objet: "Poème : \"L'école\"", objectifSpecifique: "Assurer la compréhension du poème", objectif: "L'élève serait capable de réciter le poème de manière expressive", etapes: ["Audition", "Compréhension", "Évaluation"] },
            { activityName: "Communication orale", objet: "La phrase à présentatif (bilan)", objectifSpecifique: "Rendre compte d'un événement", objectif: "L'élève serait capable de produire un énoncé oral intégrant les structures étudiées", etapes: ["Reprise de la situation", "Apprentissage systématique / Structuré", "Intégration", "Évaluation"] },
            { activityName: "Étude de graphies", objet: "La graphie g = g", objectifSpecifique: "Reconnaître auditivement et visuellement la graphie", objectif: "L'élève serait capable de compléter les mots par la graphie qui convient", etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"] },
            { activityName: "P.E.L", objet: "Produire des phrases avec le verbe \"être\" au présent", objectifSpecifique: "Conjuguer le verbe être au présent", objectif: "L'élève serait capable de produire des phrases correctes avec le verbe être au présent", etapes: ["Manipulation-exploration", "Manipulation-fixation"] },
          ]
        },
      ];

      const allRecords = [...SIXEME_U1M1, ...QUATRIEME_U1M1];
      let seeded = 0;

      for (const record of allRecords) {
        await database.insert(referenceContent).values({
          niveau: record.niveau,
          uniteNumber: record.uniteNumber,
          moduleNumber: record.moduleNumber,
          journeeNumber: record.journeeNumber,
          sousTheme: (record as any).sousTheme || null,
          activities: record.activities,
          isOfficial: true,
          source: "Programme officiel tunisien - Documents DOCX de référence",
          addedBy: ctx.user.id,
        });
        seeded++;
      }

      return { message: `${seeded} entrées de référence créées avec succès (6ème + 4ème année, U1 M1 J1-J5).`, seeded };
    }),

  // ===== BULK IMPORT =====
  bulkImport: protectedProcedure
    .input(z.object({
      entries: z.array(z.object({
        niveau: z.string(),
        uniteNumber: z.number().min(1).max(8),
        moduleNumber: z.number().min(1).max(8),
        journeeNumber: z.number().min(1).max(5),
        sousTheme: z.string().optional(),
        activities: z.array(activitySchema).min(1),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      let imported = 0;
      let skipped = 0;

      for (const entry of input.entries) {
        const [existing] = await database.select().from(referenceContent)
          .where(and(
            eq(referenceContent.niveau, entry.niveau),
            eq(referenceContent.uniteNumber, entry.uniteNumber),
            eq(referenceContent.moduleNumber, entry.moduleNumber),
            eq(referenceContent.journeeNumber, entry.journeeNumber),
          )).limit(1);

        if (existing) {
          skipped++;
          continue;
        }

        await database.insert(referenceContent).values({
          niveau: entry.niveau,
          uniteNumber: entry.uniteNumber,
          moduleNumber: entry.moduleNumber,
          journeeNumber: entry.journeeNumber,
          sousTheme: entry.sousTheme || null,
          activities: entry.activities,
          isOfficial: true,
          source: "Import en masse",
          addedBy: ctx.user.id,
        });
        imported++;
      }

      return { imported, skipped, total: input.entries.length };
    }),
});
