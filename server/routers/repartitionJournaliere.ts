import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { repartitionJournaliere, servicePermissions } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { htmlToPdf } from "../lib/htmlToPdf";

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
        const systemPrompt = `Tu es un expert pédagogique spécialisé dans le curriculum tunisien de la langue française pour le cycle primaire.
Tu dois générer une "Répartition Journalière" (التوزيع اليومي) en respectant STRICTEMENT le format officiel tunisien.

RÈGLES ABSOLUES:
1. Tout le contenu doit être en FRANÇAIS uniquement.
2. Les objectifs doivent commencer par "L'élève serait capable de..."
3. Les étapes pédagogiques sont OBLIGATOIRES et ne doivent JAMAIS être modifiées ou réduites.
4. Le contenu doit être adapté au niveau ${input.niveau}.

STRUCTURE DES ÉTAPES OBLIGATOIRES:
- Communication orale (35 mn): Situation d'exploration → Apprentissage systématique structuré → Intégration → Évaluation
- Lecture (45 mn): Anticipation → Approche globale → Approche analytique → Lecture vocale → Étude de vocabulaire → Évaluation
- ${input.grammaireConjugaisonOrthographe.type} (35 mn): Exploration → Apprentissage systématique structuré → Intégration → Évaluation

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "activities": [
    {
      "activityName": "Communication orale",
      "duration": "35 mn",
      "objet": "...",
      "objectif": "L'élève serait capable de ...",
      "etapes": ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
      "remarques": ""
    },
    {
      "activityName": "Lecture",
      "duration": "45 mn",
      "objet": "...",
      "objectif": "L'élève serait capable de ...",
      "etapes": ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"],
      "remarques": ""
    },
    {
      "activityName": "${input.grammaireConjugaisonOrthographe.type}",
      "duration": "35 mn",
      "objet": "...",
      "objectif": "L'élève serait capable de ...",
      "etapes": ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
      "remarques": ""
    }
  ]
}`;

        const userPrompt = `Génère une Répartition Journalière pour:
- Unité d'apprentissage n° ${input.uniteNumber}
- Module ${input.moduleNumber} - Journée ${input.journeeNumber}
- Niveau: ${input.niveau}

Activités demandées:
1. Communication orale (35 mn):
   - Objet/Contenu: ${input.communicationOrale.objet}
   ${input.communicationOrale.objectifDetails ? `- Précisions sur l'objectif: ${input.communicationOrale.objectifDetails}` : ""}

2. Lecture (45 mn):
   - Objet/Contenu: ${input.lecture.objet}
   ${input.lecture.objectifDetails ? `- Précisions sur l'objectif: ${input.lecture.objectifDetails}` : ""}

3. ${input.grammaireConjugaisonOrthographe.type} (35 mn):
   - Objet/Contenu: ${input.grammaireConjugaisonOrthographe.objet}
   ${input.grammaireConjugaisonOrthographe.objectifDetails ? `- Précisions sur l'objectif: ${input.grammaireConjugaisonOrthographe.objectifDetails}` : ""}

IMPORTANT: Formule des objectifs pédagogiques précis et adaptés au niveau ${input.niveau}, en commençant toujours par "L'élève serait capable de...". Le contenu doit être conforme au programme officiel tunisien.`;

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

        // Validate mandatory steps
        const commOrale = activities.find((a: any) => a.activityName.toLowerCase().includes("communication"));
        const lecture = activities.find((a: any) => a.activityName.toLowerCase().includes("lecture"));
        const grammar = activities.find((a: any) => 
          a.activityName.toLowerCase().includes("grammaire") || 
          a.activityName.toLowerCase().includes("conjugaison") || 
          a.activityName.toLowerCase().includes("orthographe")
        );

        // Enforce mandatory steps if LLM missed any
        if (commOrale) {
          const requiredSteps = ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"];
          commOrale.etapes = requiredSteps;
        }
        if (lecture) {
          const requiredSteps = ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"];
          lecture.etapes = requiredSteps;
        }
        if (grammar) {
          const requiredSteps = ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"];
          grammar.etapes = requiredSteps;
        }

        // Update record
        await database.update(repartitionJournaliere)
          .set({
            activities: activities,
            generatedContent: content as string,
            status: "completed",
          })
          .where(eq(repartitionJournaliere.id, Number(recordId)));

        return {
          id: Number(recordId),
          activities,
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

      // Build HTML for PDF
      const html = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans', Arial, sans-serif; font-size: 12pt; color: #1a1a1a; direction: ltr; text-align: left; padding: 20mm; }
    .header { margin-bottom: 20px; }
    .header-line { font-size: 13pt; margin-bottom: 6px; }
    .header-line strong { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #2c5282; color: white; padding: 10px 8px; font-size: 11pt; font-weight: 600; text-align: center; border: 1px solid #2c5282; }
    td { padding: 8px; border: 1px solid #cbd5e0; vertical-align: top; font-size: 10.5pt; line-height: 1.5; }
    tr:nth-child(even) { background: #f7fafc; }
    .activity-name { font-weight: 700; color: #2c5282; }
    .duration { font-size: 9.5pt; color: #718096; }
    .etapes-list { list-style: none; padding: 0; margin: 0; }
    .etapes-list li { padding: 2px 0; }
    .etapes-list li::before { content: "→ "; color: #2c5282; font-weight: 600; }
    .footer { margin-top: 25px; text-align: center; font-size: 9pt; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    .logo-text { font-size: 10pt; color: #2c5282; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-line"><strong>Unité d'apprentissage n°</strong> ${record.uniteNumber}</div>
    <div class="header-line"><strong>${record.niveau}</strong> / de ${record.dateFrom || "……"} à ${record.dateTo || "……"}</div>
    <div class="header-line"><strong>Module ${record.moduleNumber}</strong></div>
    <div class="header-line"><strong>Journée ${record.journeeNumber}</strong></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:15%">Activités</th>
        <th style="width:20%">Objet (contenu)</th>
        <th style="width:25%">Objectif de la séance</th>
        <th style="width:25%">Étapes</th>
        <th style="width:15%">Remarques</th>
      </tr>
    </thead>
    <tbody>
      ${activities.map((a: any) => `
      <tr>
        <td><span class="activity-name">${a.activityName}</span><br><span class="duration">${a.duration}</span></td>
        <td>${a.objet}</td>
        <td>${a.objectif}</td>
        <td><ul class="etapes-list">${a.etapes.map((e: string) => `<li>${e}</li>`).join("")}</ul></td>
        <td>${a.remarques || ""}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <div class="footer">
    <span class="logo-text">Leader Academy</span> — المساعد البيداغوجي الذكي — نسخة تونس 2026
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
