import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { referenceContent } from "../../drizzle/schema";
import { eq, and, desc, count, asc } from "drizzle-orm";

// ===== REFERENCE CONTENT ROUTER =====
// Manages official Tunisian curriculum content for Répartition Journalière
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
        .orderBy(asc(referenceContent.uniteNumber), asc(referenceContent.moduleNumber), asc(referenceContent.journeeNumber))
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

  // ===== GET BY UNIT/MODULE/JOURNÉE =====
  getByKey: protectedProcedure
    .input(z.object({
      uniteNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(8),
      journeeNumber: z.number().min(1).max(8),
      niveau: z.string().default("6ème année"),
    }))
    .query(async ({ input }) => {
      const database = (await getDb())!;
      const [item] = await database.select().from(referenceContent)
        .where(and(
          eq(referenceContent.uniteNumber, input.uniteNumber),
          eq(referenceContent.moduleNumber, input.moduleNumber),
          eq(referenceContent.journeeNumber, input.journeeNumber),
          eq(referenceContent.niveau, input.niveau),
        )).limit(1);
      return item || null;
    }),

  // ===== CREATE REFERENCE CONTENT =====
  create: protectedProcedure
    .input(z.object({
      uniteNumber: z.number().min(1).max(8),
      moduleNumber: z.number().min(1).max(8),
      journeeNumber: z.number().min(1).max(8),
      niveau: z.string().default("6ème année"),
      commOraleObjet: z.string().min(1),
      commOraleObjectif: z.string().min(1),
      commOraleRemarques: z.string().optional(),
      lectureObjet: z.string().min(1),
      lectureObjectif: z.string().min(1),
      lectureRemarques: z.string().optional(),
      grammaireType: z.enum(["Grammaire", "Conjugaison", "Orthographe"]),
      grammaireObjet: z.string().min(1),
      grammaireObjectif: z.string().min(1),
      grammaireRemarques: z.string().optional(),
      isOfficial: z.boolean().default(true),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;

      // Check if entry already exists for this combination
      const [existing] = await database.select().from(referenceContent)
        .where(and(
          eq(referenceContent.uniteNumber, input.uniteNumber),
          eq(referenceContent.moduleNumber, input.moduleNumber),
          eq(referenceContent.journeeNumber, input.journeeNumber),
          eq(referenceContent.niveau, input.niveau),
        )).limit(1);

      if (existing) {
        throw new Error(`Un contenu de référence existe déjà pour U${input.uniteNumber}-M${input.moduleNumber}-J${input.journeeNumber} (${input.niveau}). Utilisez la modification.`);
      }

      const [inserted] = await database.insert(referenceContent).values({
        ...input,
        commOraleRemarques: input.commOraleRemarques || "",
        lectureRemarques: input.lectureRemarques || "",
        grammaireRemarques: input.grammaireRemarques || "",
        source: input.source || "Programme officiel tunisien",
        addedBy: ctx.user.id,
      });

      return { id: inserted.insertId, success: true };
    }),

  // ===== UPDATE REFERENCE CONTENT =====
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      commOraleObjet: z.string().min(1).optional(),
      commOraleObjectif: z.string().min(1).optional(),
      commOraleRemarques: z.string().optional(),
      lectureObjet: z.string().min(1).optional(),
      lectureObjectif: z.string().min(1).optional(),
      lectureRemarques: z.string().optional(),
      grammaireType: z.enum(["Grammaire", "Conjugaison", "Orthographe"]).optional(),
      grammaireObjet: z.string().min(1).optional(),
      grammaireObjectif: z.string().min(1).optional(),
      grammaireRemarques: z.string().optional(),
      isOfficial: z.boolean().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = (await getDb())!;
      const { id, ...updates } = input;

      // Remove undefined fields
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

  // ===== SEED INITIAL DATA =====
  seedData: protectedProcedure
    .mutation(async ({ ctx }) => {
      const database = (await getDb())!;

      // Check if data already exists
      const [{ total }] = await database.select({ total: count() }).from(referenceContent);
      if (total > 0) {
        return { message: "Les données existent déjà.", seeded: 0 };
      }

      // ===== OFFICIAL TUNISIAN CURRICULUM DATA - 6ème année =====
      const seedEntries = [
        // ===== UNITÉ 1 =====
        // Module 1
        {
          uniteNumber: 1, moduleNumber: 1, journeeNumber: 1, niveau: "6ème année",
          commOraleObjet: "Présentation du module et du projet d'écriture",
          commOraleObjectif: "Communiquer en situation pour : Informer/s'informer, Décrire/Raconter un événement, Justifier un choix.",
          lectureObjet: "Apprentie comédienne",
          lectureObjectif: "L'élève serait capable de lire de manière expressive et intelligible un passage choisi.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Les déterminants / les noms / les pronoms personnels",
          grammaireObjectif: "Reconnaître et utiliser les déterminants, les noms et les pronoms personnels.",
        },
        {
          uniteNumber: 1, moduleNumber: 1, journeeNumber: 2, niveau: "6ème année",
          commOraleObjet: "Raconter un événement vécu ou imaginé",
          commOraleObjectif: "Communiquer en situation pour : Raconter un événement en respectant l'ordre chronologique.",
          lectureObjet: "Apprentie comédienne (suite)",
          lectureObjectif: "L'élève serait capable de dégager les idées essentielles du texte et de répondre à des questions de compréhension.",
          grammaireType: "Conjugaison" as const,
          grammaireObjet: "Le présent de l'indicatif (verbes du 1er et 2ème groupe)",
          grammaireObjectif: "Conjuguer correctement les verbes du 1er et 2ème groupe au présent de l'indicatif.",
        },
        {
          uniteNumber: 1, moduleNumber: 1, journeeNumber: 3, niveau: "6ème année",
          commOraleObjet: "Décrire un lieu / un personnage",
          commOraleObjectif: "Communiquer en situation pour : Décrire avec précision un lieu ou un personnage en utilisant un vocabulaire approprié.",
          lectureObjet: "Apprentie comédienne (fin)",
          lectureObjectif: "L'élève serait capable de lire silencieusement un texte et d'en dégager le sens global.",
          grammaireType: "Orthographe" as const,
          grammaireObjet: "Les accords dans le groupe nominal",
          grammaireObjectif: "Appliquer correctement les règles d'accord en genre et en nombre dans le groupe nominal.",
        },
        {
          uniteNumber: 1, moduleNumber: 1, journeeNumber: 4, niveau: "6ème année",
          commOraleObjet: "Justifier un choix / exprimer son avis",
          commOraleObjectif: "Communiquer en situation pour : Exprimer et justifier un point de vue en utilisant des connecteurs logiques.",
          lectureObjet: "Lecture documentaire : Le théâtre",
          lectureObjectif: "L'élève serait capable de lire un texte documentaire et d'en extraire les informations essentielles.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Les types de phrases (déclarative, interrogative, exclamative, impérative)",
          grammaireObjectif: "Identifier et produire les différents types de phrases.",
        },
        {
          uniteNumber: 1, moduleNumber: 1, journeeNumber: 5, niveau: "6ème année",
          commOraleObjet: "Évaluation et remédiation - Communication orale",
          commOraleObjectif: "Évaluer les acquis des élèves en communication orale et remédier aux difficultés identifiées.",
          lectureObjet: "Évaluation de lecture - Texte de synthèse",
          lectureObjectif: "L'élève serait capable de lire un texte nouveau et de répondre à des questions de compréhension variées.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Évaluation - Grammaire / Conjugaison / Orthographe",
          grammaireObjectif: "Évaluer les acquis des élèves en grammaire, conjugaison et orthographe.",
        },

        // Module 2
        {
          uniteNumber: 1, moduleNumber: 2, journeeNumber: 1, niveau: "6ème année",
          commOraleObjet: "Présentation du module 2 et du projet d'écriture",
          commOraleObjectif: "Communiquer en situation pour : Informer/s'informer sur un sujet lié à la vie quotidienne.",
          lectureObjet: "Le petit prince (extrait)",
          lectureObjectif: "L'élève serait capable de lire un texte narratif et d'identifier les personnages et les événements principaux.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Les adjectifs qualificatifs (épithète et attribut)",
          grammaireObjectif: "Identifier et utiliser l'adjectif qualificatif comme épithète ou attribut du sujet.",
        },
        {
          uniteNumber: 1, moduleNumber: 2, journeeNumber: 2, niveau: "6ème année",
          commOraleObjet: "Décrire une situation / un processus",
          commOraleObjectif: "Communiquer en situation pour : Décrire les étapes d'un processus en utilisant des indicateurs temporels.",
          lectureObjet: "Le petit prince (suite)",
          lectureObjectif: "L'élève serait capable de repérer les informations explicites et implicites dans un texte narratif.",
          grammaireType: "Conjugaison" as const,
          grammaireObjet: "Le présent de l'indicatif (verbes du 3ème groupe)",
          grammaireObjectif: "Conjuguer correctement les verbes du 3ème groupe au présent de l'indicatif (être, avoir, aller, faire, dire, pouvoir, vouloir).",
        },
        {
          uniteNumber: 1, moduleNumber: 2, journeeNumber: 3, niveau: "6ème année",
          commOraleObjet: "Raconter une expérience personnelle",
          commOraleObjectif: "Communiquer en situation pour : Raconter une expérience vécue en utilisant le vocabulaire des sentiments.",
          lectureObjet: "Le petit prince (fin)",
          lectureObjectif: "L'élève serait capable de résumer oralement un texte lu en respectant la chronologie des événements.",
          grammaireType: "Orthographe" as const,
          grammaireObjet: "Les homophones grammaticaux (a/à, et/est, on/ont, son/sont)",
          grammaireObjectif: "Distinguer et orthographier correctement les homophones grammaticaux courants.",
        },
        {
          uniteNumber: 1, moduleNumber: 2, journeeNumber: 4, niveau: "6ème année",
          commOraleObjet: "Argumenter et convaincre",
          commOraleObjectif: "Communiquer en situation pour : Présenter des arguments pour convaincre un interlocuteur.",
          lectureObjet: "Lecture documentaire : Les animaux en danger",
          lectureObjectif: "L'élève serait capable de lire un texte informatif et d'en extraire les données essentielles sous forme de tableau.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Les compléments du verbe (COD / COI)",
          grammaireObjectif: "Identifier et utiliser correctement les compléments d'objet direct et indirect.",
        },
        {
          uniteNumber: 1, moduleNumber: 2, journeeNumber: 5, niveau: "6ème année",
          commOraleObjet: "Évaluation et remédiation - Module 2",
          commOraleObjectif: "Évaluer les acquis des élèves et proposer des activités de remédiation adaptées.",
          lectureObjet: "Évaluation de lecture - Texte de synthèse Module 2",
          lectureObjectif: "L'élève serait capable de mobiliser ses compétences de lecture pour comprendre un texte nouveau.",
          grammaireType: "Conjugaison" as const,
          grammaireObjet: "Évaluation - Grammaire / Conjugaison / Orthographe Module 2",
          grammaireObjectif: "Évaluer les acquis des élèves et identifier les lacunes à combler.",
        },

        // ===== UNITÉ 2 =====
        // Module 3
        {
          uniteNumber: 2, moduleNumber: 3, journeeNumber: 1, niveau: "6ème année",
          commOraleObjet: "Présentation du module 3 et du projet d'écriture",
          commOraleObjectif: "Communiquer en situation pour : S'informer et informer sur un thème lié à l'environnement.",
          lectureObjet: "La forêt enchantée",
          lectureObjectif: "L'élève serait capable de lire un texte descriptif et d'identifier les éléments de description.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Les compléments circonstanciels (lieu, temps, manière)",
          grammaireObjectif: "Identifier et utiliser les compléments circonstanciels de lieu, de temps et de manière.",
        },
        {
          uniteNumber: 2, moduleNumber: 3, journeeNumber: 2, niveau: "6ème année",
          commOraleObjet: "Décrire un paysage / un environnement naturel",
          commOraleObjectif: "Communiquer en situation pour : Décrire un paysage en utilisant un vocabulaire riche et varié.",
          lectureObjet: "La forêt enchantée (suite)",
          lectureObjectif: "L'élève serait capable d'analyser la structure d'un texte descriptif et d'en dégager le plan.",
          grammaireType: "Conjugaison" as const,
          grammaireObjet: "L'imparfait de l'indicatif",
          grammaireObjectif: "Conjuguer correctement les verbes à l'imparfait de l'indicatif et comprendre ses valeurs d'emploi.",
        },
        {
          uniteNumber: 2, moduleNumber: 3, journeeNumber: 3, niveau: "6ème année",
          commOraleObjet: "Exprimer ses sentiments face à la nature",
          commOraleObjectif: "Communiquer en situation pour : Exprimer ses émotions et sentiments en utilisant le vocabulaire approprié.",
          lectureObjet: "La forêt enchantée (fin)",
          lectureObjectif: "L'élève serait capable de lire à haute voix un passage descriptif avec l'intonation appropriée.",
          grammaireType: "Orthographe" as const,
          grammaireObjet: "L'accord du participe passé employé avec être",
          grammaireObjectif: "Appliquer correctement la règle d'accord du participe passé employé avec l'auxiliaire être.",
        },
        {
          uniteNumber: 2, moduleNumber: 3, journeeNumber: 4, niveau: "6ème année",
          commOraleObjet: "Débattre sur la protection de l'environnement",
          commOraleObjectif: "Communiquer en situation pour : Participer à un débat en respectant les règles de prise de parole.",
          lectureObjet: "Lecture documentaire : La pollution et ses effets",
          lectureObjectif: "L'élève serait capable de lire un texte documentaire et d'en extraire les causes et les conséquences.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "La phrase complexe (juxtaposition, coordination)",
          grammaireObjectif: "Identifier et construire des phrases complexes par juxtaposition et coordination.",
        },
        {
          uniteNumber: 2, moduleNumber: 3, journeeNumber: 5, niveau: "6ème année",
          commOraleObjet: "Évaluation et remédiation - Module 3",
          commOraleObjectif: "Évaluer les acquis des élèves en communication orale et remédier aux difficultés.",
          lectureObjet: "Évaluation de lecture - Texte de synthèse Module 3",
          lectureObjectif: "L'élève serait capable de mobiliser ses compétences pour comprendre un texte descriptif nouveau.",
          grammaireType: "Orthographe" as const,
          grammaireObjet: "Évaluation - Grammaire / Conjugaison / Orthographe Module 3",
          grammaireObjectif: "Évaluer les acquis des élèves et proposer des remédiations ciblées.",
        },

        // Module 4
        {
          uniteNumber: 2, moduleNumber: 4, journeeNumber: 1, niveau: "6ème année",
          commOraleObjet: "Présentation du module 4 et du projet d'écriture",
          commOraleObjectif: "Communiquer en situation pour : Présenter un projet et en expliquer les étapes.",
          lectureObjet: "Le voyage de Gulliver (extrait)",
          lectureObjectif: "L'élève serait capable de lire un texte d'aventure et d'identifier le schéma narratif.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "Les pronoms relatifs (qui, que, où, dont)",
          grammaireObjectif: "Identifier et utiliser correctement les pronoms relatifs dans des phrases complexes.",
        },
        {
          uniteNumber: 2, moduleNumber: 4, journeeNumber: 2, niveau: "6ème année",
          commOraleObjet: "Raconter un voyage / une aventure",
          commOraleObjectif: "Communiquer en situation pour : Raconter un voyage en utilisant les temps du récit.",
          lectureObjet: "Le voyage de Gulliver (suite)",
          lectureObjectif: "L'élève serait capable de distinguer les passages narratifs et descriptifs dans un texte.",
          grammaireType: "Conjugaison" as const,
          grammaireObjet: "Le passé composé de l'indicatif",
          grammaireObjectif: "Conjuguer correctement les verbes au passé composé et choisir le bon auxiliaire.",
        },
        {
          uniteNumber: 2, moduleNumber: 4, journeeNumber: 3, niveau: "6ème année",
          commOraleObjet: "Comparer des cultures / des modes de vie",
          commOraleObjectif: "Communiquer en situation pour : Comparer en utilisant les outils de comparaison appropriés.",
          lectureObjet: "Le voyage de Gulliver (fin)",
          lectureObjectif: "L'élève serait capable de résumer un texte narratif en respectant le schéma narratif.",
          grammaireType: "Orthographe" as const,
          grammaireObjet: "L'accord du participe passé employé avec avoir",
          grammaireObjectif: "Appliquer correctement la règle d'accord du participe passé employé avec l'auxiliaire avoir.",
        },
        {
          uniteNumber: 2, moduleNumber: 4, journeeNumber: 4, niveau: "6ème année",
          commOraleObjet: "Présenter un exposé sur un pays / une culture",
          commOraleObjectif: "Communiquer en situation pour : Structurer et présenter un exposé oral avec supports visuels.",
          lectureObjet: "Lecture documentaire : Les grandes découvertes",
          lectureObjectif: "L'élève serait capable de lire un texte historique et d'en situer les événements dans le temps.",
          grammaireType: "Grammaire" as const,
          grammaireObjet: "La voix active et la voix passive",
          grammaireObjectif: "Transformer des phrases de la voix active à la voix passive et inversement.",
        },
        {
          uniteNumber: 2, moduleNumber: 4, journeeNumber: 5, niveau: "6ème année",
          commOraleObjet: "Évaluation et remédiation - Module 4",
          commOraleObjectif: "Évaluer les acquis des élèves et proposer des activités de remédiation adaptées.",
          lectureObjet: "Évaluation de lecture - Texte de synthèse Module 4",
          lectureObjectif: "L'élève serait capable de mobiliser toutes ses compétences de lecture pour comprendre un texte nouveau.",
          grammaireType: "Conjugaison" as const,
          grammaireObjet: "Évaluation - Grammaire / Conjugaison / Orthographe Module 4",
          grammaireObjectif: "Évaluer les acquis des élèves et identifier les compétences à renforcer.",
        },
      ];

      // Insert all seed entries
      for (const entry of seedEntries) {
        await database.insert(referenceContent).values({
          ...entry,
          commOraleRemarques: "",
          lectureRemarques: "",
          grammaireRemarques: "",
          isOfficial: true,
          source: "Programme officiel tunisien",
          addedBy: ctx.user.id,
        });
      }

      return { message: `${seedEntries.length} entrées de référence créées avec succès.`, seeded: seedEntries.length };
    }),

  // ===== GET STATISTICS =====
  getStats: protectedProcedure
    .query(async () => {
      const database = (await getDb())!;
      const [{ total }] = await database.select({ total: count() }).from(referenceContent);

      // Get unique unités
      const allItems = await database.select({
        unite: referenceContent.uniteNumber,
        module: referenceContent.moduleNumber,
      }).from(referenceContent);

      const unites = new Set(allItems.map((i: { unite: number }) => i.unite));
      const modules = new Set(allItems.map((i: { unite: number; module: number }) => `${i.unite}-${i.module}`));

      return {
        totalEntries: total,
        totalUnites: unites.size,
        totalModules: modules.size,
      };
    }),

  // ===== BULK IMPORT =====
  bulkImport: protectedProcedure
    .input(z.object({
      entries: z.array(z.object({
        uniteNumber: z.number().min(1).max(8),
        moduleNumber: z.number().min(1).max(8),
        journeeNumber: z.number().min(1).max(8),
        niveau: z.string().default("6ème année"),
        commOraleObjet: z.string(),
        commOraleObjectif: z.string(),
        lectureObjet: z.string(),
        lectureObjectif: z.string(),
        grammaireType: z.enum(["Grammaire", "Conjugaison", "Orthographe"]),
        grammaireObjet: z.string(),
        grammaireObjectif: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = (await getDb())!;
      let imported = 0;
      let skipped = 0;

      for (const entry of input.entries) {
        // Check if exists
        const [existing] = await database.select().from(referenceContent)
          .where(and(
            eq(referenceContent.uniteNumber, entry.uniteNumber),
            eq(referenceContent.moduleNumber, entry.moduleNumber),
            eq(referenceContent.journeeNumber, entry.journeeNumber),
            eq(referenceContent.niveau, entry.niveau),
          )).limit(1);

        if (existing) {
          skipped++;
          continue;
        }

        await database.insert(referenceContent).values({
          ...entry,
          commOraleRemarques: "",
          lectureRemarques: "",
          grammaireRemarques: "",
          isOfficial: true,
          source: "Import en masse",
          addedBy: ctx.user.id,
        });
        imported++;
      }

      return { imported, skipped, total: input.entries.length };
    }),
});
