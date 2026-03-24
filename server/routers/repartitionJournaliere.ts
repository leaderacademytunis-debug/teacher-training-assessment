import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { repartitionJournaliere, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { htmlToPdf } from "../lib/htmlToPdf";

// ===== MANDATORY PEDAGOGICAL STEPS (IMMUTABLE) =====
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

// ===== REFERENCE CONTENT FOR U1/M1/J1 (6ème année) =====
const REFERENCE_CONTENT: Record<string, {
  communicationOrale: { objet: string; objectif: string };
  lecture: { objet: string; objectif: string };
  grammaire: { objet: string; objectif: string };
}> = {
  "U1-M1-J1": {
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
  },
};

// ===== RÉPARTITION JOURNALIÈRE ROUTER =====
export const repartitionJournaliereRouter = router({

  // ===== GET USER TIER =====
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const perms = await database.select().from(servicePermissions)
      .where(eq(servicePermissions.userId, ctx.user.id)).limit(1);
    return { tier: perms[0]?.tier || "free" };
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
      // Activity-specific inputs
      communicationOrale: z.object({
        objet: z.string().min(1),
        objectifDetails: z.string().optional(),
      }),
      lecture: z.object({
        objet: z.string().min(1),
        objectifDetails: z.string().optional(),
      }),
      grammaireConjugaisonOrthographe: z.object({
        type: z.enum(["Grammaire", "Conjugaison", "Orthographe"]),
        objet: z.string().min(1),
        objectifDetails: z.string().optional(),
      }),
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
        status: "pending",
      });

      const recordId = inserted.insertId;

      try {
        // Check if we have reference content for this exact combination
        const refKey = `U${input.uniteNumber}-M${input.moduleNumber}-J${input.journeeNumber}`;
        const refContent = REFERENCE_CONTENT[refKey];

        const systemPrompt = `Tu es un EXPERT PÉDAGOGIQUE spécialisé dans le curriculum officiel tunisien de la langue française pour le cycle primaire.
Tu dois générer une "Répartition Journalière" (التوزيع اليومي) en respectant STRICTEMENT le format officiel tunisien.

═══════════════════════════════════════════════
RÈGLES ABSOLUES — AUCUNE EXCEPTION PERMISE :
═══════════════════════════════════════════════

1. LANGUE : Tout le contenu DOIT être en FRANÇAIS uniquement. Aucun mot en arabe dans le contenu du tableau.

2. OBJECTIFS : Les objectifs de la séance doivent être formulés avec précision pédagogique.
   - Pour la Communication orale : utiliser "Communiquer en situation pour : [verbes d'action]"
   - Pour la Lecture : commencer par "L'élève serait capable de..."
   - Pour Grammaire/Conjugaison/Orthographe : utiliser des verbes d'action précis (Reconnaître, Utiliser, Identifier, Conjuguer, Orthographier...)

3. ÉTAPES PÉDAGOGIQUES — OBLIGATOIRES ET IMMUABLES :
   ┌─ Communication orale (35 mn) ─────────────────────────┐
   │ 1. Situation d'exploration                              │
   │ 2. Apprentissage systématique structuré                 │
   │ 3. Intégration                                          │
   │ 4. Évaluation                                           │
   └─────────────────────────────────────────────────────────┘
   
   ┌─ Lecture (45 mn) ───────────────────────────────────────┐
   │ 1. Anticipation                                         │
   │ 2. Approche globale                                     │
   │ 3. Approche analytique                                  │
   │ 4. Lecture vocale                                       │
   │ 5. Étude de vocabulaire                                 │
   │ 6. Évaluation                                           │
   └─────────────────────────────────────────────────────────┘
   
   ┌─ ${input.grammaireConjugaisonOrthographe.type} (35 mn) ┐
   │ 1. Exploration                                          │
   │ 2. Apprentissage systématique structuré                 │
   │ 3. Intégration                                          │
   │ 4. Évaluation                                           │
   └─────────────────────────────────────────────────────────┘

4. CONTENU : Le contenu (Objet) et les objectifs doivent être conformes au programme officiel tunisien pour le niveau ${input.niveau}.

5. REMARQUES : La colonne "remarques" doit contenir des notes pédagogiques utiles pour l'enseignant (supports utilisés, différenciation pédagogique, évaluation formative, etc.). Si aucune remarque pertinente, laisser vide.

${refContent ? `
6. RÉFÉRENCE OFFICIELLE pour cette journée :
   - Communication orale — Objet : "${refContent.communicationOrale.objet}" — Objectif : "${refContent.communicationOrale.objectif}"
   - Lecture — Objet : "${refContent.lecture.objet}" — Objectif : "${refContent.lecture.objectif}"
   - Grammaire — Objet : "${refContent.grammaire.objet}" — Objectif : "${refContent.grammaire.objectif}"
   Utilise ces informations comme base et enrichis-les si nécessaire.
` : ""}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "activities": [
    {
      "activityName": "Communication orale",
      "duration": "35 mn",
      "objet": "...",
      "objectif": "Communiquer en situation pour : ...",
      "etapes": ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
      "remarques": "..."
    },
    {
      "activityName": "Lecture",
      "duration": "45 mn",
      "objet": "...",
      "objectif": "L'élève serait capable de ...",
      "etapes": ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"],
      "remarques": "..."
    },
    {
      "activityName": "${input.grammaireConjugaisonOrthographe.type}",
      "duration": "35 mn",
      "objet": "...",
      "objectif": "...",
      "etapes": ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
      "remarques": "..."
    }
  ]
}`;

        const userPrompt = `Génère une Répartition Journalière STRICTEMENT conforme au curriculum tunisien pour :

══════════════════════════════════════
  Unité d'apprentissage n° ${input.uniteNumber}
  Module ${input.moduleNumber} — Journée ${input.journeeNumber}
  Niveau : ${input.niveau}
══════════════════════════════════════

ACTIVITÉS DEMANDÉES :

1. COMMUNICATION ORALE (35 mn) :
   • Objet/Contenu : ${input.communicationOrale.objet}
   ${input.communicationOrale.objectifDetails ? `• Précisions sur l'objectif : ${input.communicationOrale.objectifDetails}` : "• Formule un objectif pédagogique adapté au contenu ci-dessus."}

2. LECTURE (45 mn) :
   • Objet/Contenu : ${input.lecture.objet}
   ${input.lecture.objectifDetails ? `• Précisions sur l'objectif : ${input.lecture.objectifDetails}` : "• Formule un objectif commençant par 'L'élève serait capable de...'"}

3. ${input.grammaireConjugaisonOrthographe.type.toUpperCase()} (35 mn) :
   • Objet/Contenu : ${input.grammaireConjugaisonOrthographe.objet}
   ${input.grammaireConjugaisonOrthographe.objectifDetails ? `• Précisions sur l'objectif : ${input.grammaireConjugaisonOrthographe.objectifDetails}` : "• Formule un objectif avec des verbes d'action précis."}

RAPPEL CRITIQUE :
- Les étapes pédagogiques sont FIXES et IMMUABLES — ne les modifie JAMAIS.
- Le contenu doit être en FRANÇAIS uniquement.
- Les objectifs doivent être précis, mesurables et adaptés au niveau ${input.niveau}.`;

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
                    items: {
                      type: "object",
                      properties: {
                        activityName: { type: "string" },
                        duration: { type: "string" },
                        objet: { type: "string" },
                        objectif: { type: "string" },
                        etapes: { type: "array", items: { type: "string" } },
                        remarques: { type: "string" },
                      },
                      required: ["activityName", "duration", "objet", "objectif", "etapes", "remarques"],
                      additionalProperties: false,
                    },
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
        const commOrale = activities.find((a: any) => a.activityName.toLowerCase().includes("communication"));
        const lecture = activities.find((a: any) => a.activityName.toLowerCase().includes("lecture"));
        const grammar = activities.find((a: any) => 
          a.activityName.toLowerCase().includes("grammaire") || 
          a.activityName.toLowerCase().includes("conjugaison") || 
          a.activityName.toLowerCase().includes("orthographe")
        );

        // Force correct steps — this is the "Automated Correction Loop"
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
          grammar.activityName = input.grammaireConjugaisonOrthographe.type;
          grammar.duration = "35 mn";
          grammar.etapes = [...MANDATORY_STEPS.grammaireConjugaisonOrthographe];
        }

        // Ensure exactly 3 activities in correct order
        const orderedActivities = [
          commOrale || {
            activityName: "Communication orale",
            duration: "35 mn",
            objet: input.communicationOrale.objet,
            objectif: `Communiquer en situation pour : ${input.communicationOrale.objectifDetails || "Informer/s'informer, Décrire/Raconter un événement."}`,
            etapes: [...MANDATORY_STEPS.communicationOrale],
            remarques: "",
          },
          lecture || {
            activityName: "Lecture",
            duration: "45 mn",
            objet: input.lecture.objet,
            objectif: `L'élève serait capable de ${input.lecture.objectifDetails || "lire de manière expressive et intelligible un passage choisi."}`,
            etapes: [...MANDATORY_STEPS.lecture],
            remarques: "",
          },
          grammar || {
            activityName: input.grammaireConjugaisonOrthographe.type,
            duration: "35 mn",
            objet: input.grammaireConjugaisonOrthographe.objet,
            objectif: input.grammaireConjugaisonOrthographe.objectifDetails || `Reconnaître et utiliser ${input.grammaireConjugaisonOrthographe.objet.toLowerCase()}.`,
            etapes: [...MANDATORY_STEPS.grammaireConjugaisonOrthographe],
            remarques: "",
          },
        ];

        // Update record
        await database.update(repartitionJournaliere)
          .set({
            activities: orderedActivities,
            generatedContent: JSON.stringify({ activities: orderedActivities }),
            status: "completed",
          })
          .where(eq(repartitionJournaliere.id, Number(recordId)));

        return {
          id: Number(recordId),
          activities: orderedActivities,
          uniteNumber: input.uniteNumber,
          moduleNumber: input.moduleNumber,
          journeeNumber: input.journeeNumber,
          niveau: input.niveau,
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

      // Build professional PDF HTML matching the official Tunisian format
      const html = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans', Arial, sans-serif;
      font-size: 12pt;
      color: #1a1a1a;
      direction: ltr;
      text-align: left;
      padding: 15mm 20mm;
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
    .header-label { font-weight: 700; color: #2c5282; font-size: 12pt; }
    .header-value { font-size: 12pt; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      border: 2px solid #2c5282;
    }
    th {
      background: #2c5282;
      color: white;
      padding: 10px 8px;
      font-size: 11pt;
      font-weight: 700;
      text-align: center;
      border: 1px solid #1a365d;
    }
    td {
      padding: 10px 8px;
      border: 1px solid #a0aec0;
      vertical-align: top;
      font-size: 10.5pt;
      line-height: 1.6;
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
      font-size: 9pt;
      font-weight: 600;
      margin-top: 4px;
    }
    .etapes-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .etapes-list li {
      padding: 2px 0;
      position: relative;
      padding-left: 16px;
    }
    .etapes-list li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: #2c5282;
      font-weight: 700;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 8.5pt;
      color: #718096;
    }
    .footer .brand { font-weight: 700; color: #2c5282; }
  </style>
</head>
<body>
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

  <table>
    <thead>
      <tr>
        <th style="width:14%">Activités</th>
        <th style="width:20%">Objet (contenu)</th>
        <th style="width:26%">Objectif de la séance</th>
        <th style="width:25%">Étapes</th>
        <th style="width:15%">Remarques</th>
      </tr>
    </thead>
    <tbody>
      ${activities.map((a: any) => `
      <tr>
        <td class="activity-cell">
          ${a.activityName}
          <br><span class="duration-badge">${a.duration}</span>
        </td>
        <td>${a.objet}</td>
        <td>${a.objectif}</td>
        <td>
          <ul class="etapes-list">
            ${a.etapes.map((e: string) => `<li>${e}</li>`).join("")}
          </ul>
        </td>
        <td>${a.remarques || ""}</td>
      </tr>`).join("")}
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
