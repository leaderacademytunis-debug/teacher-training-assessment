import { createConnection } from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const conn = await createConnection(DATABASE_URL);

const templates = [
  // ─── SCIENCES NATURELLES / BIOLOGIE ───────────────────────────────────────
  {
    createdBy: 1,
    templateName: "Éveil scientifique - Le corps humain (2ème année primaire)",
    description: "Modèle pour une séance d'éveil scientifique sur les parties du corps humain, adapté aux élèves de 2ème année primaire.",
    educationLevel: "primary",
    grade: "2ème année primaire",
    subject: "Éveil scientifique",
    language: "french",
    duration: 45,
    lessonObjectives: "- Nommer les principales parties du corps humain\n- Associer chaque organe à sa fonction\n- Développer l'observation et la curiosité scientifique",
    materials: "- Affiche du corps humain\n- Cartes illustrées des organes\n- Manuel scolaire\n- Tableau et marqueurs de couleur\n- Fiches d'activités",
    introduction: "Jeu de devinettes : l'enseignant décrit une partie du corps et les élèves devinent. Puis discussion collective : « Pourquoi avons-nous besoin de notre corps ? »",
    mainActivities: JSON.stringify([
      { title: "Observation et identification", duration: 15, description: "Les élèves observent l'affiche du corps humain. Identification collective des parties principales (tête, tronc, membres). Chaque élève pointe les parties sur son propre corps." },
      { title: "Les organes et leurs fonctions", duration: 15, description: "Présentation des organes principaux (cœur, poumons, estomac, cerveau). Association organe → fonction à travers un jeu de cartes en binôme." },
      { title: "Activité de synthèse", duration: 10, description: "Compléter un schéma du corps humain en plaçant les étiquettes des organes. Correction collective au tableau." }
    ]),
    evaluation: "Évaluation formative : les élèves complètent un schéma simplifié du corps humain. L'enseignant observe la participation et la justesse des réponses.",
    assessmentCriteria: "- Nommer correctement au moins 5 parties du corps\n- Associer 3 organes à leur fonction\n- Participer activement aux activités",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Sciences de la vie - La photosynthèse (6ème année primaire)",
    description: "Modèle pour une leçon sur la photosynthèse et le rôle des plantes vertes dans l'écosystème.",
    educationLevel: "primary",
    grade: "6ème année primaire",
    subject: "Sciences de la vie et de la terre",
    language: "french",
    duration: 55,
    lessonObjectives: "- Expliquer le mécanisme de la photosynthèse\n- Identifier les éléments nécessaires à la photosynthèse (lumière, eau, CO₂)\n- Comprendre le rôle des plantes dans l'équilibre de l'écosystème",
    materials: "- Plantes vertes en pot\n- Lampe de bureau\n- Schéma de la photosynthèse\n- Feuilles de papier vert et blanc\n- Manuel scolaire SVT",
    introduction: "Question déclenchante : « Pourquoi les plantes ont-elles besoin de lumière pour vivre ? » Recueil des représentations initiales des élèves. Présentation d'une expérience simple (plante à la lumière vs plante dans l'obscurité).",
    mainActivities: JSON.stringify([
      { title: "Analyse de l'expérience", duration: 15, description: "Observation des deux plantes (lumière vs obscurité). Discussion sur les différences observées. Formulation d'hypothèses par les élèves." },
      { title: "Le mécanisme de la photosynthèse", duration: 20, description: "Étude du schéma de la photosynthèse : entrées (CO₂ + H₂O + lumière) et sorties (O₂ + glucose). Explication du rôle de la chlorophylle. Compléter le schéma avec les étiquettes." },
      { title: "Application et transfert", duration: 15, description: "Exercices : identifier les conditions nécessaires à la photosynthèse dans différents scénarios. Débat : « Pourquoi est-il important de préserver les forêts ? »" }
    ]),
    evaluation: "QCM de 5 questions sur le mécanisme de la photosynthèse. Schéma à compléter. Critère de réussite : 3/5 questions correctes.",
    assessmentCriteria: "- Citer les 3 éléments nécessaires à la photosynthèse\n- Expliquer le rôle de la chlorophylle\n- Relier la photosynthèse à l'équilibre écologique",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "SVT - La cellule vivante (1ère année collège)",
    description: "Modèle pour une séance sur la structure et les fonctions de la cellule, niveau 1ère année collège.",
    educationLevel: "middle",
    grade: "1ère année collège",
    subject: "Sciences de la vie et de la terre",
    language: "french",
    duration: 55,
    lessonObjectives: "- Décrire la structure d'une cellule animale et végétale\n- Distinguer les organites et leurs fonctions\n- Réaliser un schéma légendé d'une cellule",
    materials: "- Microscope optique\n- Préparations microscopiques (oignon, joue)\n- Schémas de cellules animales et végétales\n- Fiches d'observation\n- Manuels SVT",
    introduction: "Rappel : qu'est-ce qu'un être vivant ? Présentation de la question : « De quoi sont faits tous les êtres vivants ? » Observation d'images microscopiques de différents tissus.",
    mainActivities: JSON.stringify([
      { title: "Observation microscopique", duration: 20, description: "Observation de cellules d'oignon et de cellules de la joue au microscope. Dessin d'observation légendé. Identification des structures visibles (membrane, noyau, cytoplasme, vacuole, paroi)." },
      { title: "Comparaison cellule animale / végétale", duration: 20, description: "Compléter un tableau comparatif des deux types de cellules. Identification des points communs et des différences. Schéma bilan légendé des deux types." },
      { title: "Les fonctions cellulaires", duration: 10, description: "Associer chaque organite à sa fonction (noyau → information génétique, mitochondrie → énergie, chloroplaste → photosynthèse). Exercice d'application." }
    ]),
    evaluation: "Schéma d'une cellule végétale à légender (8 structures). Tableau comparatif à compléter. Critère : 6/8 structures correctement légendées.",
    assessmentCriteria: "- Légender correctement un schéma de cellule\n- Distinguer cellule animale et végétale\n- Associer organite et fonction",
    isPublic: true,
    usageCount: 0,
  },
  // ─── MATHÉMATIQUES ────────────────────────────────────────────────────────
  {
    createdBy: 1,
    templateName: "Mathématiques - La multiplication (3ème année primaire)",
    description: "Modèle pour une leçon sur la multiplication comme addition répétée, avec activités concrètes et manipulatoires.",
    educationLevel: "primary",
    grade: "3ème année primaire",
    subject: "Mathématiques",
    language: "french",
    duration: 50,
    lessonObjectives: "- Comprendre la multiplication comme addition répétée\n- Mémoriser les tables de multiplication (×2, ×3, ×4, ×5)\n- Résoudre des problèmes simples faisant appel à la multiplication",
    materials: "- Jetons et cubes de couleur\n- Tableau de multiplication affiché\n- Fiches d'exercices\n- Manuel de mathématiques\n- Ardoises individuelles",
    introduction: "Situation-problème : « La maîtresse veut distribuer 3 crayons à chacun des 4 groupes. Combien de crayons faut-il ? » Les élèves proposent leurs stratégies (comptage, addition, multiplication).",
    mainActivities: JSON.stringify([
      { title: "Découverte : addition répétée → multiplication", duration: 15, description: "Manipulation de jetons : former 4 groupes de 3 jetons. Écrire l'addition correspondante (3+3+3+3=12). Introduire la notation multiplicative (4×3=12). Plusieurs exemples avec manipulation." },
      { title: "Construction des tables", duration: 20, description: "Construction collective de la table de ×3 en utilisant les jetons. Les élèves complètent la table de ×4 en binôme. Jeu de mémorisation : flashcards des tables." },
      { title: "Résolution de problèmes", duration: 10, description: "3 problèmes contextualisés à résoudre individuellement. Correction collective avec justification de la démarche." }
    ]),
    evaluation: "Dictée de 5 opérations de multiplication (tables ×2 à ×5). Résolution d'un problème avec schéma. Critère de réussite : 4/5 opérations correctes.",
    assessmentCriteria: "- Écrire une multiplication à partir d'une addition répétée\n- Calculer mentalement les tables de ×2 à ×5\n- Résoudre un problème multiplicatif simple",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Mathématiques - Les fractions (5ème année primaire)",
    description: "Modèle pour introduire la notion de fraction comme partie d'un tout, avec activités concrètes et représentations variées.",
    educationLevel: "primary",
    grade: "5ème année primaire",
    subject: "Mathématiques",
    language: "french",
    duration: 55,
    lessonObjectives: "- Comprendre la notion de fraction comme partie d'un tout\n- Lire et écrire une fraction (numérateur/dénominateur)\n- Représenter une fraction sur une droite graduée et par un dessin\n- Comparer des fractions simples",
    materials: "- Disques et rectangles découpables\n- Droite numérique affichée\n- Fiches quadrillées\n- Manuel de mathématiques\n- Réglettes Cuisenaire",
    introduction: "Partage d'une pizza (dessin) en parts égales. Question : « Si je prends 3 parts sur 8, comment l'écrire ? » Recueil des représentations initiales.",
    mainActivities: JSON.stringify([
      { title: "Construction du concept de fraction", duration: 15, description: "Plier et découper des disques en 2, 4, 8 parts égales. Colorier une fraction donnée. Nommer : numérateur (parties prises) et dénominateur (parties totales). Lecture et écriture de fractions simples." },
      { title: "Représentations multiples", duration: 20, description: "Représenter 3/4 sur un dessin, sur une droite graduée, et avec les réglettes. Passer d'une représentation à l'autre. Travail en groupes de 3." },
      { title: "Comparaison de fractions", duration: 15, description: "Comparer des fractions de même dénominateur (2/5 et 4/5). Comparer des fractions de même numérateur (1/3 et 1/5). Utiliser < et > avec justification." }
    ]),
    evaluation: "Exercice : lire, écrire et représenter 5 fractions. Comparer 4 paires de fractions. Critère : 7/9 réponses correctes.",
    assessmentCriteria: "- Lire et écrire correctement une fraction\n- Représenter une fraction par un dessin et sur une droite\n- Comparer deux fractions simples avec justification",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Mathématiques - Équations du 1er degré (2ème année collège)",
    description: "Modèle pour une leçon sur la résolution d'équations du premier degré à une inconnue, niveau 2ème année collège.",
    educationLevel: "middle",
    grade: "2ème année collège",
    subject: "Mathématiques",
    language: "french",
    duration: 55,
    lessonObjectives: "- Reconnaître une équation du premier degré\n- Résoudre une équation du premier degré à une inconnue\n- Vérifier la solution trouvée\n- Modéliser un problème par une équation",
    materials: "- Tableau blanc et marqueurs\n- Fiches d'exercices graduées\n- Manuel de mathématiques\n- Calculatrices (pour vérification)",
    introduction: "Devinette : « Je pense à un nombre. Si je lui ajoute 7, j'obtiens 15. Quel est ce nombre ? » Les élèves proposent leurs méthodes. Introduction du vocabulaire : inconnue, équation, solution.",
    mainActivities: JSON.stringify([
      { title: "Résolution par équivalence", duration: 20, description: "Règles d'équivalence : on peut ajouter/soustraire le même nombre des deux membres. Exemples progressifs : x+5=12, 2x=10, 3x-4=11. Résolution pas à pas au tableau avec participation des élèves." },
      { title: "Pratique guidée puis autonome", duration: 20, description: "5 équations à résoudre en binôme (niveaux croissants). Correction immédiate. 3 équations à résoudre individuellement. Vérification systématique par substitution." },
      { title: "Modélisation", duration: 10, description: "2 problèmes à modéliser par une équation et résoudre. Discussion sur la démarche de modélisation." }
    ]),
    evaluation: "Résoudre 4 équations du 1er degré et vérifier les solutions. Modéliser et résoudre 1 problème. Critère : 4/5 réponses correctes.",
    assessmentCriteria: "- Appliquer les règles d'équivalence correctement\n- Vérifier la solution par substitution\n- Modéliser un problème simple par une équation",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Mathématiques - Fonctions affines (2ème année lycée)",
    description: "Modèle pour une leçon sur les fonctions affines : définition, représentation graphique et applications.",
    educationLevel: "secondary",
    grade: "2ème année lycée",
    subject: "Mathématiques",
    language: "french",
    duration: 60,
    lessonObjectives: "- Définir une fonction affine f(x) = ax + b\n- Tracer la représentation graphique d'une fonction affine\n- Interpréter les coefficients a (pente) et b (ordonnée à l'origine)\n- Résoudre des problèmes faisant appel aux fonctions affines",
    materials: "- Papier millimétré\n- Règles et équerres\n- Calculatrices graphiques ou GeoGebra (si disponible)\n- Fiches d'exercices\n- Manuel de mathématiques",
    introduction: "Situation réelle : un taxi facture 2 DT/km + 5 DT de prise en charge. Modéliser le coût en fonction de la distance. Tracer le graphe. Introduire la notion de fonction affine à partir de cet exemple.",
    mainActivities: JSON.stringify([
      { title: "Définition et propriétés", duration: 15, description: "Définition formelle : f(x) = ax + b. Rôle de a (coefficient directeur/pente) et b (ordonnée à l'origine). Cas particuliers : fonction linéaire (b=0), fonction constante (a=0). Exemples variés." },
      { title: "Représentation graphique", duration: 25, description: "Méthode : tableau de valeurs → tracé de la droite. Tracé de 3 fonctions affines différentes. Lecture graphique : trouver f(x) pour une valeur donnée. Comparer les pentes de plusieurs droites." },
      { title: "Applications et problèmes", duration: 15, description: "Modéliser 2 situations réelles par des fonctions affines. Trouver le point d'intersection de deux droites (résolution graphique et algébrique). Interpréter le résultat dans le contexte." }
    ]),
    evaluation: "Tracer la représentation graphique de f(x) = 2x - 3. Répondre à 3 questions de lecture graphique. Résoudre un problème de modélisation. Critère : 6/8 points.",
    assessmentCriteria: "- Tracer correctement la droite représentative\n- Interpréter les coefficients a et b\n- Modéliser une situation réelle par une fonction affine",
    isPublic: true,
    usageCount: 0,
  },
  // ─── PHYSIQUE-CHIMIE ──────────────────────────────────────────────────────
  {
    createdBy: 1,
    templateName: "Physique-Chimie - Les états de la matière (4ème année primaire)",
    description: "Modèle pour une séance d'éveil scientifique sur les trois états de la matière avec expériences simples.",
    educationLevel: "primary",
    grade: "4ème année primaire",
    subject: "Éveil scientifique",
    language: "french",
    duration: 50,
    lessonObjectives: "- Identifier les trois états de la matière (solide, liquide, gazeux)\n- Décrire les propriétés de chaque état\n- Reconnaître les changements d'état dans la vie quotidienne",
    materials: "- Glaçons, eau, vapeur d'eau (bouilloire)\n- Récipients de formes variées\n- Thermomètre\n- Fiches d'observation\n- Affiche des états de la matière",
    introduction: "Présenter un glaçon, de l'eau et de la vapeur. Demander : « Sont-ce la même chose ? Qu'est-ce qui les différencie ? » Recueil des représentations initiales.",
    mainActivities: JSON.stringify([
      { title: "Exploration des trois états", duration: 20, description: "Manipulation : toucher le glaçon (solide), verser l'eau dans différents récipients (liquide), observer la vapeur (gazeux). Compléter une fiche d'observation : forme, volume, compressibilité. Mise en commun des observations." },
      { title: "Les changements d'état", duration: 15, description: "Observer la fusion du glaçon (solide → liquide). Observer l'évaporation de l'eau chauffée (liquide → gazeux). Nommer les changements d'état : fusion, solidification, vaporisation, condensation. Compléter le schéma des changements d'état." },
      { title: "Exemples de la vie quotidienne", duration: 10, description: "Associer des exemples du quotidien aux changements d'état (glace fondante, rosée, vapeur de douche, congélation). Jeu de classement en groupes." }
    ]),
    evaluation: "Classer 8 exemples dans le bon état de la matière. Nommer 2 changements d'état à partir d'images. Critère : 7/10 réponses correctes.",
    assessmentCriteria: "- Identifier l'état de la matière d'un objet donné\n- Nommer au moins 3 changements d'état\n- Donner un exemple de la vie quotidienne pour chaque état",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Physique - Les circuits électriques (3ème année collège)",
    description: "Modèle pour une leçon sur les circuits électriques simples : composants, schémas et lois de base.",
    educationLevel: "middle",
    grade: "3ème année collège",
    subject: "Physique-Chimie",
    language: "french",
    duration: 55,
    lessonObjectives: "- Identifier les composants d'un circuit électrique simple\n- Réaliser et schématiser un circuit série et un circuit parallèle\n- Mesurer la tension et l'intensité avec un multimètre\n- Appliquer la loi d'Ohm dans des situations simples",
    materials: "- Piles, ampoules, interrupteurs, fils électriques\n- Multimètres\n- Résistances variées\n- Fiches de schématisation\n- Manuel de physique",
    introduction: "Question : « Pourquoi une ampoule s'allume-t-elle quand on appuie sur l'interrupteur ? » Présentation d'un circuit simple. Recueil des représentations initiales des élèves.",
    mainActivities: JSON.stringify([
      { title: "Réalisation et schématisation", duration: 20, description: "Réaliser un circuit série (pile + ampoule + interrupteur). Schématiser avec les symboles normalisés. Comparer avec un circuit parallèle. Observer les différences de luminosité." },
      { title: "Mesures électriques", duration: 20, description: "Utiliser le multimètre pour mesurer la tension (voltmètre en dérivation) et l'intensité (ampèremètre en série). Vérifier la loi des nœuds dans un circuit parallèle. Compléter un tableau de mesures." },
      { title: "Loi d'Ohm", duration: 10, description: "Introduire U = R × I. Calculer la résistance d'un dipôle à partir des mesures. Résoudre 2 exercices d'application." }
    ]),
    evaluation: "Schématiser un circuit donné avec les symboles normalisés. Calculer U, I ou R à partir de la loi d'Ohm (3 exercices). Critère : 5/6 réponses correctes.",
    assessmentCriteria: "- Schématiser correctement un circuit électrique\n- Utiliser correctement un multimètre\n- Appliquer la loi d'Ohm",
    isPublic: true,
    usageCount: 0,
  },
  // ─── LANGUE FRANÇAISE ─────────────────────────────────────────────────────
  {
    createdBy: 1,
    templateName: "Français - Expression écrite : La description (5ème année primaire)",
    description: "Modèle pour une séance d'expression écrite axée sur la description d'un lieu ou d'un personnage, avec travail sur les adjectifs qualificatifs.",
    educationLevel: "primary",
    grade: "5ème année primaire",
    subject: "Français",
    language: "french",
    duration: 55,
    lessonObjectives: "- Produire un texte descriptif cohérent (8 à 10 lignes)\n- Utiliser des adjectifs qualificatifs variés et précis\n- Organiser la description de manière logique (du général au particulier)\n- Respecter les accords grammaticaux de base",
    materials: "- Images de paysages et de personnages variés\n- Dictionnaire illustré\n- Fiches de vocabulaire thématique\n- Manuel de français\n- Cahiers de rédaction",
    introduction: "Présenter une image d'un paysage. Jeu : chaque élève dit un mot pour décrire l'image. Recenser les adjectifs au tableau. Discussion : « Qu'est-ce qu'un texte descriptif ? »",
    mainActivities: JSON.stringify([
      { title: "Analyse d'un texte descriptif modèle", duration: 15, description: "Lecture d'un texte descriptif court. Identifier les adjectifs et les souligner. Analyser l'organisation : du général (vue d'ensemble) au particulier (détails). Relever les connecteurs spatiaux (à gauche, au fond, près de...)." },
      { title: "Enrichissement du vocabulaire", duration: 10, description: "Classer les adjectifs par catégorie : couleurs, formes, tailles, textures, sentiments. Exercice de substitution : remplacer un adjectif banal par un adjectif plus précis. Jeu du portrait : décrire un élève sans le nommer." },
      { title: "Production écrite guidée", duration: 25, description: "Choisir une image parmi 3 proposées. Planifier la description (schéma de plan). Rédiger un texte de 8 à 10 lignes. Relecture guidée : vérifier les accords, la ponctuation, la richesse du vocabulaire." }
    ]),
    evaluation: "Grille d'évaluation de la production écrite : cohérence (4 pts), richesse du vocabulaire (4 pts), correction grammaticale (4 pts), organisation (4 pts), présentation (4 pts). Total : 20 pts.",
    assessmentCriteria: "- Produire un texte de 8 lignes minimum\n- Utiliser au moins 10 adjectifs qualificatifs variés\n- Respecter l'organisation descriptive\n- Accords corrects dans 80% des cas",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Français - Grammaire : Les temps du récit (1ère année collège)",
    description: "Modèle pour une leçon sur l'emploi du passé composé et de l'imparfait dans un récit au passé.",
    educationLevel: "middle",
    grade: "1ère année collège",
    subject: "Français",
    language: "french",
    duration: 55,
    lessonObjectives: "- Distinguer les emplois du passé composé et de l'imparfait dans un récit\n- Conjuguer correctement les verbes au passé composé et à l'imparfait\n- Produire un court récit en utilisant correctement les deux temps",
    materials: "- Texte narratif support (extrait littéraire)\n- Tableau de conjugaison\n- Fiches d'exercices\n- Manuel de français\n- Cahiers de grammaire",
    introduction: "Lecture d'un court extrait narratif contenant passé composé et imparfait. Question : « Repérez les verbes conjugués. Sont-ils tous au même temps ? Pourquoi ? »",
    mainActivities: JSON.stringify([
      { title: "Observation et conceptualisation", duration: 20, description: "Relever les verbes du texte et les classer en deux colonnes (PC / Imparfait). Analyser les valeurs : PC = action accomplie, événement ponctuel ; Imparfait = description, habitude, action en cours. Formuler la règle collectivement." },
      { title: "Exercices d'application", duration: 20, description: "Exercice 1 : mettre des verbes entre parenthèses au temps qui convient. Exercice 2 : compléter un récit lacunaire. Exercice 3 : transformer un texte au présent en récit au passé. Correction collective avec justification." },
      { title: "Production guidée", duration: 10, description: "Rédiger 5 à 6 phrases racontant un souvenir d'enfance en utilisant les deux temps. Échange en binôme pour correction mutuelle." }
    ]),
    evaluation: "Conjuguer 10 verbes au temps qui convient dans un texte narratif. Rédiger un paragraphe de 5 phrases au passé. Critère : 8/10 verbes correctement conjugués.",
    assessmentCriteria: "- Distinguer les valeurs du PC et de l'imparfait\n- Conjuguer correctement les verbes aux deux temps\n- Justifier le choix du temps utilisé",
    isPublic: true,
    usageCount: 0,
  },
  {
    createdBy: 1,
    templateName: "Français - Compréhension de l'écrit : Texte argumentatif (2ème année lycée)",
    description: "Modèle pour une séance de compréhension et d'analyse d'un texte argumentatif, avec travail sur la structure et les procédés rhétoriques.",
    educationLevel: "secondary",
    grade: "2ème année lycée",
    subject: "Français",
    language: "french",
    duration: 60,
    lessonObjectives: "- Identifier la thèse, les arguments et les exemples dans un texte argumentatif\n- Analyser les procédés rhétoriques (concession, réfutation, analogie)\n- Distinguer fait et opinion\n- Produire un plan argumentatif structuré",
    materials: "- Texte argumentatif (article de presse ou extrait d'essai)\n- Fiche de lecture analytique\n- Manuel de français lycée\n- Dictionnaire de rhétorique",
    introduction: "Présenter le sujet du texte (ex : les réseaux sociaux et la jeunesse). Recueil des opinions des élèves. Distinction fait / opinion à partir d'exemples simples. Présentation de la notion de texte argumentatif.",
    mainActivities: JSON.stringify([
      { title: "Lecture et identification de la structure", duration: 20, description: "Lecture silencieuse puis à voix haute. Identifier : la thèse défendue, les arguments principaux (au moins 3), les exemples illustratifs. Schématiser la structure argumentative." },
      { title: "Analyse des procédés rhétoriques", duration: 25, description: "Repérer et analyser : les connecteurs logiques (de plus, cependant, en revanche...), les procédés de concession et de réfutation, les figures de style argumentatives (analogie, hyperbole, ironie). Analyser l'effet produit sur le lecteur." },
      { title: "Vers la production", duration: 10, description: "Élaborer un plan argumentatif sur un sujet proche. Rédiger une introduction avec thèse et annonce du plan. Échange et correction en binôme." }
    ]),
    evaluation: "Questions de compréhension (6 pts) + analyse d'un procédé rhétorique (4 pts) + rédaction d'un paragraphe argumentatif (10 pts). Total : 20 pts.",
    assessmentCriteria: "- Identifier correctement la thèse et 3 arguments\n- Analyser un procédé rhétorique avec exemple\n- Rédiger un paragraphe argumentatif structuré (thèse + argument + exemple)",
    isPublic: true,
    usageCount: 0,
  },
];

console.log(`Inserting ${templates.length} new templates...`);

let inserted = 0;
for (const t of templates) {
  try {
    // Use assessmentCriteria as conclusion (no dedicated column in schema)
    await conn.execute(
      `INSERT INTO templates 
        (createdBy, templateName, description, educationLevel, grade, subject, language, duration,
         lessonObjectives, materials, introduction, mainActivities, conclusion, evaluation,
         isPublic, usageCount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.createdBy, t.templateName, t.description, t.educationLevel, t.grade, t.subject,
        t.language, t.duration, t.lessonObjectives, t.materials, t.introduction,
        t.mainActivities, t.assessmentCriteria, t.evaluation, t.isPublic ? 1 : 0, t.usageCount,
      ]
    );
    inserted++;
    console.log(`✓ [${inserted}/${templates.length}] ${t.templateName}`);
  } catch (err) {
    console.error(`✗ Error inserting "${t.templateName}":`, err.message);
  }
}

await conn.end();
console.log(`\nDone: ${inserted}/${templates.length} templates inserted.`);
