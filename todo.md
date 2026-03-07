# Liste des tâches - Plateforme de gestion de formation pour enseignants

## Phase 1: Architecture et planification
- [x] Définir la structure de la base de données
- [x] Planifier les routes et l'architecture de l'application

## Phase 2: Base de données
- [x] Créer le schéma pour les formations (7 types)
- [x] Créer le schéma pour les examens et questions
- [x] Créer le schéma pour les inscriptions des participants
- [x] Créer le schéma pour les résultats d'examens
- [x] Créer le schéma pour les réponses des participants
- [x] Pousser les migrations vers la base de données

## Phase 3: Authentification et rôles
- [x] Configurer le système d'authentification Manus OAuth
- [x] Implémenter la gestion des rôles (admin/formateur/participant)
- [x] Créer les procédures tRPC pour l'authentification
- [x] Ajouter la vérification des permissions

## Phase 4: Interface utilisateur en arabe
- [x] Configurer le support RTL (right-to-left) pour l'arabe
- [x] Créer la page d'accueil avec liste des formations
- [x] Créer le design élégant avec Tailwind CSS
- [x] Ajouter les polices arabes via Google Fonts
- [x] Rendre l'interface responsive (web et mobile)
- [x] Traduire tous les textes en arabe

## Phase 5: Système d'examens
- [x] Créer l'interface pour ajouter/modifier des questions
- [x] Créer l'interface pour passer les examens
- [x] Implémenter le système de choix multiples
- [x] Créer les procédures tRPC pour gérer les examens
- [x] Implémenter l'évaluation automatique des examens
- [x] Calculer et enregistrer les notes

## Phase 6: Tableaux de bord
- [x] Créer le tableau de bord pour les formateurs
- [x] Créer le tableau de bord pour les superviseurs/admins
- [x] Implémenter la gestion des formations
- [x] Implémenter la gestion des participants
- [x] Implémenter la gestion des examens
- [x] Ajouter les fonctionnalités d'inscription des participants

## Phase 7: Rapports et statistiques
- [x] Créer les graphiques de performance des participants
- [x] Créer les statistiques par formation
- [x] Créer les rapports détaillés des résultats d'examens
- [ ] Implémenter l'export des rapports
- [x] Ajouter les visualisations avec recharts

## Phase 8: Tests et livraison
- [x] Tester toutes les fonctionnalités
- [x] Vérifier la responsivité sur mobile
- [x] Tester le système d'authentification
- [x] Tester les examens et l'évaluation
- [x] Créer le checkpoint final
- [x] Livrer la plateforme

## Nouvelle fonctionnalité: Système de certificats PDF
- [x] Créer le schéma de base de données pour les certificats
- [x] Créer les fonctions backend pour générer les certificats PDF
- [x] Ajouter les routes tRPC pour les certificats
- [x] Créer l'interface utilisateur pour télécharger les certificats
- [x] Ajouter le design professionnel en arabe pour les certificats
- [x] Tester la génération et le téléchargement des certificats
- [x] Créer le checkpoint final

## Nouvelle fonctionnalité: Système de vidéos et approbation des inscriptions
- [x] Créer le schéma de base de données pour les vidéos
- [x] Créer le schéma pour le suivi de visionnage des vidéos
- [x] Modifier le statut des inscriptions pour inclure l'approbation
- [x] Ajouter les routes tRPC pour gérer les vidéos
- [x] Créer l'interface pour les formateurs pour ajouter/gérer les vidéos
- [x] Créer le lecteur vidéo avec suivi de progression
- [x] Bloquer l'accès aux examens jusqu'à complétion des vidéos
- [x] Créer l'interface d'approbation des inscriptions pour les superviseurs
- [ ] Ajouter les notifications pour les demandes d'inscription
- [x] Tester toutes les fonctionnalités
- [x] Créer le checkpoint final

## Nouvelle fonctionnalité: Système de notifications
- [x] Créer le schéma de base de données pour les notifications
- [x] Ajouter les routes tRPC pour gérer les notifications
- [x] Envoyer notification au superviseur lors d'une nouvelle inscription
- [x] Envoyer notification au participant lors de l'approbation
- [x] Envoyer notification au participant lors du rejet
- [x] Créer l'interface utilisateur pour afficher les notifications
- [x] Ajouter un badge de compteur de notifications non lues
- [x] Tester le système de notifications
- [x] Créer le checkpoint final

## Correction: Problème d'affichage des vidéos
- [x] Diagnostiquer le problème de lecture vidéo
- [x] Corriger le problème d'affichage
- [x] Tester la lecture des vidéos
- [x] Créer le checkpoint final

## Nouvelle fonctionnalité: Designs personnalisés de certificats
- [x] Créer un design unique pour chaque dورة (7 designs)
- [x] Ajouter des couleurs et icônes spécifiques par formation
- [x] Créer des cadres décoratifs différents pour chaque certificat
- [x] Mettre à jour le module de génération de certificats
- [x] Tester la génération des certificats personnalisés
- [x] Créer le checkpoint final

## Mise à jour: Design professionnel des certificats
- [x] Télécharger et intégrer le logo Leader Academy
- [x] Ajouter le drapeau tunisien et les informations officielles
- [x] Créer un cadre décoratif traditionnel/islamique
- [x] Ajouter la section des axes de formation pour chaque cours
- [x] Ajouter les signatures du directeur et du coordinateur
- [x] Ajouter le numéro de promotion et les informations du programme
- [x] Tester la génération des nouveaux certificats
- [x] Créer le checkpoint final

## Correction: Erreur de chargement des images S3 dans les certificats
- [x] Télécharger les images S3 avant de les ajouter au PDF
- [x] Tester la génération de certificats
- [x] Créer le checkpoint final

## Nouvelle fonctionnalité: Page de vérification publique de certificats
- [x] Créer une route publique tRPC pour vérifier les certificats
- [x] Créer la page /verify pour la vérification
- [x] Ajouter un formulaire de recherche par numéro de certificat
- [x] Afficher les informations du certificat (nom, cours, date, score)
- [x] Ajouter un design professionnel pour les résultats
- [x] Gérer les cas d'erreur (certificat non trouvé)
- [x] Ajouter un lien vers la page de vérification dans le header
- [x] Tester la fonctionnalité de vérification
- [x] Créer le checkpoint final

## Correction: Erreur de génération de certificats PDF
- [x] Diagnostiquer l'erreur de téléchargement des images S3
- [x] Corriger la fonction de téléchargement des images
- [x] Tester la génération de certificats
- [x] Créer le checkpoint final

## Correction: Affichage du texte arabe dans les certificats PDF
- [x] Télécharger et intégrer une police arabe (Cairo, Amiri, ou similaire)
- [x] Configurer PDFKit pour utiliser la police arabe
- [x] Implémenter le support RTL pour le texte arabe
- [x] Tester l'affichage du texte arabe dans les certificats
- [x] Créer le checkpoint final

## Correction: Erreurs d'espacement et de formatage du texte arabe dans les certificats
- [x] Analyser les problèmes d'espacement et de taille de police
- [x] Ajuster les tailles de police pour éviter le chevauchement
- [x] Corriger l'espacement vertical entre les lignes
- [x] Améliorer le positionnement des éléments textuels
- [x] Tester la génération de certificats avec différents noms et titres
- [x] Implémenter arabic-reshaper + bidi-js pour traitement correct du texte arabe
- [x] Migrer de PDFKit vers pdf-lib pour meilleur support de l'arabe
- [x] Créer le checkpoint final

## Nouvelle fonctionnalité: Système de certificats personnalisés par formation
- [x] Créer un fichier de configuration avec le contenu personnalisé de chaque certificat
- [x] Mettre à jour le module de génération de certificats pour utiliser le contenu personnalisé
- [x] Ajouter le support de la langue française pour les certificats
- [x] Implémenter la logique du certificat cumulatif (délivré après complétion de toutes les formations)
- [x] Créer une route tRPC pour générer le certificat cumulatif
- [x] Modifier le schéma de la base de données pour supporter les certificats cumulatifs
- [x] Tester tous les types de certificats
- [x] Créer le checkpoint final

## Correction: Problème de correspondance des noms de cours
- [x] Vérifier les noms exacts des cours dans la base de données
- [x] Corriger la correspondance dans certificateContent.ts (normalization des diacritiques)
- [x] Corriger l'utilisation de bidi-js (getReorderedString au lieu de applyBidi)
- [x] Tester la génération de certificats pour toutes les formations
- [x] Créer le checkpoint final

## Modification du design des certificats
- [x] Supprimer la deuxième signature (أ. سامي الجازي)
- [x] Supprimer le drapeau tunisien
- [x] Supprimer la ligne horizontale dans la deuxième page
- [x] Ajouter le cachet et la signature du directeur
- [ ] Changer le nom du participant en arabe uniquement (ajouter champ arabicName)
- [ ] Repositionner le cachet au centre sous le nom du directeur
- [ ] Corriger le chevauchement entre le nom du directeur et le cachet
- [ ] Supprimer complètement la page 2 (ne pas créer de deuxième page)
- [ ] Augmenter la taille des textes arabes
- [ ] Tester les modifications
- [ ] Créer le checkpoint final

## Intégration du logo Leader Academy
- [x] Télécharger le logo sur S3
- [x] Intégrer le logo dans les certificats PDF
- [x] Tester la génération de certificats avec le nouveau logo
- [ ] Créer le checkpoint final

## Ajustement de la taille du logo Leader Academy
- [x] Augmenter la taille du logo dans le code
- [x] Tester la génération de certificats avec le logo agrandi
- [ ] Créer le checkpoint final

## Centrage horizontal du logo Leader Academy
- [x] Modifier le positionnement horizontal du logo pour le centrer
- [x] Tester la génération de certificats avec le logo centré
- [ ] Créer le checkpoint final

## Restauration de la position du logo à gauche
- [x] Remettre le logo à sa position originale (x: 50)
- [x] Tester la génération de certificats avec le logo repositionné
- [ ] Créer le checkpoint final

## Correction du chevauchement de texte (nom et "السيد(ة)")
- [x] Augmenter l'espacement vertical entre les lignes de texte
- [x] Tester la génération de certificats avec l'espacement corrigé
- [ ] Créer le checkpoint final

## Modification du texte "السيد(ة)" vers "السيد/ة"
- [x] Trouver et modifier le texte dans le contenu du certificat
- [x] Tester la génération de certificats avec le nouveau texte
- [ ] Créer le checkpoint final

## Ajout de la date de délivrance du certificat
- [x] Ajouter la date de délivrance dans le coin inférieur gauche au format arabe
- [x] Tester la génération de certificats avec la date
- [ ] Créer le checkpoint final

## Correction de l'affichage de la date
- [x] Utiliser les noms de mois tunisiens (فيفري au lieu de فبراير)
- [x] Corriger l'ordre de l'année (2026 au lieu de 6202)
- [x] Changer le format vers JJ/MM/AA avec chiffres arabes (٢١/٠٢/٢٦)
- [x] Tester la génération de certificats avec la date corrigée
- [ ] Créer le checkpoint final

## Modification des chiffres de la date vers chiffres occidentaux
- [x] Modifier le code pour utiliser des chiffres occidentaux (21/02/26) au lieu de chiffres arabes (٢١/٠٢/٢٦)
- [x] Tester la génération de certificats avec les chiffres occidentaux
- [ ] Créer le checkpoint final

## Correction: Erreur de génération de certificat français
- [x] Diagnostiquer l'erreur "No certificate content found for course"
- [x] Ajouter une version sans diacritiques du nom de cours français dans certificateContent.ts
- [x] Modifier drawFrenchCertificate pour accepter deux fonts (latin et arabe)
- [x] Utiliser le font arabe pour le nom du participant et le font latin pour le texte français
- [x] Ajouter la date de délivrance au certificat français (format DD/MM/YY)
- [x] Tester la génération de certificats français avec succès
- [ ] Créer le checkpoint final

## Personnalisation des couleurs de cadre par catégorie de cours
- [x] Définir une palette de couleurs unique pour chaque catégorie de cours
- [x] Modifier le code de génération de certificats pour utiliser les couleurs personnalisées
- [x] Appliquer les couleurs aux bordures extérieures et intérieures
- [x] Tester la génération de certificats pour toutes les catégories
- [ ] Créer le checkpoint final

## Système d'importation des examens depuis Google Forms
- [x] Analyser la structure du formulaire Google Forms fourni
- [x] Créer une interface d'importation dans le tableau de bord formateur
- [x] Implémenter l'extraction automatique des questions depuis Google Forms
- [x] Convertir les questions au format de la base de données
- [x] Ajouter la validation et la gestion des erreurs
- [x] Tester l'importation avec le parser (tests unitaires passés)
- [ ] Créer le checkpoint final

## Système d'importation des examens depuis Google Forms
- [x] Analyser la structure du formulaire Google Forms fourni
- [x] Créer une interface d'importation dans le tableau de bord formateur
- [x] Implémenter l'extraction automatique des questions depuis Google Forms
- [x] Convertir les questions au format de la base de données
- [x] Ajouter la validation et la gestion des erreurs
- [x] Tester l'importation avec le parser (tests unitaires passés)
- [ ] Créer le checkpoint final

## Bug: Erreur NaN lors de la création d'examen
- [x] Diagnostiquer pourquoi courseId devient NaN
- [x] Corriger la conversion de courseId en nombre dans ManageExams
- [x] Tester la création d'examen
- [ ] Créer le checkpoint

## Bug: Erreur "Dynamic require of 'pdf-lib' is not supported"
- [x] Diagnostiquer le problème d'importation de pdf-lib
- [x] Corriger l'importation pour utiliser ES modules au lieu de require
- [x] Tester la génération de certificat
- [ ] Créer le checkpoint

## Amélioration du parser CSV pour Google Forms
- [x] Analyser le format exact du fichier CSV fourni
- [x] Adapter le parser pour supporter les colonnes question,option_a,option_b,option_c,option_d,correct
- [x] Améliorer les messages d'erreur pour le débogage
- [x] Ajouter le support des délimiteurs multiples (virgule et point-virgule)
- [x] Tester le parser avec des fichiers de test
- [ ] Créer le checkpoint

## Support du format Google Forms natif
- [x] Créer un parser pour le format Question,Type,Options
- [x] Filtrer les questions de type "Multiple Choice" uniquement
- [x] Extraire les 4 premiers choix (réponse correcte par défaut: A)
- [x] Ajouter la détection automatique du format dans l'interface
- [x] Tester avec le fichier réel fourni (7 questions importées avec succès)
- [ ] Créer le checkpoint

## Bug: Erreur NaN dans courseId lors de l'importation
- [x] Vérifier pourquoi courseId devient NaN dans ImportExam (courseId vide car pas de sélection)
- [x] Corriger la logique de validation et conversion (ajout de validation robuste)
- [x] Améliorer les messages d'erreur pour guider l'utilisateur
- [ ] Créer le checkpoint

## Bug: createExam retourne NaN au lieu de l'ID
- [x] Vérifier la fonction createExam dans db.ts (result.insertId peut être undefined)
- [x] Corriger le retour de l'insertId (ajout de fallbacks multiples)
- [x] Améliorer la gestion d'erreur
- [ ] Créer le checkpoint

## Interface d'édition des questions après importation
- [x] Créer la page EditQuestions.tsx avec liste des questions
- [x] Ajouter l'édition inline pour chaque question
- [x] Implémenter la modification de la réponse correcte
- [x] Ajouter la suppression de questions
- [x] Implémenter le réordonnancement avec boutons haut/bas
- [x] Ajouter les procédures tRPC (getQuestions, updateQuestion, deleteQuestion, reorderQuestion)
- [x] Intégrer la navigation depuis ImportExam (bouton dans toast)
- [x] Corriger createQuestion pour retourner l'ID
- [x] Tester toutes les opérations (4 tests passés)
- [ ] Créer le checkpoint

## Bouton de prévisualisation du quiz
- [x] Ajouter un bouton "معاينة الاختبار" dans EditQuestions.tsx
- [x] Créer une page PreviewExam.tsx qui affiche le quiz en mode participant
- [x] Implémenter la logique pour ne pas enregistrer les résultats (mode local uniquement)
- [x] Ajouter une bannière bleue indiquant que c'est un mode prévisualisation
- [x] Ajouter un compteur de temps avec formatage MM:SS
- [x] Afficher les résultats avec code couleur (vert/rouge)
- [x] Ajouter un bouton "réessayer" pour réinitialiser la prévisualisation
- [x] Ajouter la route dans App.tsx
- [ ] Créer le checkpoint

## Support du format CSV avec Points
- [x] Améliorer le parser pour détecter le format Question,Option 1,Option 2,Option 3,Option 4,Points
- [x] Filtrer les lignes contenant "نص حر" (données personnelles)
- [x] Convertir le numéro dans Points (1,2,3,4) en lettre (A,B,C,D)
- [x] Tester avec le fichier google_form_questions_arabic.csv (18 questions importées)
- [ ] Créer le checkpoint

## Support des questions à 3 options
- [ ] Modifier parseCSVQuestions pour détecter les questions avec 3 options seulement
- [ ] Ajouter automatiquement une 4ème option "لا شيء مما سبق"
- [ ] Tester avec le fichier pre_school_education_test.csv (13 questions)
- [ ] Créer le checkpoint

## Support des questions à 3 options avec ajout automatique de la 4ème option
- [x] Modifier le parser CSV pour détecter les questions à 3 options
- [x] Ajouter automatiquement "لا شيء مما سبق" comme 4ème option
- [x] Tester avec le fichier pre_school_education_test.csv (13 questions importées)
- [ ] Créer le checkpoint final

## Support des questions à 2 options (vrai/faux) avec ajout automatique des options C et D
- [x] Modifier le parser CSV pour détecter les questions à 2 options
- [x] Ajouter automatiquement deux options supplémentaires pour les questions binaires
- [x] Créer des tests unitaires pour valider l'importation des questions vrai/faux
- [x] Tester avec un fichier CSV réel contenant des questions binaires
- [x] Tester avec un fichier CSV mixte (2, 3 et 4 options)
- [ ] Créer le checkpoint final

## Amélioration de l'expérience lors de l'échec à un examen
- [x] Analyser le comportement actuel lors de l'échec (affichage des réponses correctes)
- [x] Implémenter un bouton "إعادة المحاولة" (Réessayer) sans afficher les réponses
- [x] Masquer les réponses correctes en cas d'échec
- [x] Permettre plusieurs tentatives pour le même examen
- [x] Afficher les réponses uniquement en cas de réussite
- [x] Tester le nouveau comportement
- [ ] Créer le checkpoint final

## Page d'inscription complète avec tous les champs requis
- [x] Mettre à jour le schéma de base de données (user table) avec les nouveaux champs
- [x] Ajouter les champs: firstNameAr, lastNameAr, firstNameFr, lastNameFr, phone, idCardNumber, paymentReceiptUrl
- [x] Créer les procédures tRPC pour l'inscription et la mise à jour du profil
- [x] Créer la page d'inscription avec formulaire complet
- [x] Implémenter l'upload du fichier de paiement vers S3 via tRPC
- [x] Ajouter la validation des champs (format téléphone, carte d'identité, email, etc.)
- [x] Ajouter la route /complete-registration dans App.tsx
- [x] Validation de la taille et du type de fichier (max 5MB, images/PDF uniquement)
- [ ] Créer le checkpoint final

## Ajouter un bouton d'inscription sur la page d'accueil
- [x] Ajouter un bouton "إكمال التسجيل" visible sur la page d'accueil
- [x] Le bouton redirige vers /complete-registration
- [x] Afficher le bouton uniquement pour les utilisateurs connectés qui n'ont pas complété leur inscription
- [x] Style distinctif (orange) pour attirer l'attention
- [x] Icône UserPlus pour clarté visuelle
- [ ] Créer le checkpoint final

## Page de gestion des inscriptions pour les instructeurs
- [x] Ajouter un champ `registrationStatus` dans la table users (pending, approved, rejected)
- [x] Créer les procédures tRPC pour lister, approuver et rejeter les inscriptions
- [x] Créer la page `/dashboard/registrations` pour les instructeurs
- [x] Afficher un tableau avec toutes les données des utilisateurs
- [x] Permettre de visualiser les reçus de paiement (images et PDF)
- [x] Ajouter des boutons d'approbation/rejet avec confirmation
- [x] Ajouter des filtres par statut (tous, en attente, approuvés, rejetés)
- [x] Envoyer des notifications aux utilisateurs lors de l'approbation/rejet
- [x] Ajouter un lien vers la page dans le header du Dashboard
- [x] Dialog pour afficher les détails complets de chaque inscription
- [ ] Créer le checkpoint final

## Exportation Excel des inscriptions
- [x] Installer la bibliothèque ExcelJS pour générer des fichiers Excel
- [x] Créer une procédure tRPC pour exporter les inscriptions
- [x] Formater les données avec en-têtes en arabe et style professionnel
- [x] Ajouter un bouton "تصدير إلى Excel" dans la page de gestion des inscriptions
- [x] Gérer le téléchargement du fichier côté client (conversion base64 -> blob)
- [x] Respecter le filtre actif lors de l'exportation
- [x] Ajouter des bordures et alignement pour un rendu professionnel
- [x] Traduire les statuts en arabe dans le fichier Excel
- [x] Format de date tunisien (JJ/MM/AA)
- [ ] Créer le checkpoint final

## Système d'envoi d'é-mails automatiques pour validation d'inscription
- [x] Créer un service d'envoi d'é-mails (emailService.ts)
- [x] Installer Nodemailer pour l'envoi SMTP
- [x] Créer des templates HTML pour les é-mails (approbation et rejet)
- [x] Intégrer l'envoi d'é-mails dans la procédure approveRegistration
- [x] Intégrer l'envoi d'é-mails dans la procédure rejectRegistration
- [x] Personnaliser les é-mails avec le nom de l'utilisateur (AR/FR) et les détails
- [x] Ajouter un lien direct vers la plateforme dans l'é-mail d'approbation
- [x] Configurer les variables d'environnement SMTP
- [x] Corriger le schéma pour rendre email obligatoire (notNull)
- [x] Mettre à jour toutes les fonctions upsertUser pour fournir email
- [ ] Créer le checkpoint final

## Système de génération et envoi automatique de certificats PDF
- [x] Analyser le système de certificats existant (certificates.ts)
- [x] Le design du certificat PDF est déjà professionnel avec style arabe
- [x] Génération automatique déjà implémentée lors de la réussite à un examen
- [x] Créer un template d'é-mail HTML pour l'envoi du certificat
- [x] Intégrer l'envoi automatique du certificat par é-mail (certificat individuel)
- [x] Intégrer l'envoi automatique du certificat par é-mail (certificat cumulatif)
- [x] Page MyCertificates.tsx existe déjà pour consulter tous les certificats
- [x] Bouton de téléchargement déjà présent dans la page
- [x] Certificats PDF déjà stockés dans S3 pour accès permanent
- [x] Gestion des erreurs d'envoi d'é-mail sans bloquer la génération
- [ ] Créer le checkpoint final

## Amélioration des certificats (ID, date, nom arabe)
- [x] Ajouter le champ idCardNumber dans l'interface CertificateData
- [x] Mettre à jour le générateur de certificats pour afficher le numéro de carte d'identité
- [x] Afficher "صاحب(ة) بطاقة تعريف وطنية رقم X" sous le nom du participant
- [x] Corriger le format de date pour utiliser completionDate au lieu de new Date()
- [x] Format de date déjà correct (JJ/MM/AA) - pas de changement nécessaire
- [x] Utiliser firstNameAr + lastNameAr du formulaire d'inscription au lieu de arabicName
- [x] Mettre à jour les appels dans routers.ts pour passer idCardNumber (certificat individuel)
- [x] Mettre à jour les appels dans routers.ts pour passer idCardNumber (certificat cumulatif)
- [ ] Créer le checkpoint final

## Correction de l'affichage inversé du numéro de carte d'identité
- [x] Ajouter Unicode LRM (Left-to-Right Mark) pour forcer l'affichage correct des chiffres
- [x] Utiliser \u200E avant et après le numéro pour maintenir l'ordre LTR
- [ ] Créer le checkpoint final

## Correction des parenthèses inversées dans le texte arabe
- [x] Remplacer "صاحب(ة)" par "صاحب/ة" dans le certificat
- [ ] Créer le checkpoint final

## Correction du chevauchement entre les lignes dans le certificat
- [x] Ajuster les positions Y pour augmenter l'espacement entre le numéro de carte d'identité et la ligne suivante
- [x] Ajuster aussi les positions des axes et de leur header
- [x] Utiliser un espacement conditionnel basé sur la présence du numéro de carte d'identité
- [ ] Créer le checkpoint final

## Modification du format de date dans les certificats
- [x] Créer une fonction pour formater la date avec les mois en arabe (formatDateArabic)
- [x] Créer une fonction pour formater la date avec les mois en français (formatDateFrench)
- [x] Remplacer le format JJ/MM/AA par "JJ mois AAAA" (ex: 24 فيفري 2026)
- [x] Mettre à jour les certificats arabes (صدرت بتاريخ: 24 فيفري 2026)
- [x] Mettre à jour les certificats français (Délivré le: 24 février 2026)
- [ ] Créer le checkpoint final

## Correction de l'affichage inversé des chiffres dans les dates
- [x] Ajouter Unicode LRM markers dans formatDateArabic() pour corriger l'ordre des chiffres
- [x] Ajouter Unicode LRM markers dans formatDateFrench() pour cohérence
- [x] Utiliser \u200E avant et après chaque nombre (jour et année)
- [ ] Créer le checkpoint final

## Ajout de la fonctionnalité de suppression d'examen
- [x] Créer la procédure backend deleteExam dans db.ts
- [x] Ajouter la route tRPC exams.delete
- [x] Ajouter le bouton "حذف" (Supprimer) dans ManageExams.tsx
- [x] Ajouter une boîte de dialogue de confirmation avant suppression
- [x] Supprimer en cascade toutes les questions associées à l'examen
- [x] Tester la suppression d'un examen
- [x] Créer le checkpoint final

## Réorganisation de l'ordre des informations dans le certificat
- [ ] Modifier l'ordre pour commencer par "صدرت بتاريخ" suivi de la date
- [ ] Déplacer le numéro de carte d'identité à la fin de la phrase
- [ ] Tester la génération du certificat avec le nouvel ordre
- [ ] Créer le checkpoint final

## Correction de l'ordre RTL du numéro de carte d'identité
- [x] Inverser l'ordre de dessin: dessiner le numéro AVANT le texte arabe pour qu'il apparaisse APRÈS en RTL
- [x] Recalculer les positions X en conséquence
- [x] Tester avec un nouveau certificat
- [x] Créer le checkpoint final

## Correction de l'ordre RTL de la date
- [x] Corriger l'ordre de dessin de la date pour afficher: "صدرت بتاريخ 24 فيفري 2026"
- [x] Inverser l'ordre: dessiner année, mois, jour, puis le préfixe en dernier
- [x] Tester avec un nouveau certificat
- [x] Créer le checkpoint final

## Suppression du préfixe "صدرت بتاريخ" dans la date
- [x] Supprimer le préfixe "صدرت بتاريخ" et afficher uniquement "24 فيفري 2026"
- [x] Ajuster le positionnement RTL pour la date seule
- [x] Tester et créer le checkpoint final

## Correction de l'ordre visuel de la date (RTL)
- [x] Inverser l'ordre de dessin: dessiner JOUR en premier (droite), puis MOIS, puis ANNÉE (gauche)
- [x] La date doit s'afficher visuellement: "23 فيفري 2026" (de droite à gauche)
- [x] Tester et créer le checkpoint final

## Ajout d'un outil d'assistance pédagogique pour les enseignants tunisiens

### Phase 1: Structure de la base de données
- [ ] Créer table `pedagogical_resources` (ressources pédagogiques)
- [ ] Créer table `lesson_plans` (plans de cours)
- [ ] Créer table `pedagogical_sheets` (fiches pédagogiques/مذكرات)
- [ ] Créer table `reference_documents` (documents de référence officiels)
- [ ] Ajouter champs: niveau (ابتدائي/إعدادي/ثانوي), matière, année scolaire

### Phase 2: Procédures backend
- [ ] Créer procédures CRUD pour les fiches pédagogiques
- [ ] Créer procédures pour la planification des cours
- [ ] Créer procédures pour la génération d'examens
- [ ] Ajouter validation: année scolaire obligatoire
- [ ] Ajouter validation: cohérence niveau/référence

### Phase 3: Interface utilisateur
- [ ] Créer page "أدوات المدرس" (Outils de l'enseignant)
- [ ] Interface de création de مذكرات بيداغوجية
- [ ] Interface de تخطيط الدروس
- [ ] Interface de إنشاء اختبارات وتقييمات
- [ ] Formulaires avec sélection: niveau, matière, année scolaire

### Phase 4: Génération de documents
- [ ] Intégrer génération Word pour les fiches pédagogiques
- [ ] Intégrer génération PDF pour les plans de cours
- [ ] Template Word pour المذكرات البيداغوجية
- [ ] Template PDF pour الاختبارات

### Phase 5: Tests et livraison
- [ ] Tester la création de fiches pédagogiques
- [ ] Tester la génération de documents
- [ ] Tester la validation des références
- [ ] Créer le checkpoint final


## Intégration de l'outil pédagogique pour les enseignants tunisiens
- [x] Créer la structure de base de données (4 tables: pedagogicalSheets, lessonPlans, teacherExams, referenceDocuments)
- [x] Créer les fonctions CRUD dans db.ts
- [x] Créer les routers tRPC (pedagogicalSheets, lessonPlans, teacherExams, referenceDocuments)
- [x] Créer la page principale TeacherTools.tsx
- [x] Créer le formulaire PedagogicalSheetForm
- [ ] Uploader les références officielles (7 PDFs du degré 1) vers S3 et base de données
- [ ] Créer LessonPlanForm component
- [ ] Créer TeacherExamForm component
- [ ] Créer ReferenceDocumentsManager component
- [ ] Créer use-toast hook manquant
- [ ] Intégrer la génération Word/PDF pour les fiches pédagogiques
- [ ] Ajouter la route /teacher-tools dans App.tsx
- [ ] Tester l'outil complet
- [ ] Créer le checkpoint final


## Intégration de l'outil pédagogique pour les enseignants
- [x] Créer la structure de base de données (4 tables)
- [x] Créer les fonctions CRUD dans db.ts
- [x] Créer les routers tRPC
- [x] Créer la page principale TeacherTools.tsx
- [x] Créer le formulaire PedagogicalSheetForm
- [x] Uploader les références officielles (27 PDFs pour les 3 degrés)
- [x] Créer LessonPlanForm component
- [x] Créer TeacherExamForm component
- [x] Créer ReferenceDocumentsManager component
- [ ] Intégrer la génération Word/PDF (Phase 2)
- [x] Ajouter la route dans App.tsx
- [ ] Tester l'outil complet
- [ ] Créer le checkpoint final


## Phase 2: Amélioration des outils pédagogiques avec IA et export

### Notes Pédagogiques
- [x] Activer le bouton "إنشاء مذكرة جديدة"
- [x] Créer formulaire complet avec validation (matière, niveau, sujet, objectifs, compétences)
- [x] Intégrer assistant IA pour suggérer contenu basé sur références officielles
- [x] Afficher la liste des notes créées avec filtres
- [x] Ajouter fonctionnalité d'édition des notes
- [x] Ajouter fonctionnalité de suppression des notes
- [x] Ajouter export PDF des notes pédagogiques

### Plans de Leçons
- [x] Créer formulaire de création de plans (hebdomadaire/mensuel)
- [ ] Ajouter système de liaison avec notes pédagogiques existantes
- [x] Afficher la liste des plans créés avec filtres
- [x] Ajouter fonctionnalité d'édition des plans
- [x] Ajouter fonctionnalité de suppression des plans
- [x] Ajouter export PDF des plans de leçons

### Examens (Teacher Exams)
- [x] Créer formulaire de création d'examens (niveau, matière, durée, consignes)
- [x] Créer banque de questions par niveau et matière
- [x] Ajouter système d'ajout de questions à l'examen (sélection multiple)
- [x] Afficher la liste des examens créés avec filtres
- [x] Ajouter fonctionnalité d'édition des examens
- [x] Ajouter fonctionnalité de suppression des examens
- [x] Ajouter export PDF pour impression (format examen + corrigé séparé)


## Phase 3: Amélioration du système d'export (Word + Templates professionnels)

### Export Word
- [x] Installer la bibliothèque docx (officegen ou docx)
- [x] Créer le module wordGenerator.ts
- [x] Implémenter generatePedagogicalSheetWord
- [x] Implémenter generateLessonPlanWord
- [x] Implémenter generateTeacherExamWord
- [x] Ajouter les procedures tRPC exportToWord
- [ ] Tester l'export Word pour les 3 types de documents (en cours)

### Templates PDF professionnels
- [x] Créer 3 templates de design pour les مذكرات (classique, moderne, coloré)
- [ ] Créer 3 templates de design pour les خطط (simple, détaillé, visuel)
- [ ] Créer 3 templates de design pour les اختبارات (standard, avec logo, avec en-tête)
- [ ] Améliorer le design PDF avec couleurs, bordures, et mise en page
- [ ] Ajouter support des polices arabes dans les PDFs

### Interface utilisateur
- [x] Ajouter menu déroulant pour choisir le format (PDF/Word)
- [x] Ajouter sélecteur de template de design
- [ ] Ajouter prévisualisation du template sélectionné
- [x] Améliorer les boutons d'export dans les cartes
- [ ] Tester l'interface complète

### Tests et livraison
- [ ] Tester l'export PDF avec différents templates
- [ ] Tester l'export Word avec différents contenus
- [ ] Vérifier l'affichage correct de l'arabe dans Word
- [ ] Créer le checkpoint final


## Phase 4: Amélioration de la navigation

### Navigation principale
- [x] Ajouter le lien vers la page "أدوات المدرس" dans la navigation principale (App.tsx ou Header)
- [x] S'assurer que le lien est visible pour tous les utilisateurs connectés
- [x] Tester l'accès à la page depuis la navigation


## Phase 5: Amélioration du bouton d'assistance IA

### Design et UX
- [x] Remplacer l'icône du bouton IA par l'icône Sparkles (✨)
- [x] Améliorer le style du bouton pour le rendre plus attractif
- [x] Ajouter une animation ou effet visuel au bouton
- [ ] Tester l'interface améliorée


## Phase 6: Amélioration avancée de l'assistance IA

### Fenêtre d'aide Prompt Engineering
- [x] Créer un composant Dialog pour expliquer le Prompt Engineering
- [x] Ajouter des exemples pratiques de prompts efficaces
- [x] Ajouter des conseils pour formuler des objectifs pédagogiques clairs
- [x] Ajouter une icône Info à côté du bouton IA

### Bibliothèque de Prompts Favoris
- [x] Créer une table `savedPrompts` dans le schéma de base de données
- [x] Ajouter un bouton "حفظ في المفضلة" après génération réussie
- [x] Créer une interface pour afficher les prompts sauvegardés
- [x] Permettre la réutilisation des prompts favoris
- [x] Ajouter la suppression de prompts de la bibliothèque

### Amélioration avec Références Officielles
- [x] Modifier la procedure generateAiSuggestion pour récupérer les références pertinentes
- [x] Intégrer le contenu des références dans le contexte du prompt
- [x] Afficher les références utilisées dans la suggestion
- [x] Améliorer la qualité des suggestions générées


## Phase 7: Bibliothèque Partagée de Notes Pédagogiques

### Schéma de Base de Données
- [x] Créer une table `sharedPedagogicalSheets` pour les notes publiées
- [x] Créer une table `sheetRatings` pour les évaluations
- [x] Créer une table `sheetComments` pour les commentaires
- [ ] Ajouter un champ `isPublic` dans la table `pedagogicalSheets`
- [x] Pousser les migrations vers la base de données

### Procedures tRPC
- [x] Créer `publishSheet` pour publier une note dans la bibliothèque
- [x] Créer `listSharedSheets` avec filtres (matière, niveau, note)
- [x] Créer `getSharedSheetById` pour afficher les détails
- [x] Créer `cloneSheet` pour copier une note partagée
- [ ] Créer `rateSheet` pour évaluer une note
- [ ] Créer `addComment` pour ajouter un commentaire
- [ ] Créer `listComments` pour afficher les commentaires

### Interface Utilisateur
- [x] Créer la page "المكتبة المشتركة" avec grille de cartes
- [x] Ajouter des filtres (matière, niveau, évaluation)
- [ ] Créer la page de détails d'une note partagée
- [x] Ajouter le bouton "نشر في المكتبة" dans les notes personnelles
- [ ] Créer le système d'évaluation par étoiles
- [ ] Créer la section des commentaires avec formulaire

### Fonctionnalités Avancées
- [ ] Ajouter un compteur de vues pour chaque note
- [ ] Ajouter un compteur de clonages
- [ ] Permettre la recherche par mots-clés
- [ ] Ajouter un badge "أكثر المذكرات شعبية"


## Phase 8: Amélioration de la Navigation

- [x] Ajouter un bouton "العودة إلى الرئيسية" en haut de la page أدوات المدرس
- [x] Ajouter le même bouton dans la page المكتبة المشتركة


## Phase 9: Ajout du Logo Leader Academy

- [x] Télécharger le logo sur S3
- [x] Ajouter le logo dans l'en-tête de la page d'accueil
- [ ] Ajouter le logo dans les autres pages principales


## Phase 10: Génération d'Infographies et Cartes Mentales

### Schéma de Base de Données
- [x] Créer une table `infographics` pour stocker les infographies générées
- [x] Créer une table `mindMaps` pour stocker les cartes mentales
- [x] Pousser les migrations vers la base de données

### Génération d'Infographies avec IA
- [ ] Créer un formulaire de génération d'infographies (sujet, style, couleurs)
- [ ] Intégrer l'API de génération d'images IA
- [ ] Ajouter des templates prédéfinis (éducatif, scientifique, statistique)
- [ ] Afficher l'aperçu de l'infographie générée

### Génération de Cartes Mentales
- [ ] Créer un formulaire de génération de cartes mentales (sujet central, branches)
- [ ] Utiliser une bibliothèque de visualisation (D3.js ou Mermaid)
- [ ] Générer la structure avec IA basée sur le sujet
- [ ] Permettre l'édition interactive des nœuds

### Export et Impression
- [ ] Ajouter export PNG pour infographies et cartes mentales
- [ ] Ajouter export PDF optimisé pour l'impression
- [ ] Ajouter export SVG pour édition ultérieure
- [ ] Créer une vue de prévisualisation avant impression
- [ ] Ajouter des options de mise en page (A4, A3, paysage/portrait)

### Interface Utilisateur
- [ ] Créer la page "مولد الإنفوجرافيك والخرائط الذهنية"
- [ ] Ajouter le lien dans la navigation
- [ ] Créer une galerie des créations sauvegardées
- [ ] Ajouter des filtres par type et date


## Phase 11: Correction du Bouton "إنشاء مذكرة جديدة"

- [x] Vérifier pourquoi le bouton "إنشاء مذكرة جديدة" ne fonctionne pas
- [x] Corriger le gestionnaire d'événements du bouton
- [x] S'assurer que le formulaire s'ouvre correctement
- [x] Tester le flux complet de création de notes

## Phase 12: Correction du Bouton "اقتراح محتوى بالذكاء الاصطناعي"

- [x] Vérifier les logs de la console pour voir les erreurs
- [x] Vérifier la fonction handleAiSuggestion dans PedagogicalSheetFormEnhanced
- [x] Vérifier la procédure tRPC generateAiSuggestion
- [x] Corriger les erreurs trouvées (déplacé le champ lessonTitle avant les boutons)
- [x] Tester le bouton IA

## Export Word des suggestions IA
- [x] Créer la procédure tRPC pour générer le document Word avec tableau
- [x] Ajouter le bouton d'export dans l'interface utilisateur
- [x] Tester l'export Word
- [x] Créer le checkpoint final

## Amélioration du système de suggestions IA
- [x] Créer le schéma de base de données pour archiver les suggestions IA
- [x] Implémenter l'export PDF avec support arabe professionnel et format tableau
- [x] Créer les procédures tRPC pour sauvegarder et récupérer les suggestions
- [x] Implémenter la fenêtre de prévisualisation interactive avec édition
- [x] Ajouter les boutons PDF et Prévisualisation dans l'interface
- [x] Tester toutes les fonctionnalités
- [x] Créer le checkpoint final

## Support multilingue pour les suggestions IA
- [x] Modifier le prompt système pour détecter la matière et générer en français si c'est "اللغة الفرنسية"
- [x] Mettre à jour les générateurs Word et PDF pour supporter le contenu français
- [x] Tester avec des exemples en français
- [x] Créer le checkpoint final

## Support multilingue complet (Arabe, Français, Anglais)
- [x] Ajouter le champ langue dans le schéma de la table referenceDocuments
- [x] Ajouter le support de l'anglais dans les générateurs Word et PDF
- [x] Ajouter le support de l'anglais dans les prompts IA
- [x] Ajouter un sélecteur de langue dans l'interface (قائمة منسدلة)
- [x] Modifier la logique de détection pour inclure l'anglais
- [x] Implémenter le filtrage des références par langue
- [x] Tester avec des exemples en anglais
- [x] Créer le checkpoint final

## Correction: Erreur Select.Item avec valeur vide
- [x] Corriger le sélecteur de langue pour utiliser "auto" au lieu de "" comme valeur par défaut
- [x] Mettre à jour la logique backend pour gérer "auto" comme détection automatique
- [x] Tester le sélecteur de langue
- [x] Créer le checkpoint final

## Correction: Erreur ENOENT pour Amiri-Regular.ttf
- [x] Vérifier si le fichier de police existe
- [x] Télécharger la police Amiri si nécessaire
- [x] Corriger le chemin dans pdfGenerator.ts (utilisation de path.join avec __dirname)
- [x] Tester la génération PDF
- [x] Créer le checkpoint final

## Intégration des références officielles - 6ème année primaire
- [x] Télécharger les 4 fichiers PDF sur S3
- [x] Insérer les références dans la base de données avec les métadonnées appropriées
- [x] Vérifier que les références sont filtrées correctement lors de la génération
- [x] Tester la génération d'une mذكرة pour la 6ème année primaire en français
- [x] Créer le checkpoint final

## Intégration des références officielles - 5ème année primaire
- [x] Télécharger les 4 fichiers PDF sur S3
- [x] Insérer les références dans la base de données
- [x] Créer le checkpoint final

## Intégration des références officielles - 4ème année primaire
- [x] Télécharger les 3 fichiers PDF sur S3
- [x] Insérer les références dans la base de données
- [x] Créer le checkpoint final

## Intégration des références officielles - Collège (7ème, 8ème, 9ème année)
- [x] Télécharger les 3 fichiers PDF sur S3
- [x] Insérer les références dans la base de données
- [x] Créer le checkpoint final

## Intégration des références officielles - Secondaire (1ère-4ème année)
- [x] Télécharger les 6 fichiers PDF sur S3
- [x] Insérer les références dans la base de données
- [x] Créer le checkpoint final

## Bibliothèque de références et amélioration de la qualité
- [x] Ajouter le champ extractedContent à la table referenceDocuments
- [x] Ajouter la table suggestionRatings pour les évaluations
- [x] Créer la page bibliothèque de références avec filtres
- [x] Implémenter la prévisualisation PDF dans une fenêtre modale
- [x] Créer le service d'extraction PDF automatique
- [x] Ajouter le système d'évaluation par étoiles aux suggestions
- [x] Tester toutes les fonctionnalités
- [x] Créer le checkpoint final

## Intégration de l'assistant IA EduGPT
- [x] Créer le composant ChatAssistant.tsx avec interface de chat moderne
- [x] Implémenter l'intégration OpenAI API avec les instructions EduGPT
- [x] Ajouter la gestion de l'historique des conversations
- [x] Créer les procédures tRPC pour communiquer avec OpenAI
- [x] Ajouter un bouton flottant pour ouvrir le chat
- [x] Tester toutes les fonctionnalités
- [x] Créer le checkpoint final

## Ajouter bouton EduGPT dans le menu principal
- [ ] Modifier ChatAssistant pour supporter l'ouverture via prop externe
- [ ] Ajouter le bouton dans le menu de navigation principal
- [ ] Tester l'ouverture depuis le menu
- [ ] Créer le checkpoint final

## Nouvelle fonctionnalité: Bibliothèque de modèles de notes pédagogiques
- [x] Créer le schéma de base de données pour les modèles (templates)
- [x] Créer les procédures tRPC pour gérer les modèles
- [x] Créer des modèles prédéfinis pour différents niveaux et matières
- [x] Créer la page de bibliothèque de modèles avec filtres
- [x] Ajouter la fonctionnalité de prévisualisation des modèles
- [x] Intégrer les modèles dans le formulaire de création de notes
- [x] Ajouter un bouton "Utiliser ce modèle" qui remplit automatiquement le formulaire
- [x] Tester toutes les fonctionnalités
- [ ] Créer le checkpoint final

## Nouvelle fonctionnalité: Intégration du manuel de lecture 6ème année
- [x] Télécharger le manuel PDF vers S3
- [x] Ajouter le manuel à la table referenceDocuments
- [x] Extraire le contenu pédagogique (8 modules, thèmes, objectifs)
- [x] Créer une structure de données pour les unités et leçons
- [x] Créer des modèles spécialisés pour la lecture (6ème année)
- [x] Créer des modèles pour l'expression écrite
- [x] Créer des modèles pour la grammaire
- [x] Créer des modèles pour l'orthographe
- [x] Tester l'utilisation des nouveaux modèles
- [x] Vérifier que EduGPT utilise le manuel comme référence
- [ ] Créer le checkpoint final

## Amélioration UX: Agrandir la fenêtre du chatbot EduGPT
- [x] Modifier le composant AIChatBox pour augmenter la taille de la fenêtre
- [x] Ajouter un bouton pour basculer en mode plein écran
- [x] Tester l'affichage sur différentes tailles d'écran
- [ ] Créer le checkpoint final

## Bug Fix: Problème de défilement dans EduGPT
- [x] Corriger le ScrollArea pour permettre le défilement vertical
- [x] Tester le défilement avec des messages longs
- [ ] Créer le checkpoint final

## Nouvelle fonctionnalité: Page complète EduGPT avec pièces jointes
- [x] Créer une nouvelle page dédiée à EduGPT (route /assistant)
- [x] Concevoir une interface professionnelle pleine page
- [x] Ajouter un bouton pour joindre des fichiers (PDF, images, documents)
- [x] Implémenter le téléchargement de fichiers vers S3
- [x] Intégrer les fichiers dans le contexte de la conversation
- [x] Ajouter un aperçu des fichiers joints dans l'interface
- [x] Permettre la suppression des fichiers avant l'envoi
- [x] Mettre à jour le menu pour pointer vers la nouvelle page
- [x] Tester avec différents types de fichiers
- [ ] Créer le checkpoint final

## Fonctionnalités avancées EduGPT: Analyse de fichiers, Historique et Export
- [x] Créer le schéma de base de données pour l'historique des conversations
- [x] Implémenter l'extraction de texte depuis PDF (pdf-parse)
- [x] Implémenter OCR pour les images (Tesseract.js ou API)
- [x] Intégrer l'analyse de fichiers dans le contexte LLM
- [x] Créer les procédures tRPC pour sauvegarder/charger les conversations
- [x] Ajouter un sidebar avec liste des conversations passées
- [x] Implémenter la recherche dans l'historique des conversations
- [x] Ajouter la fonctionnalité de suppression de conversations
- [x] Créer une fonction d'export en PDF avec formatage
- [x] Créer une fonction d'export en Word (DOCX)
- [x] Ajouter un bouton d'export dans l'interface
- [x] Tester toutes les fonctionnalités
- [ ] Créer le checkpoint final

## Nouvelle fonctionnalité: OAuth externe (Google & Facebook)
- [ ] Mettre à jour le schéma user pour supporter plusieurs providers OAuth
- [ ] Créer une table pour stocker les connexions OAuth externes
- [ ] Implémenter les routes OAuth pour Google
- [ ] Implémenter les routes OAuth pour Facebook
- [ ] Créer une page de connexion avec boutons Google et Facebook
- [ ] Gérer la fusion des comptes (même email, différents providers)
- [ ] Configurer les secrets (Google Client ID/Secret, Facebook App ID/Secret)
- [ ] Tester le flux complet de connexion avec Google
- [ ] Tester le flux complet de connexion avec Facebook
- [ ] Créer le checkpoint final

## Personnalisation EduGPT: Expert pédagogique tunisien
- [x] Intégrer les instructions pédagogiques tunisiennes dans le system prompt
- [x] Ajouter le protocole de questionnement (degré, module, matière)
- [x] Mettre à jour les suggestions rapides pour refléter le contexte tunisien
- [x] Ajouter un formulaire de pré-qualification avant la conversation
- [x] Tester avec des cas d'usage réels (préparation de fiches)
- [ ] Créer le checkpoint final

## Intégration du guide officiel des programmes de l'enseignement primaire
- [x] Télécharger le guide PDF vers S3
- [x] Ajouter le guide à la table referenceDocuments
- [ ] Créer le checkpoint final

## Bug Fix / Amélioration: Bouton de suppression dans la gestion des inscriptions
- [x] Localiser la page de gestion des inscriptions
- [x] Ajouter une procédure tRPC deleteRegistration
- [x] Ajouter le bouton Supprimer avec dialog de confirmation
- [x] Tester la suppression
- [ ] Créer le checkpoint final

## تغيير اسم المنصة إلى "ليدر أكاديمي"
- [x] تغيير VITE_APP_TITLE إلى "ليدر أكاديمي" (تم تغييره في index.html)
- [x] تغيير الاسم في Home.tsx
- [x] تغيير الاسم في emailService.ts
- [x] تغيير الاسم في db.ts
- [x] حفظ نقطة تفتيش

## تحديث الهوية البصرية لليدر أكاديمي
- [x] تغيير الشعار التعريفي إلى "نحو تعليم رقمي متميز"
- [x] تغيير عنوان الصفحة الرئيسية الكبير
- [x] إنشاء favicon من شعار ليدر أكاديمي
- [x] إضافة favicon إلى index.html
- [x] حفظ نقطة تفتيش

## إضافة زر العودة في المساعد البيداغوجي
- [x] إضافة زر "العودة إلى الرئيسية" في شريط العنوان العلوي لصفحة المساعد
- [x] حفظ نقطة تفتيش

## تحسين المساعد البيداغوجي: طلب المادة والمستوى
- [x] إضافة واجهة اختيار المادة والمستوى الدراسي في الصفحة الترحيبية
- [x] تحديث الباكند لتضمين المادة والمستوى في system prompt
- [x] إضافة إمكانية تغيير المادة/المستوى في أي وقت
- [x] حفظ نقطة تفتيش

## إضافة المراجع البيداغوجية للمساعد
- [x] استخراج محتوى الملفات الخمسة المرجعية
- [x] إضافة المحتوى كقاعدة معرفة في system prompt
- [x] حفظ نقطة تفتيش

## إضافة شبكة التقييم الرسمية للمساعد
- [x] بحث عن شبكة التقييم الرسمية التونسية للمذكرات البيداغوجية
- [x] إضافة شبكة التقييم كمرجع سادس في system prompt
- [x] تحديث تعليمات التقييم في system prompt
- [x] حفظ نقطة تفتيش

## Évaluation instantanée de fiche pédagogique
- [x] Backend: procédure tRPC `evaluateFiche` acceptant texte extrait + matière + niveau
- [x] Backend: extraction texte côté serveur (pdf-parse, mammoth pour docx)
- [x] Frontend: page EvaluateFiche.tsx avec zone upload, sélecteur matière/niveau, résultat structuré
- [x] Frontend: affichage note sur 20 avec jauge visuelle et détail par critère
- [x] Frontend: bouton "تقييم الفيشة" dans la nav de Home.tsx
- [x] Enregistrer checkpoint

## Export PDF du rapport d'évaluation
- [x] Backend: procédure tRPC `exportEvaluationPDF` générant un PDF structuré avec logo, scores, critères et recommandations
- [x] Frontend: bouton "تحميل التقرير PDF" dans la page EvaluateFiche après affichage du résultat
- [x] Enregistrer checkpoint

## Partage du rapport d'évaluation
- [x] Schema DB: table `shared_evaluations` (id, token, userId, evaluationData JSON, pdfUrl, createdAt, expiresAt)
- [x] Backend: procédure `shareEvaluation` → sauvegarde en DB + retourne URL publique unique
- [x] Backend: procédure publique `getSharedEvaluation` → récupère par token sans auth
- [x] Backend: procédure `sendEvaluationByEmail` → envoie e-mail avec lien + résumé HTML
- [x] Frontend: bouton "مشاركة التقرير" + dialogue avec copie du lien et champ e-mail
- [x] Frontend: page publique `/shared-evaluation/:token` affichant le rapport
- [x] Enregistrer checkpoint

## تصحيح المصطلح: مفتش → متفقد
- [x] استبدال "مفتش" بـ"متفقد" في جميع ملفات المشروع (EvaluateFiche.tsx، SharedEvaluationView.tsx، exportEvaluation.ts، routers.ts)
- [x] حفظ نقطة تفتيش

## دعم تعدد اللغات في المساعد البيداغوجي
- [x] إضافة اختيار لغة التدريس (عربية/فرنسية/إنجليزية) في نافذة اختيار المادة والمستوى
- [x] تحديث شارة الهيدر لعرض لغة التدريس
- [x] تحديث system prompt لتكييف لغة الرد حسب لغة التدريس المختارة
- [x] تخصيص الاقتراحات السريعة حسب لغة التدريس
- [x] تحديث الباكند لإرسال لغة التدريس مع كل رسالة
- [ ] حفظ نقطة تفتيش

## Bouton de sélection de langue dans la navigation
- [x] Créer un contexte global de langue (LanguageContext) avec localStorage
- [x] Ajouter le bouton sélecteur de langue dans la barre de navigation (Home.tsx)
- [x] Appliquer la langue sélectionnée dans l'assistant pédagogique automatiquement
- [x] Sauvegarder checkpoint

## Sélecteur de langue dans l'assistant pédagogique
- [x] Ajouter le bouton sélecteur de langue (🌐) dans la barre du header de l'assistant
- [x] Synchroniser le changement de langue avec le contexte global et l'état teachingLanguage
- [x] Sauvegarder checkpoint

## Traduction complète de l'interface de l'assistant
- [x] Créer le dictionnaire de traductions (ar/fr/en) pour tous les textes de l'assistant
- [x] Traduire le header (titre, sous-titre, badges, boutons)
- [x] Traduire les suggestions rapides selon la langue
- [x] Traduire la modale de sélection de contexte (matière/niveau/langue)
- [x] Traduire le placeholder de saisie et les messages d'état
- [x] Sauvegarder checkpoint

## Traduction de la navigation principale
- [x] Lire Home.tsx et identifier tous les textes de navigation
- [x] Ajouter dictionnaire de traductions pour la nav (ar/fr/en)
- [x] Appliquer les traductions via useLanguage()
- [x] Sauvegarder checkpoint

## Traduction des pages internes (ar/fr/en)
- [x] Traduire la page "Mes cours" (MyCourses.tsx)
- [x] Traduire le tableau de bord (Dashboard.tsx)
- [x] Sauvegarder checkpoint

## Bug: Erreur export PDF conversation assistant
- [ ] Diagnostiquer l'erreur "خطأ في تصدير المحادثة" dans l'assistant
- [ ] Corriger le bug d'export PDF
- [ ] Sauvegarder checkpoint

## إضافة كتب اللغة الإنجليزية كمراجع بيداغوجية
- [x] رفع 13 كتاباً رسمياً للغة الإنجليزية إلى S3 (من السنة السادسة ابتدائي إلى السنة الرابعة ثانوي)
- [x] تسجيل الكتب في قاعدة البيانات كمراجع بيداغوجية
- [x] تحديث prompt المساعد البيداغوجي ليتضمن مراجع الإنجليزية
- [x] إضافة هيكل مذكرة الدرس للغة الإنجليزية (Fiche de préparation)
- [x] إضافة معايير التقييم للغة الإنجليزية

## تحسينات اللغة الإنجليزية في المنصة
- [x] إضافة قوالب جاهزة للإنجليزية في صفحة القوالب (مذكرة لكل مستوى)
- [x] إضافة فلتر "اللغة الإنجليزية" في قائمة اختيار المادة بالمساعد البيداغوجي
- [x] استخراج محتوى الكتب من PDF وتخزينه في قاعدة البيانات

## تحسين واجهة المستخدم
- [x] إصلاح قائمة التنقل العلوية (header) — تقليص الحجم ووضع شعار Leader Academy في المنتصف

## تحسين المساعد البيداغوجي
- [x] إضافة تحقق ذكي من التناسق بين عنوان الدرس والمستوى الدراسي (مثلاً: "حرف الطاء" مع السنة السادسة)

## Historique des leçons générées
- [ ] Vérifier/créer la table aiSuggestions en base de données avec userId
- [ ] Créer les procédures tRPC: list, getById, delete pour l'historique
- [ ] Créer la page LessonHistory.tsx avec liste, détail, réutilisation et suppression
- [ ] Intégrer le lien vers l'historique dans la navigation (TeacherTools + Home)

## تصحيح المستويات الدراسية
- [x] تصحيح قائمة المستويات الدراسية في جميع الصفحات: ابتدائي (1-6)، إعدادي (7-9)، ثانوي (1-4)

## إصلاح المرفقات في المساعد البيداغوجي
- [x] إصلاح قراءة الصور والوثائق المرفقة في المساعد البيداغوجي (إرسالها كـ image_url/file_url للنموذج اللغوي)

## كتب السنة الأولى ابتدائي
- [x] رفع كتاب القراءة والرياضيات للسنة الأولى ابتدائي كمراجع بيداغوجية

## كتب المركز الوطني البيداغوجي (CNP)
- [ ] استخراج روابط جميع الكتب الرسمية من موقع CNP وتخزينها كمراجع بيداغوجية

## كتب المركز الوطني البيداغوجي (CNP)
- [x] استخراج روابط جميع الكتب الرسمية من موقع CNP وتخزينها كمراجع بيداغوجية (328 كتاباً)

## استخراج محتوى كتب المعلمين (Teacher Guides)
- [ ] تحليل قاعدة بيانات الكتب وتحديد كتب المعلمين ذات الأولوية
- [ ] تحميل واستخراج النصوص من كتب المعلمين
- [ ] تحديث قاعدة البيانات بالمحتوى النصي المستخرج
- [ ] تحديث المساعد البيداغوجي لاستخدام المحتوى النصي الجديد

## استخراج محتوى كتب المعلمين (CNP)
- [x] تحليل قاعدة بيانات الكتب المتاحة وتحديد كتب المعلمين (113 كتاب)
- [x] تحميل واستخراج النصوص من كتب المعلمين (72 كتاب بنجاح من أصل 113)
- [x] تحديث قاعدة البيانات بالمحتوى النصي المستخرج (80 مرجع الآن بمحتوى)
- [x] تحسين المساعد البيداغوجي لاستخدام المحتوى النصي الفعلي في الاقتراحات

## تحسين المساعد البيداغوجي بناءً على ملاحظات المتفقد
- [x] قراءة المذكرة الأصلية وتحليل ملاحظات المتفقد
- [x] تحديث system prompt بمعايير المتفقد (كفاية ختامية، هيكلة رسمية 4 مراحل، شبكة تقييم معيارية، زمن دقيق، مؤشرات التملك، وضعية إدماجية، قاعدة الثلثين)
- [ ] اختبار التحسينات وحفظ نقطة تفتيش

## المهام الجديدة (مارس 2026)
- [x] اختبار المساعد البيداغوجي بطلب مذكرة رياضيات والتحقق من الهيكلة الرباعية الجديدة (10/10 عناصر ✓)
- [x] إضافة قالب تقييم ذاتي للمذكرات (شبكة معيارية تفاعلية 6 معايير في صفحة تقييم الفيشة)
- [x] متابعة OCR للكتب المتبقية وتحديث قاعدة البيانات (20 كتاب إضافي — الإجمالي: 92 مرجع بمحتوى)

## إصلاح الأخطاء (مارس 2026)
- [x] إصلاح خطأ 404 عند الضغط على القوالب الجاهزة — توجيه إلى /assistant?templateId=X وتحميل بيانات القالب تلقائياً

## Enrichissement de la bibliothèque de modèles (Mars 2026)
- [x] Créer des modèles pour les matières scientifiques (Sciences, Éveil scientifique, SVT, Physique-Chimie) — 6 modèles
- [x] Créer des modèles pour la langue française (expression écrite, grammaire, compréhension) — 3 modèles
- [x] Vérifier l'affichage des nouveaux modèles dans la bibliothèque (16 groupes, 12 nouveaux modèles)

## إصلاح أخطاء (مارس 2026 - دورة 2)
- [x] إصلاح خطأ "خطأ في تصدير المحادثة" — استبدال weasyprint (Python 3.13 تعارض) بـ puppeteer-core (Node.js) — تصدير PDF يعمل بنجاح في 7.7 ثانية

## تصدير المذكرة النظيفة (مارس 2026)
- [x] إضافة منطق استخراج المذكرة البيداغوجية فقط من رسائل المحادثة (بدون رسائل الحوار)
- [x] إضافة زر "تصدير مذكرة نظيفة" (PDF ✨ + Word ✨) باللون الأخضر في شريط الأدوات
- [x] اختبار التصدير النظيف والتحقق من جودة المخرجات

## تحسين تنسيق ملف Word المُصدَّر (مارس 2026)
- [ ] إصلاح عرض الجداول في ملف Word المُصدَّر — الجداول تظهر كنص عادي بدلاً من جداول حقيقية
- [ ] تحسين التنسيق العام للمذكرة النظيفة في Word (عناوين، ألوان، هوامش)

## إصلاح تصدير الجداول في Word (مذكرة نظيفة)
- [x] إعادة كتابة محوّل Markdown-to-DOCX في server/exportConversation.ts
- [x] إضافة دالة buildDocxTable() لتحويل جداول Markdown إلى جداول Word حقيقية
- [x] إضافة دالة parseInlineMarkdown() لدعم النص العريض داخل الخلايا
- [x] تصميم رأس الجدول بلون أزرق داكن (#1e3a5f) وصفوف متناوبة الألوان
- [x] دعم الأرقام المرقمة (numbered lists) في المحوّل الجديد
- [x] اختبار الجداول بملف Word تجريبي — النتيجة ناجحة
- [x] حفظ نقطة تفتيش

## نافذة منبثقة لتخصيص بيانات التصدير
- [x] إنشاء مكوّن ExportMetadataModal (اسم المدرسة، اسم المعلم، التاريخ)
- [x] ربط النافذة بزرّي تصدير PDF و Word في EduGPTAssistantEnhanced.tsx
- [x] تحديث إجراءات tRPC لقبول الحقول الجديدة (schoolName, teacherName, exportDate)
- [x] تضمين البيانات في ترويسة PDF و Word المُصدَّرة
- [x] اختبار التصدير مع البيانات المخصصة
- [x] حفظ نقطة تفتيش

## رفع شعار المدرسة في التصدير
- [x] إضافة زر رفع الشعار في ExportMetadataModal مع معاينة فورية
- [x] إضافة إجراء tRPC لرفع الشعار إلى S3 وإرجاع URL
- [x] تضمين الشعار في ترويسة PDF (base64 inline)
- [x] تضمين الشعار في ترويسة Word (ImageRun)
- [x] اختبار التصدير مع الشعار
- [x] حفظ نقطة تفتيش

## إصلاح PDF في بيئة الإنتاج
- [x] استبدال puppeteer-core بمكتبة pdfkit (تعمل بدون Chromium) مع دعم العربية والجداول
- [x] رفع خطوط Amiri إلى CDN لضمان توفرها في الإنتاج
- [x] اختبار التصدير بنجاح (14 KB PDF)
- [ ] حفظ نقطة تفتيش

## إصلاح Dynamic require في الإنتاج
- [ ] استبدال require("fs") و require("arabic-reshaper") و require("bidi-js") بـ import ثابت في exportConversation.ts
- [ ] اختبار التصدير بعد الإصلاح
- [ ] حفظ نقطة تفتيش

## إصلاح النص العربي في PDF (حروف مبعثرة)
- [ ] استبدال arabic-reshaper بمكتبة تعمل بشكل صحيح في الإنتاج
- [ ] اختبار عرض النص العربي في PDF
- [ ] حفظ نقطة تفتيش

## الشهادة الجامعة (Comprehensive Certificate)
- [x] إنشاء دالة drawComprehensiveCertificate في certificates.ts بتصميم ذهبي/ملكي
- [x] إضافة 4 توقيعات في أسفل الشهادة الجامعة
- [x] تحديث generateCertificatePDF للتعرف على الشهادة الجامعة وتطبيق التصميم الخاص
- [x] تحديث صفحة MyCertificates.tsx بقسم مخصص للشهادة الجامعة مع شريط التقدم
- [x] إضافة زر إصدار الشهادة الجامعة عند اكتمال الشروط
- [x] كتابة اختبارات وحدة للشهادة الجامعة (3 اختبارات ناجحة)
- [x] حفظ نقطة التفتيش

## تحديث إعدادات الوكيل المساعد البيداغوجي
- [x] تحديث system prompt الوكيل المساعد بهوية "مساعد Leader Academy البيداغوجي (نسخة تونس 2026)"
- [x] إضافة تخصص الإيقاظ العلمي التونسي والبروتوكول البيداغوجي (6 مراحل + البيئة التونسية)
- [ ] حفظ نقطة التفتيش

## تحديث الوكيل: المستشار البيداغوجي الذكي لـ Leader Academy
- [x] استبدال system prompt بالبروتوكول الجديد (APC + جذاذات الإيقاظ العلمي س1-س6)
- [ ] حفظ نقطة التفتيش

## قالب Leader Academy Standard للجذاذات
- [x] إضافة مكتبة QR Code لتوليد الباركود
- [x] تحميل شعار Leader Academy وحفظه محلياً
- [x] بناء قالب HTML/CSS احترافي (ترويسة + بلوكات + تذييل)
- [x] دمج خطوط Amiri و Cairo العربية من Google Fonts
- [x] إدراج علم تونس CSS في التذييل
- [x] إضافة endpoint exportLeaderAcademyJathatha في routers.ts
- [x] إضافة زر قالب Leader Academy Standard في واجهة المستخدم
- [x] 7 اختبارات وحدة ناجحة
- [ ] حفظ نقطة التفتيش
