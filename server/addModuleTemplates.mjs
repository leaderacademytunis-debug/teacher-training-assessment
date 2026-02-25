import { drizzle } from "drizzle-orm/mysql2";
import { templates } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Templates based on the 8 modules from the manual
const moduleTemplates = [
  {
    templateName: "Module 1: Travailler pour s'épanouir - Leçon de lecture",
    description: "Modèle basé sur le module 1 du manuel officiel 6ème année",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français",
    language: "french",
    duration: 55,
    lessonObjectives: "- Lire et comprendre des textes variés sur le thème du travail\n- Enrichir le vocabulaire lié aux métiers\n- Identifier les personnages et leurs actions\n- Développer l'expression orale et écrite",
    materials: "- Manuel de lecture (Module 1)\n- Tableau et marqueurs\n- Images de différents métiers\n- Fiches d'exercices\n- Cahier d'activités",
    introduction: "Rappel des connaissances antérieures sur les métiers. Présentation du thème \"Travailler pour s'épanouir\". Motivation des élèves par des questions: Quel métier voulez-vous exercer? Pourquoi le travail est-il important?",
    mainActivities: [
      {
        title: "Lecture magistrale et individuelle",
        description: "L'enseignant lit le texte choisi (ex: Apprentie comédienne, Une parfumeuse en herbe) avec expression. Les élèves suivent puis lisent à leur tour.",
        duration: 15
      },
      {
        title: "Compréhension et analyse",
        description: "Questions de compréhension sur le texte. Identification des personnages, du lieu, des actions. Discussion sur le métier présenté.",
        duration: 20
      },
      {
        title: "Exploitation linguistique",
        description: "Vocabulaire lié au travail. Grammaire: reconnaître et utiliser les déterminants, les noms et les pronoms personnels. Conjugaison: reconnaître les trois temps.",
        duration: 20
      }
    ],
    conclusion: "Synthèse des points importants. Récitation du poème \"Au travail\" ou \"Le boulanger\". Préparation du projet d'écriture: raconter un événement en rapport avec le travail.",
    evaluation: "- Observation de la participation\n- Évaluation de la lecture à haute voix\n- Questions de compréhension\n- Exercices du cahier d'activités",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Module 2: Communiquer avec les autres - Leçon de lecture",
    description: "Modèle basé sur le module 2 du manuel officiel 6ème année",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français",
    language: "french",
    duration: 55,
    lessonObjectives: "- Lire et comprendre des textes sur la communication\n- Découvrir le monde du journalisme\n- Développer les compétences de communication\n- Enrichir le vocabulaire des médias",
    materials: "- Manuel de lecture (Module 2)\n- Exemples de journaux\n- Tableau et marqueurs\n- Matériel pour créer une maquette de journal",
    introduction: "Discussion sur les moyens de communication. Présentation de différents types de médias. Questions d'anticipation sur le texte à lire.",
    mainActivities: [
      {
        title: "Lecture et découverte",
        description: "Lecture du texte choisi (Le vieux robot, Le monde du journalisme). Compréhension globale puis détaillée.",
        duration: 15
      },
      {
        title: "Analyse et discussion",
        description: "Questions de compréhension. Discussion sur l'importance de la communication. Analyse des personnages et de leurs interactions.",
        duration: 15
      },
      {
        title: "Production et grammaire",
        description: "Grammaire: les déterminants possessifs et démonstratifs. Conjugaison: verbes en -er, -ir et 3e groupe à l'impératif. Projet: faire la maquette d'un journal.",
        duration: 25
      }
    ],
    conclusion: "Récitation du poème \"Les machines\" ou \"Conversation\". Synthèse sur l'importance de bien communiquer. Présentation des travaux d'élèves.",
    evaluation: "- Participation aux discussions\n- Lecture expressive\n- Qualité de la maquette du journal\n- Exercices grammaticaux",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Module 3: Accepter les autres - Leçon de lecture",
    description: "Modèle basé sur le module 3 du manuel officiel 6ème année",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français",
    language: "french",
    duration: 55,
    lessonObjectives: "- Comprendre l'importance de la solidarité et du respect des différences\n- Lire et analyser des textes sur la tolérance\n- Développer l'empathie et l'acceptation de l'autre\n- Enrichir le vocabulaire des valeurs humaines",
    materials: "- Manuel de lecture (Module 3)\n- Images illustrant la diversité\n- Tableau et marqueurs\n- Fiches de travail sur les valeurs",
    introduction: "Discussion sur les différences entre les personnes. Importance du respect et de l'acceptation. Présentation du thème à travers des exemples concrets.",
    mainActivities: [
      {
        title: "Lecture et compréhension",
        description: "Lecture du texte (Le petit lapin blanc, L'Indien qui ne savait pas courir). Identification du message principal sur l'acceptation des différences.",
        duration: 15
      },
      {
        title: "Réflexion et débat",
        description: "Discussion sur les situations de discrimination ou d'acceptation. Partage d'expériences personnelles. Analyse des comportements des personnages.",
        duration: 20
      },
      {
        title: "Expression et langue",
        description: "Grammaire: les adjectifs (épithète et attribut). Conjugaison: être et avoir au futur et passé composé. Orthographe: homophones son/sont.",
        duration: 20
      }
    ],
    conclusion: "Récitation \"Marie et moi\" ou \"Donne autour de toi\". Synthèse sur les valeurs de solidarité. Préparation du projet d'écriture avec dialogue entre personnages.",
    evaluation: "- Qualité de la participation au débat\n- Compréhension du message du texte\n- Exercices de grammaire et conjugaison\n- Projet d'écriture",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Module 5: Sauver la nature - Leçon de lecture",
    description: "Modèle basé sur le module 5 du manuel officiel 6ème année",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français",
    language: "french",
    duration: 55,
    lessonObjectives: "- Sensibiliser à la protection de l'environnement\n- Lire et comprendre des textes sur l'écologie\n- Développer des comportements éco-responsables\n- Enrichir le vocabulaire environnemental",
    materials: "- Manuel de lecture (Module 5)\n- Images de la nature et de la pollution\n- Matériel pour activités pratiques (recyclage)\n- Vidéos sur l'environnement",
    introduction: "Discussion sur les problèmes environnementaux actuels. Observation d'images de nature polluée vs préservée. Questions sur les gestes éco-responsables.",
    mainActivities: [
      {
        title: "Lecture et sensibilisation",
        description: "Lecture de textes (Sauvez Keiko, La ménagère de la mer, Comment éviter le gaspillage de l'eau). Compréhension des enjeux environnementaux.",
        duration: 15
      },
      {
        title: "Analyse et solutions",
        description: "Identification des problèmes environnementaux dans les textes. Discussion sur les solutions possibles. Partage d'idées pour protéger la nature.",
        duration: 20
      },
      {
        title: "Production et langue",
        description: "Grammaire: compléments essentiels et non essentiels. Conjugaison: verbes prendre et mettre. Projet: fabriquer une famille de cygnes (recyclage).",
        duration: 20
      }
    ],
    conclusion: "Récitation \"Qu'elle est belle la terre!\" ou \"L'arbre volant\". Engagement des élèves pour des actions concrètes. Présentation des créations en matériaux recyclés.",
    evaluation: "- Compréhension des enjeux environnementaux\n- Qualité des propositions de solutions\n- Créativité dans le projet de recyclage\n- Exercices de langue",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  }
];

async function addTemplates() {
  try {
    console.log("Adding module templates to database...");
    
    for (const template of moduleTemplates) {
      await db.insert(templates).values(template);
      console.log(`✓ Added: ${template.templateName}`);
    }
    
    console.log(`\n✅ Successfully added ${moduleTemplates.length} module templates!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding templates:", error);
    process.exit(1);
  }
}

addTemplates();
