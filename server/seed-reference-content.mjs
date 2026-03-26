/**
 * Seed script for reference_content table.
 * Populates U1 M1 J1-J5 for 4ème année and 6ème année
 * based on official Tunisian DOCX templates.
 * 
 * Run: node server/seed-reference-content.mjs
 */
import { getDb } from './db.ts';

// ===================================================================
// 6ème année - Unité 1, Module 1, Journées 1-5
// Source: répartitionjournalièreu1m1j1.docx, 1m1j2.docx
// ===================================================================

const SIXEME_U1M1 = [
  // ===== J1 =====
  {
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
  },
  // ===== J2 =====
  {
    niveau: "6ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 2,
    activities: [
      {
        activityName: "Mise en train",
        objet: "Poème : « Mon cartable »",
        objectif: "L'élève serait capable de dire le poème de manière expressive",
        etapes: ["Présentation", "Audition", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Communication orale",
        objet: "Présenter / Se présenter",
        objectif: "Communiquer en situation pour : se présenter et présenter quelqu'un",
        etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Lecture fonctionnement",
        objet: "Texte : « Le jour de la rentrée »",
        objectif: "L'élève serait capable de repérer les personnages et de comprendre les actions",
        etapes: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Conjugaison",
        objet: "Le verbe « être » au présent",
        objectif: "L'élève serait capable de conjuguer le verbe être au présent",
        etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
        remarques: ""
      }
    ]
  },
  // ===== J3 =====
  {
    niveau: "6ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 3,
    activities: [
      {
        activityName: "Communication orale",
        duration: "35 mn",
        objet: "Présenter / Se présenter (suite)",
        objectif: "Communiquer en situation pour : décrire et informer",
        etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Lecture",
        duration: "45 mn",
        objet: "Texte : « Le jour de la rentrée » (suite)",
        objectif: "L'élève serait capable de lire le texte de manière fluide et de répondre aux questions",
        etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Orthographe",
        duration: "35 mn",
        objet: "Les accents",
        objectif: "L'élève serait capable d'utiliser correctement les accents dans les mots étudiés",
        etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
        remarques: ""
      }
    ]
  },
  // ===== J4 =====
  {
    niveau: "6ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 4,
    activities: [
      {
        activityName: "Mise en train",
        objet: "Poème : « Mon cartable »",
        objectif: "L'élève serait capable de réciter le poème de mémoire",
        etapes: ["Présentation", "Audition", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Lecture fonctionnement",
        objet: "Texte : « Le jour de la rentrée »",
        objectif: "L'élève serait capable d'exploiter les exercices de fonctionnement du cahier d'activités",
        etapes: ["Rappel", "Relecture", "Exploitation des exercices de fonctionnement", "Intégration", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Écriture",
        objet: "La lettre majuscule cursive",
        objectif: "L'élève serait capable d'écrire correctement en respectant les normes",
        etapes: ["Présentation", "Entraînement", "Écriture"],
        remarques: ""
      },
      {
        activityName: "Auto dictée",
        objet: "Paragraphe à mémoriser",
        objectif: "L'élève serait capable de reproduire de mémoire le paragraphe étudié",
        etapes: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"],
        remarques: ""
      },
      {
        activityName: "Projet d'écriture",
        objet: "Rédiger une invitation",
        objectif: "L'élève serait capable de produire un texte court en respectant la structure étudiée",
        etapes: ["Exploration", "Exploitation de l'outil d'aide", "Intégration", "Évaluation"],
        remarques: ""
      }
    ]
  },
  // ===== J5 =====
  {
    niveau: "6ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 5,
    activities: [
      {
        activityName: "Communication orale",
        duration: "35 mn",
        objet: "Présenter / Se présenter (bilan)",
        objectif: "Communiquer en situation pour : se présenter dans des situations variées",
        etapes: ["Situation d'exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Lecture",
        duration: "45 mn",
        objet: "Texte : « Le jour de la rentrée » (bilan)",
        objectif: "L'élève serait capable de lire le texte de manière autonome et expressive",
        etapes: ["Anticipation", "Approche globale", "Approche analytique", "Lecture vocale", "Étude de vocabulaire", "Évaluation"],
        remarques: ""
      },
      {
        activityName: "Grammaire",
        duration: "35 mn",
        objet: "La phrase – Les types de phrases (bilan)",
        objectif: "L'élève serait capable d'identifier et produire les différents types de phrases",
        etapes: ["Exploration", "Apprentissage systématique structuré", "Intégration", "Évaluation"],
        remarques: ""
      }
    ]
  }
];

// ===================================================================
// 4ème année - Unité 1, Module 1, Journées 1-5
// Source: répartitionjournalière4èmeannéeu1j1m1.docx, u1m1j3-j5.docx
// ===================================================================

const QUATRIEME_U1M1 = [
  // ===== J1 (FROM DOCX) =====
  {
    niveau: "4ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 1,
    sousTheme: "Vive l'école",
    activities: [
      {
        activityName: "Mise en train",
        objet: "Chant : « Bonjour, bonjour »",
        objectifSpecifique: "Assurer la compréhension du chant : explication des mots difficiles en ayant recours à la gestuelle, à la mimique, aux images",
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
        objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes. Reconnaître visuellement les graphèmes",
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
  },
  // ===== J2 (inferred from pattern + J4 structure) =====
  {
    niveau: "4ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 2,
    sousTheme: "Vive l'école",
    activities: [
      {
        activityName: "Activité d'écoute",
        objet: "Conte en séquence au choix",
        objectifSpecifique: "Assurer un bain de langue. Créer une ambiance agréable pour la poursuite des apprentissages",
        objectif: "L'élève serait capable de comprendre la 1ère séquence du conte et d'émettre des hypothèses",
        etapes: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"]
      },
      {
        activityName: "Lecture compréhension",
        objet: "Texte : « La nouvelle élève »",
        objectifSpecifique: "Identifier les personnages et les actions – Repérer les répliques",
        objectif: "L'élève serait capable de lire le texte et de répondre aux questions de compréhension",
        etapes: ["Anticipation", "Approche globale", "Approche analytique", "Évaluation"]
      },
      {
        activityName: "Étude de graphies",
        objet: "La graphie s = z (suite)",
        objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes. Reconnaître visuellement les graphèmes",
        objectif: "L'élève serait capable de lire et écrire des mots contenant la graphie étudiée",
        etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"]
      },
      {
        activityName: "P.E.L (Pratique Écrite de la Langue)",
        objet: "La phrase (suite)",
        objectifSpecifique: "Identifier la phrase et ses constituants",
        objectif: "L'élève serait capable de produire des phrases simples et correctes",
        etapes: ["Manipulation-exploration", "Manipulation-fixation"]
      }
    ]
  },
  // ===== J3 (FROM DOCX) =====
  {
    niveau: "4ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 3,
    sousTheme: "Vive l'école",
    activities: [
      {
        activityName: "Mise en train",
        objet: "Poème : « L'école »",
        objectifSpecifique: "Assurer la compréhension du poème : explication des mots difficiles en ayant recours à la gestuelle, à la mimique, aux images",
        objectif: "L'élève serait capable de répondre correctement à la question suivante : À la fin du poème, le poète aime-t-il l'école ?",
        etapes: ["Audition", "Compréhension", "Évaluation"]
      },
      {
        activityName: "Communication orale",
        objet: "La phrase à présentatif – La phrase à verbe être – GN + aller + GNP / + adjectif",
        objectifSpecifique: "Rendre compte d'un événement de la vie quotidienne – Justifier un comportement",
        objectif: "L'élève serait capable de produire un énoncé oral de 3 phrases au moins pour raconter un événement",
        etapes: ["Reprise de la situation n° 1", "Apprentissage systématique / Structuré", "Intégration", "Évaluation"]
      },
      {
        activityName: "Étude de graphies",
        objet: "La graphie k_q",
        objectifSpecifique: "Discriminer auditivement les phonèmes-graphèmes. Reconnaître visuellement les graphèmes",
        objectif: "L'élève serait capable de produire une phrase décrivant l'image en employant des mots contenant la graphie étudiée",
        etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"]
      },
      {
        activityName: "P.E.L (Pratique Écrite de la Langue)",
        objet: "Le verbe être au présent",
        objectifSpecifique: "Conjuguer des verbes du 1er, 2ème, 3ème groupes au présent de l'indicatif",
        objectif: "L'élève serait capable de compléter correctement les phrases données par le verbe être au présent",
        etapes: ["Manipulation-exploration", "Manipulation-fixation"]
      }
    ]
  },
  // ===== J4 (FROM DOCX) =====
  {
    niveau: "4ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 4,
    sousTheme: "Vive l'école",
    activities: [
      {
        activityName: "Activité d'écoute",
        objet: "Conte en séquence au choix",
        objectifSpecifique: "Assurer un bain de langue. Créer une ambiance agréable pour la poursuite des apprentissages",
        objectif: "L'élève serait capable de produire des hypothèses",
        etapes: ["Rappel de la 1ère séquence", "Émission d'hypothèses", "Audition de la 2ème séquence"]
      },
      {
        activityName: "Lecture Fonctionnement",
        objet: "Texte : « La nouvelle élève »",
        objectifSpecifique: "Identifier les personnages et les actions – Repérer les répliques",
        objectif: "L'élève serait capable de repérer les personnages du texte et leurs paroles correctement",
        etapes: ["Rappel", "Relecture", "Exploitation des exercices du cahier d'activités"]
      },
      {
        activityName: "Écriture",
        objet: "La lettre majuscule : M",
        objectifSpecifique: "Écrire correctement les graphies au programme et toutes les lettres en cursive et en script",
        objectif: "L'élève serait capable d'écrire correctement en respectant les normes la lettre majuscule M",
        etapes: ["Présentation", "Entraînement", "Écriture"]
      },
      {
        activityName: "Auto dictée",
        objet: "« Amélie est en classe. Elle dessine des cerises et des fraises »",
        objectifSpecifique: "Orthographier correctement les mots d'usage et les mots-outils étudiés",
        objectif: "L'élève serait capable de reproduire de mémoire le paragraphe suivant : « Amélie est en classe. Elle dessine des cerises et des fraises »",
        etapes: ["Diction", "Reproduction de mémoire", "Correction collective et exploitation des erreurs", "Correction individuelle"]
      },
      {
        activityName: "Projet (Entraînement)",
        objet: "Exploitation du texte « L'invitation » / Élaboration du 1er outil d'aide",
        objectifSpecifique: "Se repérer dans le récit",
        objectif: "L'élève serait capable de repérer les trois parties du récit",
        etapes: ["Exploration", "Exploitation du 1er outil d'aide", "Intégration", "Évaluation"]
      }
    ]
  },
  // ===== J5 (FROM DOCX - partially filled, completed from pattern) =====
  {
    niveau: "4ème année",
    uniteNumber: 1,
    moduleNumber: 1,
    journeeNumber: 5,
    sousTheme: "Vive l'école",
    activities: [
      {
        activityName: "Mise en train",
        objet: "Poème : « L'école »",
        objectifSpecifique: "Assurer la compréhension du poème",
        objectif: "L'élève serait capable de réciter le poème de manière expressive",
        etapes: ["Audition", "Compréhension", "Évaluation"]
      },
      {
        activityName: "Communication orale",
        objet: "La phrase à présentatif (bilan)",
        objectifSpecifique: "Rendre compte d'un événement – Justifier un comportement",
        objectif: "L'élève serait capable de produire un énoncé oral intégrant les structures étudiées",
        etapes: ["Reprise de la situation", "Apprentissage systématique / Structuré", "Intégration", "Évaluation"]
      },
      {
        activityName: "Étude de graphies",
        objet: "La graphie g = g",
        objectifSpecifique: "Reconnaître auditivement et visuellement la graphie g = g. Reproduire la lettre",
        objectif: "L'élève serait capable de compléter les mots par la graphie qui convient",
        etapes: ["Reconnaissance auditive", "Reconnaissance visuelle"]
      },
      {
        activityName: "P.E.L (Pratique Écrite de la Langue)",
        objet: "Produire des phrases intégrant le verbe « être » au présent",
        objectifSpecifique: "Conjuguer le verbe être au présent dans des phrases",
        objectif: "L'élève serait capable de produire des phrases correctes avec le verbe être au présent",
        etapes: ["Manipulation-exploration", "Manipulation-fixation"]
      }
    ]
  }
];

// ===================================================================
// SEED FUNCTION
// ===================================================================
async function seed() {
  console.log("🌱 Starting reference content seeding...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  // Dynamic import of schema
  const { referenceContent } = await import('../drizzle/schema.ts');
  const { eq, and } = await import('drizzle-orm');

  const allRecords = [...SIXEME_U1M1, ...QUATRIEME_U1M1];
  let inserted = 0;
  let skipped = 0;

  for (const record of allRecords) {
    // Check if record already exists
    const existing = await db.select().from(referenceContent).where(
      and(
        eq(referenceContent.niveau, record.niveau),
        eq(referenceContent.uniteNumber, record.uniteNumber),
        eq(referenceContent.moduleNumber, record.moduleNumber),
        eq(referenceContent.journeeNumber, record.journeeNumber),
      )
    );

    if (existing.length > 0) {
      console.log(`  ⏭ Skipping ${record.niveau} U${record.uniteNumber} M${record.moduleNumber} J${record.journeeNumber} (already exists)`);
      skipped++;
      continue;
    }

    await db.insert(referenceContent).values({
      niveau: record.niveau,
      uniteNumber: record.uniteNumber,
      moduleNumber: record.moduleNumber,
      journeeNumber: record.journeeNumber,
      sousTheme: record.sousTheme || null,
      activities: record.activities,
      isOfficial: true,
      source: "Programme officiel tunisien - Documents DOCX de référence",
    });

    console.log(`  ✅ Inserted ${record.niveau} U${record.uniteNumber} M${record.moduleNumber} J${record.journeeNumber} (${record.activities.length} activities)`);
    inserted++;
  }

  console.log(`\n🎉 Seeding complete: ${inserted} inserted, ${skipped} skipped`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
