import { drizzle } from "drizzle-orm/mysql2";
import { templates } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Specialized templates for grammar, writing, and orthography
const specializedTemplates = [
  {
    templateName: "Grammaire 6ème année - Les déterminants",
    description: "Leçon de grammaire sur les déterminants (article, possessif, démonstratif)",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français - Grammaire",
    language: "french",
    duration: 45,
    lessonObjectives: "- Reconnaître les différents types de déterminants\n- Utiliser correctement les déterminants dans une phrase\n- Distinguer les déterminants possessifs et démonstratifs\n- Appliquer les règles dans des exercices",
    materials: "- Manuel de lecture (tableau de bord)\n- Cahier d'activités\n- Tableau et marqueurs\n- Fiches d'exercices\n- Étiquettes avec des déterminants",
    introduction: "Rappel: qu'est-ce qu'un déterminant? Observation de phrases au tableau. Identification des mots qui accompagnent les noms.",
    mainActivities: [
      {
        title: "Découverte et observation",
        description: "Présentation de phrases contenant différents déterminants. Les élèves identifient les déterminants et les classent par catégorie.",
        duration: 15
      },
      {
        title: "Règle et manipulation",
        description: "Explication de la règle. Manipulation: remplacer un déterminant par un autre. Observer les changements de sens.",
        duration: 15
      },
      {
        title: "Application",
        description: "Exercices d'application du cahier d'activités. Correction collective. Jeu avec les étiquettes de déterminants.",
        duration: 15
      }
    ],
    conclusion: "Synthèse de la règle. Les élèves donnent des exemples. Exercices à faire à la maison.",
    evaluation: "- Participation orale\n- Exercices écrits\n- Capacité à identifier et utiliser les déterminants\n- Correction des devoirs",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Conjugaison 6ème année - Passé composé",
    description: "Leçon de conjugaison sur le passé composé avec être et avoir",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français - Conjugaison",
    language: "french",
    duration: 45,
    lessonObjectives: "- Reconnaître le passé composé\n- Conjuguer les verbes au passé composé\n- Choisir le bon auxiliaire (être ou avoir)\n- Accorder le participe passé avec être",
    materials: "- Tableaux de conjugaison\n- Cahier d'activités\n- Tableau et marqueurs\n- Fiches de verbes\n- Exercices d'application",
    introduction: "Rappel des temps déjà étudiés. Observation de phrases au passé composé. Question: comment exprime-t-on une action passée et terminée?",
    mainActivities: [
      {
        title: "Formation du passé composé",
        description: "Explication: auxiliaire (être/avoir) + participe passé. Observation de la formation avec différents verbes. Règles de choix de l'auxiliaire.",
        duration: 15
      },
      {
        title: "Conjugaison et accord",
        description: "Conjugaison de verbes modèles. Règle d'accord du participe passé avec être. Exercices de transformation présent → passé composé.",
        duration: 15
      },
      {
        title: "Pratique et consolidation",
        description: "Exercices variés du cahier. Phrases à compléter. Texte à transformer au passé composé. Correction collective.",
        duration: 15
      }
    ],
    conclusion: "Récapitulation de la règle. Les élèves conjuguent oralement des verbes. Mémorisation des participes passés irréguliers.",
    evaluation: "- Conjugaison orale\n- Exercices écrits\n- Dictée de verbes au passé composé\n- Contrôle écrit",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Expression écrite 6ème année - Raconter un événement",
    description: "Projet d'écriture: raconter un événement personnel",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français - Expression écrite",
    language: "french",
    duration: 55,
    lessonObjectives: "- Planifier son récit (début, milieu, fin)\n- Utiliser un vocabulaire riche et précis\n- Respecter la chronologie des événements\n- Intégrer des passages descriptifs et des dialogues\n- Réviser et améliorer son texte",
    materials: "- Fiche-contrat du projet d'écriture\n- Cahier de production\n- Exemples de récits\n- Grille d'évaluation\n- Dictionnaire",
    introduction: "Rappel du projet d'écriture du module. Lecture d'un exemple de récit. Identification de la structure: situation initiale, événement, situation finale.",
    mainActivities: [
      {
        title: "Planification",
        description: "Choix du thème et de l'événement à raconter. Élaboration du plan: qui? quoi? où? quand? comment? Listing du vocabulaire nécessaire.",
        duration: 15
      },
      {
        title: "Rédaction du brouillon",
        description: "Écriture de la première version. L'enseignant circule et aide individuellement. Attention à la chronologie et aux temps verbaux (passé composé, imparfait).",
        duration: 25
      },
      {
        title: "Révision et amélioration",
        description: "Relecture individuelle avec grille d'auto-évaluation. Correction des erreurs. Enrichissement avec des adjectifs, des compléments. Échange entre pairs.",
        duration: 15
      }
    ],
    conclusion: "Quelques élèves lisent leur production. Commentaires positifs de la classe. Recopie au propre pour la séance suivante.",
    evaluation: "- Respect de la consigne\n- Structure du récit\n- Richesse du vocabulaire\n- Correction de la langue\n- Originalité et créativité",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Orthographe 6ème année - Les homophones",
    description: "Leçon d'orthographe sur les homophones (a/à, son/sont, et/est)",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français - Orthographe",
    language: "french",
    duration: 45,
    lessonObjectives: "- Distinguer les homophones grammaticaux\n- Appliquer les techniques de substitution\n- Écrire correctement les homophones dans un texte\n- Éviter les confusions fréquentes",
    materials: "- Phrases au tableau\n- Cahier d'activités\n- Fiches d'exercices\n- Textes à trous\n- Ardoises pour réponses rapides",
    introduction: "Observation de phrases contenant des homophones. Constat: même prononciation, orthographe et sens différents. Problématique: comment les distinguer?",
    mainActivities: [
      {
        title: "Découverte et analyse",
        description: "Étude de chaque paire d'homophones. Nature grammaticale. Technique de substitution (a→avait, à→préposition, son→possessif, sont→étaient, et→et puis, est→était).",
        duration: 15
      },
      {
        title: "Manipulation et application",
        description: "Exercices de substitution. Phrases à compléter. Choix du bon homophone. Justification du choix par la technique apprise.",
        duration: 15
      },
      {
        title: "Consolidation",
        description: "Dictée de phrases contenant des homophones. Correction immédiate. Jeu: l'enseignant dit une phrase, les élèves écrivent l'homophone sur l'ardoise.",
        duration: 15
      }
    ],
    conclusion: "Récapitulation des techniques de substitution. Affichage d'un mémo dans la classe. Exercices de révision à faire à la maison.",
    evaluation: "- Exercices écrits\n- Dictée ciblée\n- Observation lors du jeu\n- Production écrite ultérieure",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Lecture compréhension 6ème année - Texte narratif",
    description: "Séance de lecture et compréhension d'un texte narratif",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français - Lecture",
    language: "french",
    duration: 55,
    lessonObjectives: "- Lire de manière fluide et expressive\n- Comprendre le sens global et les détails du texte\n- Identifier les personnages, le lieu, le temps\n- Dégager la structure narrative\n- Enrichir le vocabulaire",
    materials: "- Manuel de lecture\n- Texte projeté ou au tableau\n- Fiches de compréhension\n- Dictionnaire\n- Images illustratives",
    introduction: "Observation de l'illustration. Hypothèses sur le contenu du texte à partir du titre. Motivation: présentation du thème de manière attractive.",
    mainActivities: [
      {
        title: "Lecture magistrale et silencieuse",
        description: "L'enseignant lit le texte avec expression. Les élèves suivent. Puis lecture silencieuse individuelle. Vérification de la compréhension globale.",
        duration: 15
      },
      {
        title: "Compréhension détaillée",
        description: "Questions de compréhension: Qui? Quoi? Où? Quand? Comment? Pourquoi? Identification de la structure: situation initiale, événement, situation finale. Analyse des personnages.",
        duration: 20
      },
      {
        title: "Exploitation linguistique",
        description: "Explication du vocabulaire difficile. Recherche de synonymes. Relevé de phrases importantes. Lecture à haute voix par les élèves (travail de l'intonation).",
        duration: 20
      }
    ],
    conclusion: "Résumé oral du texte par les élèves. Discussion sur le message ou la morale. Lien avec les expériences personnelles des élèves.",
    evaluation: "- Qualité de la lecture à haute voix\n- Réponses aux questions de compréhension\n- Participation aux discussions\n- Capacité à résumer",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  },
  {
    templateName: "Poésie 6ème année - Récitation et appréciation",
    description: "Séance de poésie: apprentissage et récitation d'un poème",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Français - Poésie",
    language: "french",
    duration: 45,
    lessonObjectives: "- Découvrir et apprécier un poème\n- Comprendre le sens et les images poétiques\n- Mémoriser et réciter avec expression\n- Développer la sensibilité artistique",
    materials: "- Texte du poème (manuel ou affiché)\n- Enregistrement audio du poème (si disponible)\n- Images ou musique en rapport avec le thème\n- Cahier de poésie",
    introduction: "Présentation du poète et du contexte. Écoute d'un enregistrement ou lecture expressive par l'enseignant. Première impression des élèves.",
    mainActivities: [
      {
        title: "Découverte et compréhension",
        description: "Lecture du poème vers par vers. Explication du vocabulaire et des images poétiques. Discussion sur le thème, les sentiments exprimés, les sonorités.",
        duration: 15
      },
      {
        title: "Mémorisation",
        description: "Lecture répétée du poème (collective, par groupes, individuelle). Mémorisation progressive strophe par strophe. Travail sur l'intonation et le rythme.",
        duration: 20
      },
      {
        title: "Récitation",
        description: "Quelques élèves récitent devant la classe. Conseils pour améliorer l'expression. Copie du poème dans le cahier avec illustration.",
        duration: 10
      }
    ],
    conclusion: "Appréciation collective du poème. Partage des sentiments ressentis. Annonce de la récitation individuelle pour la prochaine séance.",
    evaluation: "- Compréhension du poème\n- Qualité de la mémorisation\n- Expression et intonation lors de la récitation\n- Présentation du cahier",
    isPublic: true,
    usageCount: 0,
    createdBy: 1
  }
];

async function addTemplates() {
  try {
    console.log("Adding specialized templates to database...");
    
    for (const template of specializedTemplates) {
      await db.insert(templates).values(template);
      console.log(`✓ Added: ${template.templateName}`);
    }
    
    console.log(`\n✅ Successfully added ${specializedTemplates.length} specialized templates!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding templates:", error);
    process.exit(1);
  }
}

addTemplates();
