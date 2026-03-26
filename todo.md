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

## إضافة مراجع داخلية: التخطيط السنوي للرياضيات
- [x] قراءة وتحليل ملف التخطيط السنوي للرياضيات (السنة الثالثة والرابعة)
- [x] قراءة وتحليل مخطط الرياضيات للسنة الرابعة (4ème)
- [x] دمج محتوى الملفين كمراجع داخلية في system prompt الوكيل
- [x] تحديث schema exportLeaderAcademyJathatha بالحقول الجديدة (sessionNumber، schoolName، textbookRef، المراحل الثلاث)
- [x] إصلاح خطأ TypeScript في PedagogicalSheetFormEnhanced.tsx
- [ ] حفظ نقطة التفتيش

## إضافة مخطط الإيقاظ العلمي — السنة الخامسة ابتدائي
- [x] قراءة وتحليل ملف planningannuelScience23-24C5.docx
- [x] توثيق المخطط السنوي الكامل (5 فترات، 3 ثلاثيات)
- [x] دمج المحتوى كمرجع داخلي في system prompt الوكيل
- [ ] حفظ نقطة التفتيش

## إضافة هيكل الاختبار التونسي الرسمي (SC2M223)
- [x] قراءة وتحليل نموذج SC2M223 (السنة الثانية، الثلاثي الأول، 2023/2024)
- [x] توثيق الهيكل الكامل: ترويسة + سندات + تعليمات + معايير التنقيط الخمسة
- [x] دمج هيكل الاختبار ومعايير التنقيط كمرجع داخلي في system prompt الوكيل
- [ ] حفظ نقطة التفتيش

## البروتوكول الجديد: المحرك البيداغوجي لـ Leader Academy
- [ ] تحديث system prompt الوكيل بهوية "متفقد تونسي خبير" والبروتوكول الجديد
- [ ] إضافة دعم توليد JSON منظم {Header, Objectives, Stages, Evaluation}
- [ ] إضافة دعم متغيرات Lesson_Title وLevel في الوكيل
- [ ] إضافة endpoint تصدير JSON إلى Word في الخادم (docx)
- [ ] إضافة زر "تصدير Word" في واجهة المساعد البيداغوجي
- [ ] حفظ نقطة التفتيش

## البروتوكول الجديد: المحرك البيداغوجي الذكي (متفقد تونسي + JSON)
- [x] تحديث system prompt بهوية "المحرك البيداغوجي لمنصة Leader Academy — متفقد تونسي خبير"
- [x] إضافة بروتوكول توليد التوزيع السنوي (ثلاثي/فترة/مكوّن/هدف/محتوى/حصص)
- [x] إضافة بروتوكول توليد الجذاذة بمتغيرات Lesson_Title و Level
- [x] إضافة بروتوكول مخرجات JSON منظمة (Header, Objectives, Stages, Evaluation)
- [x] إنشاء ملف wordExporter.ts لتصدير JSON إلى Word بقالب Leader Academy
- [x] إضافة endpoint exportJathathToWord في routers.ts
- [x] إضافة زر "تصدير Word • ليدر أكاديمي" في PreviewSuggestionDialog
- [ ] حفظ نقطة التفتيش

## ميزة توليد المخطط السنوي التلقائي (اللغة العربية - تونس)
- [x] إضافة endpoint generateAnnualPlan في routers.ts (LLM + JSON منظم)
- [x] بناء صفحة AnnualPlanGenerator.tsx مع جدول تفاعلي قابل للتعديل وإضافة صف جديد
- [x] إضافة endpoint exportAnnualPlanToWord في wordExporter.ts
- [x] ربط الصفحة بالتنقل في App.tsx وإضافة زر في TeacherTools.tsx
- [ ] حفظ نقطة التفتيش

## Génération automatique de fiches de cours depuis le plan annuel
- [ ] Analyser l'architecture existante (routers, wordExporter, AnnualPlanGenerator)
- [ ] Ajouter endpoint generateLessonSheetFromPlan dans routers.ts
- [ ] Construire la page LessonSheetFromPlan.tsx (sélection ligne du plan → génération → édition → export)
- [ ] Intégrer la navigation depuis AnnualPlanGenerator et TeacherTools
- [ ] Sauvegarder le checkpoint

## توليد جذاذة تلقائية من المخطط السنوي — مكتمل
- [x] تحليل البنية الموجودة (routers, wordExporter, AnnualPlanGenerator)
- [x] التحقق من endpoint generateLessonSheetFromPlan الموجود في routers.ts (pedagogicalSheets)
- [x] بناء صفحة LessonSheetFromPlan.tsx مع:
  - [x] نموذج اختيار المادة والمستوى والثلاثي والفترة والهدف المميز
  - [x] توليد الجذاذة بالذكاء الاصطناعي (استدعاء endpoint generateLessonSheetFromPlan)
  - [x] عرض الجذاذة الكاملة (معطيات عامة، كفاية، أهداف، مراحل الحصة، استنتاج، تقييم)
  - [x] وضع التعديل اليدوي للحقول
  - [x] تصدير Word بقالب Leader Academy
- [x] إضافة الاستيراد والمسار /lesson-sheet-from-plan في App.tsx
- [x] إضافة زر "توليد جذاذة تلقائية" في TeacherTools.tsx (تبويب تخطيط الدروس)
- [x] كتابة 12 اختباراً وحدوياً ناجحاً في lessonSheetFromPlan.test.ts
- [ ] حفظ نقطة التفتيش

## ميزة توليد الاختبار التقييمي من الجذاذة البيداغوجية
- [x] تحليل البنية الموجودة (routers, LessonSheetFromPlan, wordExporter)
- [x] إضافة endpoint generateEvaluationFromSheet في routers.ts
- [x] بناء صفحة EvaluationFromSheet.tsx (عرض + تعديل + تصدير)
- [x] إضافة زر "توليد اختبار" في LessonSheetFromPlan.tsx
- [x] إضافة المسار /evaluation-from-sheet في App.tsx
- [x] كتابة 17 اختباراً وحدوياً ناجحاً في evaluationFromSheet.test.ts
- [x] حفظ نقطة التفتيش (da2391df)

## ميزة توليد التقييم مباشرة من جدول المخطط السنوي (SC2M223)
- [x] تحليل وثيقة SC2M223 ومعايير التقييم التونسية
- [x] إضافة endpoint generateEvaluationFromPlanRow في routers.ts
- [x] إضافة زر "توليد تقييم" في كل صف من جدول AnnualPlanGenerator مع ديالوج الإعداد
- [x] تحديث exportEvaluationToWord بترويسة SC2M223 رسمية
- [x] كتابة 24 اختباراً وحدوياً ناجحاً في evaluationFromPlanRow.test.ts
- [ ] حفظ نقطة التفتيش

## إضافة زر الرجوع في جميع الصفحات
- [ ] إنشاء مكوّن BackButton قابل لإعادة الاستخدام
- [ ] إضافة زر الرجوع في صفحة LessonSheetFromPlan
- [ ] إضافة زر الرجوع في صفحة EvaluationFromSheet
- [ ] إضافة زر الرجوع في صفحة AnnualPlanGenerator
- [ ] إضافة زر الرجوع في صفحة TeacherTools
- [ ] إضافة زر الرجوع في صفحات أخرى (QuizTake, ExamResults, CourseDetail, etc.)
- [ ] حفظ نقطة التفتيش

## إضافة زر الرجوع في جميع الصفحات
- [x] إنشاء مكوّن BackButton قابل لإعادة الاستخدام
- [x] إضافة زر الرجوع في LessonSheetFromPlan
- [x] إضافة زر الرجوع في EvaluationFromSheet
- [x] إضافة زر الرجوع في AnnualPlanGenerator
- [x] إضافة زر الرجوع في TeacherTools
- [x] إضافة زر الرجوع في ImportExam
- [x] إضافة زر الرجوع في ReferenceLibrary
- [x] إضافة زر الرجوع في TemplateLibrary
- [ ] حفظ نقطة التفتيش

## إعادة هيكلة التقييم وفق القالب الرسمي SC2M223
- [x] تحديث prompt الذكاء الاصطناعي لتوليد JSON بهيكل سندات/تعليمات/شبكة تصحيح
- [x] إعادة كتابة exportEvaluationToWord بترويسة مزدوجة + سندات + مربعات النقاط + شبكة التصحيح
- [x] إعادة كتابة EvaluationFromSheet.tsx لعرض هيكل SC2M223 (سندات+تعليمات+شبكة)
- [x] TypeScript: 0 أخطاء
- [x] حفظ نقطة التفتيش (f8483c15)

## ثلاث ميزات جديدة في صفحة التقييم
- [x] طباعة مباشرة بتنسيق A4 (CSS print + زر طباعة)
- [x] توليد نسخة بديلة (Variante B) بسندات وتعليمات مختلفة
- [x] مكتبة التقييمات: جدول saved_evaluations + endpoints tRPC (save/list/get/delete/generateVariantB)
- [x] صفحة EvaluationLibrary.tsx مع بحث وفلاتر حسب المادة/المستوى/الثلاثي
- [x] ربط المسار /evaluation-library في App.tsx + زر في TeacherTools
- [x] حفظ نقطة التفتيش (9037ab35)

## إصلاح نافذة إعداد توليد التقييم
- [x] إضافة زر X لإغلاق النافذة
- [x] إصلاح التمرير وتحسين تخطيط النافذة (max-h-[60vh] overflow-y-auto)
- [x] حفظ نقطة التفتيش (3d26ddae)

## إصلاح نافذة اختيار المادة/المستوى في صفحة المساعد البيداغوجي
- [x] إضافة زر X لإغلاق النافذة المنبثقة
- [x] إصلاح التمرير (max-h-[90vh] overflow-y-auto)
- [x] تحسين التخطيط: هيدر ثابت + محتوى قابل للتمرير + زر تأكيد ثابت في الأسفل
- [x] حفظ نقطة التفتيش (197dcc41)

## إصلاح عدم تحميل المحادثات السابقة في صفحة المساعد البيداغوجي
- [x] تحليل السبب: getUserConversations تُرجع messages كـ null من JSON
- [x] إصلاح: استخدام getConversation endpoint عند النقر لجلب الرسائل كاملة
- [x] إضافة مؤشر تحميل (opacity-60) عند النقر على محادثة
- [x] حفظ نقطة التفتيش (4e8520d8)

## تحسينات صفحة المساعد البيداغوجي (جلسة 3)
- [x] حفظ اختيار المادة/المستوى/اللغة في localStorage
- [x] تسمية المحادثات يدوياً بالنقر المزدوج + زر قلم
- [x] تجميع المحادثات حسب التاريخ (اليوم، الأمس، هذا الأسبوع، أقدم)
- [x] حفظ نقطة التفتيش (ba3873c0)

## ميزات جديدة في المساعد البيداغوجي (جلسة 4)
- [x] تصدير المحادثة كـ PDF (endpoint + زر تنزيل موجود)
- [x] تصدير المحادثة كـ Word (endpoint جديد exportConversationAsWord + زر)
- [x] بحث في محتوى الرسائل (تحديث getUserConversations بـ JSON_SEARCH)
- [x] تثبيت المحادثة في الأعلى (isPinned في DB + togglePinConversation + أيقونة Pin/PinOff)
- [x] حفظ نقطة التفتيش (5e3c2cad)

## نظام الوسوم (Tags) للمحادثات (جلسة 5)
- [x] إضافة عمود tags (JSON array) في جدول conversations بقاعدة البيانات
- [x] إضافة endpoints tRPC: updateConversationTags
- [x] تحديث getUserConversations لدعم الفلترة بالوسوم (JSON_SEARCH)
- [x] واجهة إضافة/حذف الوسوم (زر # مع قائمة منسدلة)
- [x] وسوم مُعرَّفة مسبقاً: مذكرة، تقييم، توزيع سنوي، تمارين، مراجعة، تقرير، أخرى
- [x] شريط فلترة بالوسوم في الشريط الجانبي + شارات الوسوم على كل محادثة
- [x] حفظ نقطة التفتيش (44c94ca7)

## Leader Assistant - System Prompt المتكامل (جلسة 6)
- [x] تحديث system prompt في routers.ts بهوية Leader Assistant الكاملة
- [x] إضافة منطق Chain of Thought (تحليل → تصنيف → تنفيذ)
- [x] دعم اللغة الفرنسية تلقائياً (الرد بلغة السؤال)
- [x] آلية جمع البيانات (Lead Generation) وتوجيه للإيميل leaderacademy216@gmail.com
- [x] القيود والحدود (لا وعود مالية، لا سياسة، إعادة توجيه للخبير)
- [x] حفظ نقطة التفتيش (02ed877e)

## ميزات جلسة 7: ترحيب + تواصل + إشعارات
- [x] رسالة ترحيب تلقائية عند فتح محادثة جديدة (Leader Assistant يُقدّم نفسه ويسأل عن المادة والمستوى)
- [x] صفحة "تواصل معنا" مع نموذج (6 حقول) + endpoint contact.send عبر notifyOwner
- [x] إضافة رابط "تواصل معنا" في شريط التنقل الرئيسي
- [x] إشعار فوري للمسؤول (contact.notifyLead) عند اكتشاف كلمات مفتاحية في رسائل المستخدم
- [x] حفظ نقطة التفتيش (6d887141)

## إعادة تصميم الصفحة الرئيسية - Leader Academy (جلسة 8)
- [x] تحديث الثيم العام (ألوان Deep Blue #1A237E + Orange #FF6D00، خط Cairo/Tajawal)
- [x] إعادة بناء الـ Header (5 روابط تنقل + قائمة موبايل)
- [x] قسم Hero كامل (عنوان + وصف + زران + محاكاة EDUGPT)
- [x] قسم الإحصائيات (4 أرقام: +500 مدرّس، 12 برنامج، 98% رضا، 2026)
- [x] قسم المميزات (4 بطاقات: AI، تقييم، توليد محتوى، شهادات)
- [x] قسم البرامج التدريبية (بطاقات الدورات بتصميم جديد)
- [x] قسم CTA نهائي (Deep Blue gradient)
- [x] Footer احترافي (3 أعمدة: علامة تجارية، روابط، تواصل)
- [x] حفظ نقطة التفتيش (e0fb6b1a)

## صفحة EDUGPT الداخلية - Dashboard SaaS (جلسة 9)
- [x] إنشاء صفحة EduGPT.tsx بتصميم SaaS احترافي
- [x] نموذج توليد الجذاذة (4 حقول + شرائح سريعة للمواد)
- [x] زر "توليد جذاذة احترافية" مع أيقونة Magic Wand + حالة تحميل
- [x] منطقة عرض النتيجة (نسخ + تحميل PDF + حالة فارغة جذابة)
- [x] endpoint tRPC edugpt.generateLesson + edugpt.exportLessonAsPdf
- [x] تسجيل المسار /edugpt في App.tsx
- [x] حفظ نقطة التفتيش (cdd33a70)

## System Prompt بيداغوجي متخصص لـ EDUGPT (جلسة 10)
- [x] تحديث system prompt في edugpt.generateLesson بدور المتفقد البيداغوجي التونسي (20 سنة خبرة)
- [x] هيكل الجذاذة: رأسية (المادة/المستوى/الموضوع/المدة) + الكفايات + الأهداف الإجرائية
- [x] جدول سيرورة الدرس: 5 مراحل (Engagement, Exploration, Explanation, Elaboration, Evaluation)
- [x] كل مرحلة: نشاط المعلم + نشاط التلميذ + الوسائل التعليمية + الزمن
- [x] قسم التقييم التكويني (وضعية إدماجية + سؤال + معيار نجاح)
- [x] مصطلحات وزارة التربية التونسية حصراً + سياقات تونسية
- [x] حفظ نقطة التفتيش (98818496)

## اللمسات الأخيرة - World-Class Academy (جلسة 11)
- [x] قسم الشهادات "ماذا يقول المربون عنا؟" (3 بطاقات مدرسين تونسيين بتقييم نجوم)
- [x] قسم النشرة البريدية مع حقلي اسم + بريد + زر اشتراك + رسالة نجاح
- [x] endpoint tRPC newsletter.subscribe لحفظ المشتركين في DB + إشعار مسؤول
- [x] تحديث Footer بالإيميل الرسمي leaderacademy216@gmail.com
- [x] التجاوب الكامل مع الموبايل (mobile-first مع Tailwind responsive)
- [x] حفظ نقطة التفتيش (f2dddaea)

## المتفقد الذكي - "عرض على المتفقد الذكي" (جلسة 12)
- [x] endpoint tRPC edugpt.inspectLesson بـ system prompt المتفقد العام (رتبة مميز، 30 سنة خبرة)
- [x] معايير التقييم: الانسجام البيداغوجي، تمشّي الحصة، الدقة العلمية، هندسة الاختبارات، الإبداع الرقمي
- [x] شكل التقرير: توطئة + نقاط القوة + الإخلالات + توصيات المتفقد + القرار النهائي
- [x] زر "عرض على المتفقد الذكي" في صفحة EduGPT.tsx (سكشن مستقل)
- [x] منطقة إدخال النص (لصق الجذاذة) + عداد الحروف + زر تحليل
- [x] عرض تقرير التفقد بتصميم رسمي (Deep Blue header + نسخ التقرير)
- [x] حفظ نقطة التفتيش (bb0c89bc)

## صفحة المتفقد الذكي المستقلة (جلسة 13)
- [ ] إنشاء صفحة Inspector.tsx مستقلة على المسار /inspector
- [ ] تبويب 1: تقييم مذكرة/جذاذة (system prompt متفقد بيداغوجي)
- [ ] تبويب 2: تقييم اختبار (system prompt متخصص في هندسة الاختبارات)
- [ ] تبويب 3: تقييم تخطيط سنوي (system prompt متخصص في التخطيط)
- [ ] تبويب 4: تقييم تقرير تفقد (system prompt لمراجعة تقارير التفقد)
- [ ] endpoints tRPC مخصصة لكل نوع تقييم
- [ ] تصميم احترافي بألوان رسمية + أيقونات مميزة لكل تبويب
- [ ] إضافة رابط "المتفقد الذكي" في شريط التنقل الرئيسي
- [ ] حفظ نقطة التفتيش

## تحديث صفحة المتفقد الذكي (جلسة 14)
- [x] إنشاء SmartInspector.tsx بتصميم احترافي كامل مع 4 تبويبات
- [x] تبويب 1: مذكرة/جذاذة - بـ system prompt المتفقد العام (رتبة مميز، 30 سنة)
- [x] تبويب 2: اختبار/فرض - بـ system prompt متخصص في هندسة الاختبارات
- [x] تبويب 3: توزيع/تخطيط سنوي - بـ system prompt متخصص في التخطيط
- [x] تبويب 4: وثيقة أخرى - بـ system prompt عام للوثائق التربوية
- [x] endpoint tRPC موحد inspectDocument (publicProcedure) مع 4 system prompts مخصصة
- [x] معايير التركيز (chips اختيارية) لكل نوع وثيقة
- [x] قسم Hero مع إحصائيات + شريط تنقل مع روابط
- [x] حالات: فارغ + تحميل متحرك + عرض التقرير + نسخ + طي/توسيع
- [x] إضافة رابط "المتفقد الذكي" في NAV_LINKS في Home.tsx
- [x] نسخ Inspector.tsx من SmartInspector.tsx (0 أخطاء TypeScript)
- [x] Route /inspector مسجلة في App.tsx

## رفع الملفات في المتفقد الذكي (جلسة 15)
- [ ] endpoint tRPC edugpt.extractTextFromFile لاستخراج النص من PDF/Word/صورة
- [ ] منطقة drag & drop لرفع الملفات في Inspector.tsx
- [ ] دعم: PDF (pdf-parse)، Word (mammoth)، صور (LLM vision)
- [ ] عرض اسم الملف + حجمه + زر حذف
- [ ] التبديل بين وضع "لصق النص" و"رفع ملف"
- [ ] حفظ نقطة التفتيش

## رفع الملفات في المتفقد الذكي - مكتمل (جلسة 15)
- [x] endpoint tRPC edugpt.extractTextFromFile لاستخراج النص من PDF/Word/صورة
- [x] منطقة drag & drop لرفع الملفات في Inspector.tsx
- [x] دعم: PDF (pdf-parse)، Word (mammoth)، صور (LLM vision)
- [x] عرض اسم الملف + حجمه + زر حذف
- [x] التبديل بين وضع "لصق النص" و"رفع ملف"
- [x] بطاقة معاينة النص المستخرج (أول 400 حرف)
- [x] حالات: جارٍ الاستخراج + نجاح + خطأ
- [x] TypeScript: 0 أخطاء

## Leader Visual Studio (جلسة 20)
- [ ] إنشاء endpoints tRPC لتوليد الصور (generateEducationalImage)
- [ ] إنشاء endpoint لإزالة الخلفية (removeBackground)
- [ ] إنشاء صفحة LeaderVisualStudio.tsx مع حقل الإدخال وأزرار الأنماط
- [ ] عرض الصورة مع أزرار التحميل وإزالة الخلفية
- [ ] تسجيل المسار في App.tsx وإضافة رابط في التنقل
- [ ] ربط Visual Studio مع صفحة بناء الاختبار (زر لتوليد صور السندات)

## Integrated Visual Solution (جلسة 21)
- [ ] تحديث جدول generated_images بإضافة userId وحقول التتبع
- [ ] إنشاء جدول image_usage_tracking لحدود الاستخدام
- [ ] endpoint suggestImagePrompts: اقتراح 3 prompts تلقائياً من محتوى الاختبار
- [ ] endpoint generateEducationalImage مع حدود الاستخدام (Free: 2, Pro: Unlimited)
- [ ] endpoint removeBackground لإزالة الخلفية
- [ ] endpoint gallery CRUD (save, list, delete)
- [ ] إنشاء صفحة LeaderVisualStudio.tsx كاملة مع أنماط الطباعة
- [ ] أولوية الطباعة: B&W Line Art و Minimalist كافتراضي
- [ ] ربط مع ExamBuilder: زر "توليد صورة تعليمية" بجانب كل سند
- [ ] اقتراح تلقائي لـ 3 صور عند توليد الاختبار
- [ ] قسم "وسائلي البصرية" في لوحة المستخدم
- [ ] عرض حدود الاستخدام وعداد الصور المتبقية

## Print-Ready Preview System (جلسة 22)
- [ ] مكون PrintPreview: تنسيق A4 مع هوامش 2cm
- [ ] ترويسة رسمية متكررة في كل صفحة (المدرسة، المادة، المستوى)
- [ ] ترقيم الصفحات (1/2, 2/2) في أسفل كل صفحة
- [ ] وضع الطباعة: تحويل الصور إلى تدرج رمادي عالي التباين
- [ ] زر تحميل PDF نظيف غير قابل للتعديل
- [ ] زر تحميل Word قابل للتعديل (docx.js)
- [ ] معاينة حية WYSIWYG تطابق الورقة المطبوعة
- [ ] CSS @media print rules لضمان التنسيق
- [ ] ربط PrintPreview مع ExamBuilder
- [ ] ربط PrintPreview مع المساعد البيداغوجي

## Print-Ready Preview Enhancement (جلسة 23)
- [x] إعادة كتابة PrintPreview بـ CSS @media print حقيقي لتنسيق A4
- [x] ترويسة رسمية متكررة في كل صفحة مطبوعة (thead/CSS running headers)
- [x] ترقيم صفحات تلقائي (1/2, 2/2) في أسفل كل صفحة
- [x] وضع تدرج رمادي/تباين عالي للصور عند الطباعة
- [x] تصدير PDF من الخادم (نظيف وغير قابل للتعديل)
- [x] تصدير Word (.docx) قابل للتعديل
- [x] معاينة حية WYSIWYG تطابق الورقة المطبوعة
- [x] ربط PrintPreview مع EduGPT (الجذاذات والدروس)
- [x] التأكد من ربط PrintPreview مع ExamBuilder

## Admin Dashboard الشامل (جلسة 24)
- [ ] تحديث schema: إضافة حقول صلاحيات الخدمات (access_edugpt, access_course_ai, etc.)
- [ ] إنشاء جدول payment_requests (طلبات الدفع مع صور الإيصالات)
- [ ] إنشاء endpoints إدارية: إدارة المستخدمين، الموافقة على المدفوعات، الإحصائيات
- [ ] تصدير CSV/Excel لقائمة المستخدمين وسجل المدفوعات
- [ ] لوحة تحكم: صفحة Overview بالبطاقات (إجمالي المستخدمين، المشتركين، المدفوعات المعلقة)
- [ ] قائمة المستخدمين مع badges ملونة لكل خدمة نشطة
- [ ] صفحة الموافقات المعلقة (عرض إيصال الدفع + أزرار تفعيل/رفض)
- [ ] مدير المحتوى ومراقبة الذكاء الاصطناعي (Live Feed)
- [ ] التحكم الشرطي في الوصول (حالة مقفلة + زر "ترقية إلى Pro")
- [ ] إشعارات تلقائية (تنبيه الأدمن عند رفع إيصال + رسالة نجاح للمستخدم)
- [ ] تأمين لوحة التحكم خلف صلاحية admin فقط

## Admin Dashboard - الإنجاز
- [x] جداول DB جديدة: payment_requests, service_permissions, ai_activity_log
- [x] Endpoints إدارية: getOverview, listUsers, updateUserRole, updateUserPermissions
- [x] Endpoints المدفوعات: listPaymentRequests, approvePayment, rejectPayment
- [x] Endpoints التصدير: exportUsersCSV, exportPaymentsCSV
- [x] Endpoint نشاط AI: getAiActivityFeed, logActivity
- [x] Endpoint المستخدم: submitPaymentRequest, getMyPermissions
- [x] واجهة لوحة التحكم: sidebar + overview + users + payments + activity + settings
- [x] مكون LockedFeature للتحكم الشرطي في الوصول
- [x] نظام رفع إيصال الدفع للمستخدمين
- [x] إشعارات تلقائية عند الموافقة/الرفض
- [x] تصدير CSV للمستخدمين والمدفوعات
- [x] مسار /admin في App.tsx ورابط في الصفحة الرئيسية

## ترقية Admin + LockedFeature + إعدادات الأسعار
- [ ] ترقية حساب المالك إلى admin في قاعدة البيانات
- [ ] ربط LockedFeature بصفحات EDUGPT والدورات
- [ ] إضافة endpoint getMyPermissions للمستخدم
- [ ] إضافة جدول service_pricing في DB
- [ ] إضافة صفحة إعدادات الأسعار في لوحة التحكم
- [ ] صفحة عرض الأسعار العامة للمستخدمين

## تحديث Admin + LockedFeature + Pricing (جلسة 22)
- [x] ترقية حساب المالك إلى admin في قاعدة البيانات
- [x] ربط LockedFeature مع EDUGPT (accessEdugpt)
- [x] ربط LockedFeature مع المتفقد الذكي (accessEdugpt)
- [x] ربط LockedFeature مع بناء الاختبار (accessEdugpt)
- [x] ربط LockedFeature مع Visual Studio (accessEdugpt)
- [x] إنشاء جدول pricing_plans في قاعدة البيانات
- [x] إضافة endpoints CRUD للأسعار (create, update, delete, list)
- [x] إضافة تبويب "الأسعار" في لوحة التحكم الإدارية
- [x] إنشاء صفحة التسعير العامة (/pricing) للمستخدمين
- [x] إضافة رابط "الأسعار" في الصفحة الرئيسية

## خطط الأسعار + إخفاء Admin + إشعارات بريدية (جلسة 23)
- [x] إضافة خطط أسعار افتراضية (EDUGPT PRO، دورة AI، دورة بيداغوجيا، الباقة الكاملة)
- [x] إخفاء رابط لوحة التحكم عن المستخدمين العاديين
- [x] إشعار بريدي للمسؤول عند استلام طلب دفع جديد
- [x] إشعار بريدي للمستخدم عند الموافقة/الرفض على اشتراكه
- [x] قوالب بريد إلكتروني احترافية (HTML/RTL) لكل حالة
- [x] اختبارات Vitest لقوالب البريد (10 اختبارات ناجحة)

## تحسين بناء الاختبار - مطابقة النموذج التونسي الاحترافي (جلسة 24)
- [x] تحسين system prompt لتوليد اختبارات بهيكل سند/تعليمة منفصل وواضح
- [x] إضافة جدول إسناد الأعداد (مع1أ، مع1ب، مع2أ، مع2ب، مع2ج، مع3) في نهاية كل اختبار
- [x] مربعات التنقيط الجانبية لكل معيار (نظام +/- : ---، +--، ++-، +++)
- [x] تنسيق احترافي للمعاينة: خط كبير واضح مناسب للابتدائي
- [x] فصل واضح بين السند والتعليمة مع فراغات للإجابة (نقاط متتالية)
- [x] ترويسة الاختبار: المدرسة + نوع الامتحان + الاسم واللقب + المادة + المستوى + السنة الدراسية
- [x] تصدير PDF احترافي بتنسيق A4 مطابق للنموذج مع خطوط عربية واضحة
- [x] تصدير Word (.docx) بنفس التنسيق الاحترافي (ترويسة جدولية + جداول Markdown)
- [x] اقتراح صور Line Art بسيطة للسندات [رسم: وصف] مع عناصر نائبة مرئية
- [x] إطار خارجي حول كل صفحة كما في النموذج
- [x] اختبارات Vitest للتنسيق الجديد (18 اختبار ناجح)

## توليد رسومات Line Art تلقائياً + حقل اسم المدرسة (جلسة 25)
- [x] إضافة حقل اسم المدرسة (schoolName) في جدول المستخدمين + migration
- [x] إضافة واجهة تعديل اسم المدرسة في بناء الاختبار مع زر حفظ في الملف الشخصي
- [x] تمرير اسم المدرسة تلقائياً لترويسة الاختبار (PrintPreview + Word)
- [x] زر "توليد رسومات" يكشف [رسم: ...] ويولد Line Art عبر Visual Studio API
- [x] استخدام أسلوب bw_lineart لتوليد صور أبيض وأسود مناسبة للطباعة
- [x] معرض صور مولّدة (شبكة 2×3) مع حذف فردي/جماعي + تمرير للطباعة
- [x] اختبارات Vitest (17 اختبار ناجح) للميزات الجديدة

## إصلاحات بعد تحليل فيديو التجربة (جلسة 26)
- [x] إصلاح: حقل اسم المدرسة غير مرئي في نموذج بناء الاختبار
- [x] إصلاح: عناصر [رسم: ...] تظهر كنص بدل صور في المعاينة والطباعة
- [x] تحسين: تضمين الصور المولّدة تلقائياً في محتوى الاختبار بدل [رسم: ...]
- [x] إصلاح: الصفحة 2 في معاينة الطباعة تظهر فارغة تقريباً (مشكلة ترقيم الصفحات)
- [x] تحسين: زر "توليد رسومات" يولّد كل الصور من العناصر النائبة ويدمجها مباشرة
- [x] تحسين: عرض الصور المولّدة داخل نص الاختبار وليس فقط في معرض منفصل
- [x] اختبارات Vitest (16 اختبار ناجح) للإصلاحات

## ميزات جديدة: سحب الصور + شعار المدرسة + تعديل جدول الإسناد (جلسة 27)
- [x] صور المعرض قابلة للسحب (Drag) والإفلات (Drop) في منطقة نص الاختبار
- [x] إضافة مؤشر بصري أثناء السحب (drag preview + drop zone highlight أزرق)
- [x] إدراج الصورة المسحوبة ك Markdown في نهاية النص
- [x] ميزة رفع شعار المدرسة (School Logo Upload) مع معاينة مباشرة
- [x] حفظ الشعار في S3 وربطه بالمستخدم في قاعدة البيانات (schoolLogo field)
- [x] عرض الشعار في ترويسة معاينة الطباعة بجانب اسم المدرسة
- [x] تضمين الشعار في تصدير PDF/طباعة (generatePrintHTML)
- [x] وضع تعديل (Edit Mode) لجدول إسناد الأعداد في معاينة الطباعة
- [x] إمكانية تعديل الدرجات يدوياً لكل معيار + مجموع كلي تلقائي
- [x] زر تبديل التعديل/الحفظ في شريط الأدوات
- [x] اختبارات Vitest (15 اختبار ناجح) للميزات الثلاث

## UAT النهائي - فحص الجاهزية للإطلاق (جلسة 28)

### الركيزة 1: الهوية والعلامة التجارية
- [x] التحقق من حفظ schoolName في قاعدة البيانات وملء ترويسة الاختبار تلقائياً
- [x] التحقق من محاذاة جدول الترويسة في الواجهة والتصدير (تم إضافة schoolName ديناميكي + إطار خارجي)
- [x] التحقق من رفع شعار المدرسة واستبداله في PDF و Word

### الركيزة 2: EDUGPT الأساسي
- [x] التحقق من هيكل سند/تعليمة في مخرجات الذكاء الاصطناعي (موجود في system prompt)
- [x] التحقق من رموز المعايير الفرعية (مع1 أ، مع2 ب، مع3) بجانب كل تعليمة (موجود في system prompt)
- [x] فرض خط كبير واضح (Cairo 14pt+) مناسب للابتدائي (PrintPreview: 16px+ / Word: Sakkal Majalla 22+)

### الركيزة 3: Visual Studio
- [x] التحقق من كشف عناصر [رسم: ...] تلقائياً وتفعيل زر التوليد (regex موجود في ExamBuilder)
- [x] التحقق من تطبيق أسلوب bw_lineart على كل الصور المولّدة (prompt يتضمن black and white line art)
- [x] التحقق من شبكة المعرض 2×3 مع حذف فردي/جماعي بدون تأخر (grid-cols-2 md:grid-cols-3)

### الركيزة 4: محرك التنقيط والتصدير
- [x] التحقق من إلحاق جدول إسناد الأعداد التونسي (نظام ---/+++) بكل اختبار (system prompt + PrintPreview)
- [x] التحقق من تعديل الدرجات يدوياً في وضع المعاينة (editingGrading state + input fields)
- [x] التحقق من سلامة تصدير Word/PDF (إطار خارجي pageBorders + تنسيق الجداول)

### الركيزة 5: الإدارة والتحكم في الوصول
- [x] التحقق من حظر الحسابات المجانية من توليد الصور ورفع الشعار (isFreeAccount check + toast)
- [x] التحقق من أداة التفعيل الجماعي (500 بريد إلكتروني) - تبويب جديد في لوحة التحكم
- [x] التحقق من أن المساعد يطلب اختيار المادة والمستوى قبل البدء (welcomeNoContext message)
- [x] 21 اختبار UAT ناجح عبر الركائز الخمس | 0 أخطاء TypeScript

## تحسين محرك بناء الجذاذات - المقاربة بالكفايات (جلسة 27)
- [x] تحليل 4 وثائق مرجعية (تخطيط سنوي علوم + رياضيات + مخطط 4ème + تكوين)
- [x] تحسين system prompt بهيكل 6 أقسام: ترويسة إدارية، مرجعية بيداغوجية، تمشي بيداغوجي، إدماج وتقييم، دعم وعلاج، ملاحظات
- [x] إضافة حقول جديدة: كفاية المجال، الكفاية النهائية، مكوّن الكفاية، هدف الحصة، المكتسبات القبلية
- [x] 4 مراحل بيداغوجية: استكشاف، بناء (مع خطوات مفصّلة)، تطبيق، إدماج وتقييم
- [x] قسم الدعم والعلاج: صعوبات متوقعة + أنشطة معالجة + معايير الحد الأدنى
- [x] تحديث واجهة العرض (LessonSheetFromPlan) بـ 6 أقسام ملونة مع جداول منظمة
- [x] تحديث تصدير Word بـ 6 أقسام كاملة مع جداول 4 أعمدة لمراحل الحصة
- [x] 14 اختبار Vitest ناجح | 0 أخطاء TypeScript

## إصلاح لون النص في معاينة الطباعة
- [x] تغيير لون الكتابة من الأبيض إلى الأسود في PrintPreview (color: #000 على div الصفحة)

## إصلاح فشل التوليد التلقائي للصور
- [x] تحليل سبب فشل توليد الصور عند الضغط على "توليد رسومات" في بناء الاختبار
- [x] إصلاح الخطأ وضمان عمل التوليد التلقائي للصور (سبب: React hooks ordering - early return قبل الـ hooks)

## إصلاح الكتابة العربية الخاطئة في الصور المولّدة
- [x] تحليل مشكل الكتابة العربية المشوهة في الصور المولّدة بالذكاء الاصطناعي
- [x] تعديل prompts التوليد لتجنب النص العربي أو إضافة معالجة لاحقة (ترجمة تلقائية + تعليمات NO TEXT)
- [x] اعتماد لقطة المستخدم كمرجع قياسي (Golden Standard) لكل التحسينات القادمة

## إضافة طبقة نصية عربية فوق الصور المولّدة
- [x] إضافة محرر نص عربي فوق الصور المولّدة (عنوان، تسمية) - ImageOverlayEditor
- [x] دعم تخصيص حجم الخط واللون والموضع
- [x] دمج المكون في ExamBuilder و LeaderVisualStudio

## مكتبة صور تعليمية جاهزة
- [x] رفع خريطة تونس الرسمية كأصل ثابت على CDN
- [x] إنشاء مكتبة صور تعليمية مصنفة حسب المواد (علوم، جغرافيا، رياضيات، تربية إسلامية، تربية مدنية)
- [x] إضافة واجهة اختيار الصور من المكتبة في بناء الاختبار والاستوديو - EducationalImageLibrary
- [x] إضافة 20+ صورة تعليمية مع تصنيفات وبحث

## إعادة توليد صورة محددة
- [x] إضافة زر إعادة توليد لكل صورة على حدة في بناء الاختبار
- [x] إظهار مؤشر تحميل أثناء إعادة التوليد
- [x] استبدال الصورة المحددة فقط دون التأثير على البقية

## تحسين لوحة تحكم الدورات - إدارة كاملة
- [x] تحليل الكود الحالي للوحة التحكم وقاعدة البيانات
- [x] إضافة إمكانية إنشاء دورة جديدة (اسم، وصف، نوع)
- [x] إضافة إمكانية حذف/إزالة دورة (soft delete + استعادة)
- [x] إضافة إمكانية تعديل بيانات الدورة
- [x] إضافة إمكانية إضافة فيديوهات للدورة (رابط، عنوان، ترتيب)
- [x] إضافة إمكانية حذف فيديو من الدورة
- [x] إضافة إمكانية إنشاء اختبار للدورة (أسئلة، خيارات، إجابات)
- [x] إضافة إمكانية حذف/تعديل اختبار
- [x] تحسين واجهة لوحة التحكم مع إحصائيات وبطاقات واضحة
- [x] كتابة اختبارات والتحقق من الوظائف (8/8 tests passed)

## تنظيم قائمة التنقل - تجميع أدوات الذكاء الاصطناعي تحت EDUGPT
- [x] تحليل هيكل القائمة الحالي في App.tsx والمكونات المرتبطة
- [x] إنشاء قائمة منسدلة EDUGPT تحتوي على: EDUGPT، المتفقد الذكي، بناء الاختبار، Visual Studio، تقييم المكتسبات
- [x] تحديث القائمة الرئيسية لتكون أكثر تنظيماً
- [x] اختبار القائمة المنسدلة على الحاسوب والجوال

## تحسين القائمة المنسدلة EDUGPT وإعادة الروابط المفقودة
- [x] استبدال الإيموجي بأيقونات Lucide مخصصة (Bot, Search, FileEdit, Palette, BarChart3)
- [x] إضافة وصف مختصر (سطر واحد) لكل أداة في القائمة المنسدلة
- [x] تفعيل القائمة المنسدلة عند التمرير (hover) بدل النقر - CSS group-hover
- [x] إعادة رابط "لوحة التحكم بالدورات" في القائمة الرئيسية (/dashboard)
- [x] إعادة رابط "شهاداتي" في القائمة (/my-certificates)
- [x] إعادة رابط "التحقق من الشهادات" في القائمة (/verify)

## تحسينات إضافية لشريط التنقل
- [x] تجميع "شهاداتي" و"التحقق من الشهادات" في قائمة منسدلة ثانية (hover + أيقونات + وصف)
- [x] إضافة مؤشر بصري للصفحة النشطة (bg-white/15 + خط برتقالي سفلي)
- [x] إضافة أيقونات Lucide لكل رابط في قائمة الجوال (Megaphone, Info, DollarSign, LayoutDashboard, Settings)

## تغيير عنوان التطبيق
- [ ] تغيير العنوان إلى "Leader Academy - منصة التعليم الذكي"

## إصلاح رابط برامجنا التدريبية
- [x] إصلاح زر "برامجنا التدريبية" - تمرير سلس لقسم البرامج على الحاسوب والجوال

## ميزة جديدة: Legacy Digitizer — رقمنة الوثائق التعليمية القديمة
- [x] إنشاء جدول digitized_documents في قاعدة البيانات
- [x] تنفيذ OCR backend مع Vision API محسّن للعربية/الفرنسية
- [x] تنفيذ AI Formatting لتحويل النص المستخرج إلى جذاذة تونسية رسمية
- [x] إنشاء endpoint لحفظ الوثائق المرقمنة في المكتبة
- [x] إنشاء endpoint لتصدير Word/PDF
- [x] إنشاء صفحة LegacyDigitizer.tsx مع واجهة رفع الصور
- [x] تنفيذ عرض جنباً إلى جنب (الصورة الأصلية vs النص المنسّق)
- [x] إضافة زر "مسح ورقمنة" في لوحة التحكم
- [x] دمج الأداة في قائمة EDUGPT المنسدلة
- [x] كتابة اختبارات Vitest للإجراءات الخلفية
- [x] اختبار شامل وحفظ checkpoint

## ميزة جديدة: الملف المهني للمعلم (Professional Teacher Portfolio) - Step 2

- [x] إنشاء جدول teacherPortfolios في قاعدة البيانات (إعدادات المحفظة والمشاركة العامة)
- [x] تنفيذ backend: تجميع إحصائيات النشاط (جذاذات، اختبارات، صور، شهادات)
- [x] تنفيذ backend: مخطط الكفاءات (Radar Chart data) حسب المواد
- [x] تنفيذ backend: تصدير PDF للملف المهني مع علامة Leader Academy
- [x] تنفيذ backend: رابط عام فريد للمشاركة مع المتفقدين
- [x] إنشاء صفحة Portfolio Dashboard مع بطاقات إحصائية بصرية
- [x] تنفيذ مخطط Radar/Spider للكفاءات
- [x] تنفيذ زر تصدير PDF للملف المهني
- [x] تنفيذ خيار المشاركة العامة (Public toggle + رابط فريد)
- [x] إنشاء صفحة العرض العام للملف المهني
- [x] دمج في التنقل (رابط في شريط المستخدم)
- [x] كتابة اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## ميزة جديدة: خريطة المنهج الذكية (Smart Curriculum Map / Curriculum GPS)
- [x] إنشاء جداول قاعدة البيانات: curriculumPlans, curriculumTopics, teacherCurriculumProgress
- [x] تنفيذ backend: إدارة المخططات السنوية (CRUD) مع استيراد من ملفات مرفوعة
- [x] تنفيذ backend: محاذاة تلقائية للدروس/الاختبارات مع المنهج (Auto-Alignment)
- [x] تنفيذ backend: تتبع التغطية (Coverage Tracker) - حساب نسبة التقدم
- [x] تنفيذ backend: اقتراحات ذكية حسب الفترة الحالية (Smart Suggestions)
- [x] تنفيذ backend: مرجع صفحات الكتاب المدرسي (Textbook Referencing)
- [x] إنشاء صفحة Curriculum Map مع عرض بصري للمنهج
- [x] تنفيذ شريط تقدم المنهج في لوحة التحكم
- [x] تنفيذ واجهة الاقتراحات الذكية في المساعد
- [x] دمج المحاذاة التلقائية في تدفق إنشاء الجذاذات والاختبارات
- [x] كتابة اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## ميزة جديدة: مساعد التصحيح الأعمى (Blind Grading Assistant)
- [x] إنشاء جداول قاعدة البيانات: gradingSessions, studentSubmissions
- [x] تنفيذ backend: رفع أوراق التلاميذ مع OCR متقدم للخط العربي/الفرنسي
- [x] تنفيذ backend: تصحيح ذكي حسب المعايير (مع1/مع2/مع3) مع مفتاح الإصلاح
- [x] تنفيذ backend: تطبيق نظام التقييم التونسي (---/+++) لتحديد مستوى التملك
- [x] تنفيذ backend: توليد ملاحظات بيداغوجية تلقائية (نقاط القوة ومجالات التحسين)
- [x] تنفيذ backend: حفظ وتصدير نتائج التصحيح
- [x] إنشاء صفحة Blind Grading Dashboard مع واجهة رفع الأوراق
- [x] تنفيذ عرض التصحيح مع بطاقات المعايير والدرجات
- [x] تنفيذ خاصية إخفاء أسماء التلاميذ (Privacy Shield)
- [x] تنفيذ عرض الملاحظات البيداغوجية وجدول النتائج
- [x] دمج مع وحدة بناء الاختبار (Exam Builder) وقائمة EDUGPT
- [x] كتابة اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## تحسينات مساعد التصحيح الأعمى (Step 4 Enhancements)
- [x] تصدير PDF لنتائج الجلسة مع جدول إسناد الأعداد
- [x] ربط مباشر من بناء الاختبار مع نقل مفتاح الإصلاح تلقائياً
- [x] تحليل إحصائي للفصل مع رسوم بيانية لتوزيع الدرجات ومستويات التملك
- [x] تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## ميزة جديدة: سوق المحتوى الذهبي والذكاء الجماعي (Step 6 - Golden Content Market)
- [x] إنشاء جداول قاعدة البيانات: marketplaceItems, marketplaceRatings, marketplaceDownloads
- [x] تنفيذ backend: نشر المحتوى في السوق (Publish to Marketplace)
- [x] تنفيذ backend: نظام التقييم والمراجعات (Ratings & Reviews)
- [x] تنفيذ backend: نظام الترتيب الذكي (AI Score + Ratings + Downloads)
- [x] تنفيذ backend: بحث وتصفية عالمي (Subject, Grade, Period, Difficulty)
- [x] تنفيذ backend: حماية الحقوق (Watermark/Footer تلقائي)
- [x] إنشاء صفحة Marketplace مع بطاقات المحتوى والبحث والتصفية
- [x] تنفيذ واجهة التقييم والمراجعات
- [x] ربط كل محتوى بالملف المهني للمساهم (Contributor Profile)
- [x] دمج في التنقل (رابط في شريط التنقل الرئيسي)
- [x] كتابة اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## إصلاحات قائمة EDUGPT
- [x] حذف "تقييم المكتسبات" من قائمة EDUGPT (المتفقد الذكي يغطي نفس الوظائف)
- [x] التأكد من ظهور "سوق المحتوى الذهبي" و"مساعد التصحيح الأعمى" في القائمة

## إصلاح: سوق المحتوى الذهبي لا يظهر في قائمة EDUGPT
- [x] فحص سبب عدم ظهور "سوق المحتوى الذهبي" في القائمة المنسدلة
- [x] إصلاح المشكلة والتحقق من الظهور

## تحسينات سوق المحتوى الذهبي (الجولة الثانية)
- [x] إضافة قسم "محتوى الأسبوع" في الصفحة الرئيسية (أفضل المحتويات تقييماً)
- [x] إضافة زر "نشر في السوق" في صفحات المكتبة (الجذاذات والاختبارات)
- [x] نظام إشعارات السوق (إعلام عند تقييم أو تحميل المحتوى)
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint
## تحسين Legacy Digitizer: الربط التلقائي بالكفايات (Intelligence Integration)
- [x] إضافة إجراء backend لمطابقة الكلمات المفتاحية مع جدول curriculumTopics
- [x] عرض الكفايات المرتبطة تلقائياً في واجهة التنسيق
- [x] إضافة زر ربط يدوي بالمنهج من واجهة المستخدم
- [x] تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint
## Step 1 Final Polish + Step 2 Initiation
- [x] إنشاء قاموس المصطلحات البيداغوجية التونسية (JSON) ودمجه مع OCR
- [x] تحسين الملف المهني: قسم "مساهماتي" مع حفظ تلقائي من Legacy Digitizer
- [x] رسم بياني رادار المهارات (Skill Radar Chart) من بيانات مطابقة الكفايات
- [x] واجهة رفع دفعات متعددة (Batch Upload) للرقمنة الجماعية
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## Step 2 Completion + Step 3: Curriculum GPS
- [x] تصدير الملف المهني كـ PDF احترافي (Portfolio PDF Export)
- [x] إنشاء منطق GPS المنهج مع شريط تقدم المنهج
- [x] إضافة إجراءات backend لحساب التقدم في المنهج
- [x] التنقل الذكي: عرض الدرس الحالي حسب التاريخ
- [x] زر "حضّر هذا الدرس الآن" مع ربط بمولد الجذاذات
- [x] واجهة أمامية لجميع الميزات الجديدة
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## تحسينات التصحيح الأعمى (Blind Grading Brain)
- [x] ربط التصحيح بـ GPS المنهج (اكتشاف تلقائي للدرس/الاختبار)
- [x] تحسين OCR للخط اليدوي للتلاميذ مع القاموس البيداغوجي
- [x] نظام تنقيط تلقائي حسب معايير مع1/مع2/مع3/مع4
- [x] محرك ملاحظات تشجيعية للتلاميذ بالعربية
- [x] لوحة إحصائيات الفصل مع تحليل المعايير
- [x] واجهة أمامية لجميع الميزات الجديدة
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## Step 4 Final: تقرير المتفقد الرسمي + Step 5: محرك الدراما التعليمية
- [x] تقرير المتفقد الرسمي PDF (مستويات التملك، الثغرات، خطة العلاج)
- [x] تصميم PDF رسمي بختم Leader Academy
- [x] واجهة أمامية لتصدير تقرير المتفقد
- [x] إنشاء محرك الدراما التعليمية (Creative Drama Engine)
- [x] توليد سيناريو مسرحي تفاعلي من جذاذة درس (10 دقائق)
- [x] توزيع الأدوار تلقائياً على التلاميذ حسب محتوى الدرس
- [x] اقتراح وسائل بصرية بسيطة ومنخفضة التكلفة
- [x] صفحة واجهة أمامية كاملة لمحرك الدراما
- [x] إضافة رابط في القائمة الجانبية
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## Visual Magic + Drama Library + Market Publishing
- [x] مولّد أقنعة الشخصيات (Line Art) عبر Visual Studio API
- [x] مكتبة المسرحيات الشخصية (حفظ/تحميل السيناريوهات والأقنعة)
- [x] أسئلة تقييم تكويني تلقائية لكل مسرحية (3 أسئلة)
- [x] نشر السيناريوهات في السوق الذهبي مع زر مباشر
- [x] وسم الحقوق والبيانات الوصفية (رابط الملف المهني + اسم المدرسة)
- [x] واجهة أمامية لجميع الميزات الجديدة
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## Unified Hotfix: /assistant & /inspector Optimization
### Part 1: Assistant (/assistant)
- [x] فرض المصطلحات البيداغوجية التونسية (سند، تعليمة، معايير التملك) في system prompt
- [x] إصلاح التنسيق: عناوين عريضة، نقاط، جداول Markdown بدل النصوص المكثفة
- [x] إصلاح RTL مع المصطلحات اللاتينية (PDF, OCR, M1)
- [x] إضافة 3 أزرار إجراء سريع ثابتة أسفل المحادثة
### Part 2: Inspector (/inspector)
- [x] تحسين صرامة التفقد: تمييز السند والمعايير المفقودة بالأحمر
- [x] قالب PDF رسمي بشعار Leader Academy وختم الموافقة المهنية
- [x] خطة علاجية تلقائية إذا التقييم أقل من 70%
### Global
- [x] خط Cairo مشترك وألوان العلامة التجارية
- [x] تدفق بيانات GPS المنهج عبر الصفحتين
- [x] كتابة/تحديث اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## Administrative & Social Core (Final Stage)
### 1. Managerial Analytics Dashboard
- [x] إنشاء صفحة لوحة التحكم الإدارية للمديرين
- [x] عرض إجمالي النشاط عبر جميع المعلمين
- [x] عرض أفضل المعلمين أداءً (بناءً على تقييمات السوق الذهبي)
- [x] عرض الفجوات البيداغوجية المشتركة (مجمعة من تقارير المتفقد)
- [x] إنشاء إجراءات Backend للتحليلات المجمعة
### 2. Peer Review System
- [x] إنشاء جدول قاعدة بيانات للتعليقات والتقييمات
- [x] إضافة تقييم 5 نجوم وتعليقات على موارد السوق الذهبي
- [x] فلتر ذكاء اصطناعي للتعليقات البناءة
- [x] واجهة عرض التعليقات والتقييمات
### 3. AI Video Teaser for Drama Scripts
- [x] إضافة زر "فيديو AI" في محرك المسرحيات
- [x] توليد معاينة فيديو متحركة 30 ثانية من السيناريو
- [x] واجهة عرض الفيديو المولد
### 4. Global Search & Recommendation
- [x] بناء محرك بحث للسوق الذهبي
- [x] اقتراحات بناءً على موقع GPS المنهج
- [x] عرض "زملاؤك يحضرون هذا الدرس الآن"
- [x] واجهة البحث والتوصيات
### Global
- [x] كتابة اختبارات Vitest لجميع الميزات الجديدة
- [x] اختبار شامل وحفظ checkpoint

## Leader Career Hub - Phase 1
### 1. Public Profile Mode
- [x] إضافة زر تبديل عام/خاص في ملف المعلم
- [x] توليد رابط URL فريد واحترافي (leaderacademy.school/showcase/teacher-name)
- [x] تحديث قاعدة البيانات لدعم الملفات العامة
### 2. Digital Resume (CV 2.0)
- [x] تصميم صفحة عرض عامة احترافية
- [x] شارة Leader Academy المعتمدة (ذهبية للخريجين)
- [x] رادار المهارات (AI والكفاءات البيداغوجية)
- [x] معرض العينات الذهبية (أفضل الجذاذات والمسرحيات)
### 3. Hire Me Button
- [x] زر "تواصل للتوظيف" في الملف العام
- [x] نموذج اتصال يرسل للمعلم وإدارة Leader Academy
- [x] إجراءات Backend لطلبات الاتصال
### 4. Privacy Shield
- [x] إخفاء معلومات الاتصال الشخصية (هاتف/بريد)
- [x] نظام طلبات الاتصال مع موافقة المعلم
- [x] كشف المعلومات فقط بعد الموافقة
### Global
- [x] كتابة اختبارات Vitest
- [x] اختبار شامل وحفظ checkpoint

## Leader Career Hub - Phase 2 (Marketplace Infrastructure)
### 1. Talent Directory (/showcase)
- [x] صفحة رئيسية تعرض جميع المعلمين ذوي الملفات العامة
- [x] فلترة متقدمة حسب المادة والمنطقة والمستوى ونقاط رادار المهارات
- [x] تصميم بطاقات عرض احترافية للمعلمين
### 2. Custom Slug & Notifications
- [x] السماح للمعلم بتخصيص رابط URL (slug) من إعدادات الملف المهني
- [x] إشعارات بريد إلكتروني عند وصول طلب توظيف جديد
### 3. Partner School Portal
- [x] تسجيل/دخول مخصص للمدارس الشريكة
- [x] جدول قاعدة بيانات للمدارس الشريكة وعروض العمل
- [x] واجهة نشر عروض العمل للمدارس المعتمدة
### 4. Smart Match Logic
- [x] منطق المطابقة الذكية عند نشر عرض عمل
- [x] تمييز أفضل 3 معلمين مطابقين تلقائياً
- [x] عرض نتائج المطابقة في بوابة المدرسة
### 5. Digital CV Download
- [x] زر تحميل السيرة الذاتية الرقمية في صفحة العرض
- [x] توليد HTML مكثف صفحة واحدة من الملف المهني (قابل للطباعة)
### Global
- [x] كتابة اختبارات Vitest (23 اختبار ناجح)
- [x] اختبار شامل وحفظ checkpoint

## Leader Career Hub - Phase 3 (Trust & Engagement)
### 1. Admin Vetting Dashboard (/admin/partners)
- [x] صفحة إدارية آمنة لاعتماد/رفض تسجيلات المدارس
- [x] مراقبة عروض العمل المنشورة
- [x] إحصائيات عامة عن الشراكات
### 2. Internal Messaging System
- [x] جداول قاعدة بيانات للمحادثات والرسائل
- [x] نظام محادثة بين المدارس والمعلمين
- [x] فلتر احترافية بالذكاء الاصطناعي
- [x] واجهة محادثة متوافقة مع الجوال
### 3. Teacher Analytics Hub
- [x] تتبع زيارات الملف المهني (يومي/أسبوعي)
- [x] عدد مرات تحميل السيرة الذاتية
- [x] عدد ظهورات المطابقة الذكية
- [x] بطاقة أداء بصرية في لوحة تحكم المعلم
### 4. Digital Audition
- [x] إرسال طلب مهمة رقمية من المدرسة للمرشح
- [x] واجهة عرض وإنجاز المهمة
- [x] إجراءات Backend للمهام الرقمية
### 5. UI Polish
- [x] تصميم Professional Blue متناسق
- [x] توافق كامل مع الجوال
### Global
- [x] كتابة اختبارات Vitest (24 اختبار ناجح)
- [x] اختبار شامل وحفظ checkpoint

## Fix: Admin Partners Dashboard Accessibility
- [x] Add Admin Console section in sidebar with link to /admin/partners labeled 'إدارة الشركاء'
- [x] Verify admin role for owner account (leaderacademy216@gmail.com)
- [x] Add red dot notification badge on sidebar link for pending school requests

## Career Hub Interactive Layer - Final Phase
- [x] Create job_applications table in schema for tracking teacher applications
- [x] Create smart_match_notifications table for notification tracking
- [x] Build backend procedures for job board (list public jobs, apply, track)
- [x] Build backend procedures for smart match notification logic (90%+ match)
- [x] Build Interactive Job Board page (/jobs) with Apply Now button
- [x] Build Application Tracker dashboard (/my-applications) for teachers
- [x] Implement smart match email notification on new job posting
- [x] Update navigation: /jobs visible for all authenticated users, /admin/partners for admins
- [x] Write vitest tests for all new Career Hub features
- [x] Generate comprehensive Platform Audit Whitepaper (modules, health, SWOT, Circle of Value)

## Amélioration du menu principal - Regroupement admin
- [x] Regrouper Admin, Gestion formations et Console dans un seul dropdown "الإدارة"
- [x] Nettoyer les liens redondants du menu desktop
- [x] Mettre à jour le menu mobile en conséquence
- [x] Tester et checkpoint

## Bug Squashing Session (from video analysis)
- [x] FIX: /assistant page crashes with React error #310 (useSyncExternalStore)
- [x] FIX: /inspector page crashes with React error #300
- [x] FIX: /exam-builder shows blank page or paywall for admin user
- [x] FIX: Admin/owner should bypass all paywalls
- [x] AUDIT: Check browser console logs for silent errors on all pages
- [x] AUDIT: RTL alignment issues across pages
- [x] AUDIT: Responsive design on mobile screens
- [x] VERIFY: All navigation links point to correct routes

## Academy Batch Manager
- [x] Create database schema: batches, batch_members, batch_feature_access tables
- [x] Create database schema: assignments, submissions tables
- [x] Build backend: batch CRUD (create, list, update, delete batches)
- [x] Build backend: batch member management (add/remove users, tag users)
- [x] Build backend: batch feature gating rules (set access per batch)
- [x] Build backend: assignment CRUD (create, list, update assignments per batch)
- [x] Build backend: submission portal (submit, list, grade submissions)
- [x] Build backend: AI auto-grader using Inspector logic
- [x] Build Admin Batch Manager dashboard (/admin/batches)
- [x] Build Homework Submission Portal (/my-assignments)
- [x] Integrate batch-based feature gating into LockedFeature/usePermissions
- [x] Update navigation with batch manager links
- [x] Write vitest tests for batch manager features

## Google Classroom API Integration
- [x] Research Google Classroom API endpoints and OAuth2 requirements
- [x] Create database schema for Google Classroom connection settings
- [x] Build OAuth2 flow for Google account linking
- [x] Build Google Classroom API client (list courses, create assignments, sync grades)
- [x] Build sync procedures: push assignments to Classroom, pull/push grades
- [x] Build admin settings page for Google Classroom integration
- [x] Add sync controls in batch manager and assignment pages
- [x] Write vitest tests for Google Classroom integration

## Google OAuth Redirect URI Fix
- [x] Fix redirect_uri_mismatch error for Google Classroom OAuth (user needs to add URI in Google Cloud Console)

## Fix: Google Classroom OAuth callback not saving connection
- [x] Created server-side callback route /api/google-classroom/callback for reliable code exchange
- [x] Moved OAuth code exchange from frontend useEffect to server-side Express route
- [x] Added comprehensive logging for OAuth callback debugging
- [x] Added error handling with user-friendly Arabic error messages
- [x] Updated getAuthUrl to pass origin in state for correct redirect
- [x] Added ref guard to prevent double processing on frontend
- [x] Updated tests (4 passing)
- [ ] User needs to add new redirect URI in Google Cloud Console
- [ ] Save checkpoint

## Fix: redirect_uri_mismatch error 400
- [x] Determined redirect URIs in Google Cloud Console: /api/auth/callback/google
- [x] Updated server callback route to /api/auth/callback/google
- [x] Updated routers.ts getAuthUrl to use /api/auth/callback/google
- [x] Updated frontend to use /api/auth/callback/google
- [x] Updated tests (4 passing)
- [ ] Save checkpoint

## Fix: Batches not loading on Google Classroom settings page
- [x] Diagnosed: frontend calls trpc.batchManager.list but procedure is named listBatches
- [x] Fixed: changed trpc.batchManager.list to trpc.batchManager.listBatches
- [x] HMR update confirmed, no console errors
- [ ] Save checkpoint

## Internal Batch Management (replacing Google Classroom integration)
- [x] Create unique invite link for each batch with auto-permission assignment on join
- [x] Add invite link generation/management UI in batch details
- [x] Add public join page that registers user and assigns batch permissions
- [x] Implement CSV export for assignment grades (admin feature)
- [x] Remove Google Classroom OAuth UI, error messages, and blocked screens
- [x] Remove Google Classroom link from batch cards and navigation
- [x] Ensure smooth user experience with no Google OAuth remnants
- [x] Tests passing (5/5 invite-links tests)

## Enhanced Assignment Submission System
- [x] Add submission attachments schema (file uploads: PDF, Word, images)
- [x] Add rich text content field to submissions
- [x] Implement file upload endpoint using S3 storage
- [x] Create submission procedures: submit with files + rich text
- [x] Build rich text editor component (tiptap) for submission UI
- [x] Build file upload component with drag-and-drop support
- [x] Update participant assignment view with new submission form (tabs: text + files)
- [x] Allow multiple file attachments per submission (max 5 files, 10MB each)
- [x] Show submitted files and rich text in admin grading view
- [x] Write tests for submission features (15/15 passing)
- [ ] Save checkpoint

## Feature: Show attachments in admin grading view
- [x] Display submitted files (PDF, Word, images) in admin grading interface
- [x] Add file preview/download links for each attachment (image thumbnails + file icons)
- [x] Show rich text content properly formatted in grading view
- [x] Added 'عرض التسليمات' button on each assignment card
- [x] Submission detail dialog with user info, status, score, content, attachments, AI feedback
- [x] Tests passing (9/9 notifications-expiry tests)

## Feature: Auto-notifications on grading
- [x] Send in-app notification to participant when assignment is graded
- [x] Send email notification with grade details and feedback
- [x] Send in-app notification when assignment is returned for review
- [x] Send email notification for return with trainer feedback
- [x] Include grade, score, and feedback in all notifications
- [x] Graceful error handling (notification failure doesn't block grading)

## Feature: Invite link expiry and max members
- [x] Add inviteExpiresAt field to batches schema
- [x] Add maxMembers field to batches schema
- [x] Enforce expiry date check on join (getBatchByInviteCode + joinByInvite)
- [x] Enforce max members limit on join with count validation
- [x] Add expiry date and max members UI in invite link dialog
- [x] Show remaining spots and expiry info on join page
- [x] Show expired/full error messages with appropriate icons

## Bug Fix: JSON parse error on 'عرض التسليمات' button
- [x] Fix SyntaxError: "[object Object]" is not valid JSON when clicking view submissions
- [x] Root cause: Drizzle json() column returns parsed objects, not strings - JSON.parse() on object causes error
- [x] Fix: Added typeof check to handle both string and object attachment formats
- [x] 10 vitest tests passing for attachments parsing
- [x] Verified in browser: submissions dialog shows correctly with attachments
- [x] Test and save checkpoint

## Feature: Statistics Dashboard with Charts
- [x] Create backend procedure to calculate batch statistics (completion rates, averages, score distribution)
- [x] Create statistics tab/section in batch management with charts (recharts)
- [x] Show completion rate per assignment, average scores, score distribution
- [x] Show per-member progress overview with expandable cards
- [x] Show assignment details table (submissions, graded, completion, average, highest, lowest)
- [x] Show grade distribution pie chart
- [x] Show participant ranking bar chart
- [x] Write vitest tests (22 tests passing)
- [x] Test in browser - verified all charts and data display correctly

## Feature: Direct Commenting System on Submissions
- [x] Create database schema for submission comments (submissionComments table)
- [x] Create backend procedures for adding/listing comments
- [x] Add comment UI in submission detail dialog (instructor-participant conversation)
- [x] Support both instructor and participant comments with role badges
- [x] Toast notification on successful comment
- [x] Write vitest tests (22 tests passing including comments tests)
- [x] Test in browser - verified comment creation, display, and author info

## Feature: Downloadable PDF Reports for Participants
- [x] Create participant report dialog with full report layout
- [x] Include all assignments, grades, feedback, and overall statistics
- [x] Support Arabic text and RTL layout in report
- [x] Add PDF report button per participant in statistics tab
- [x] Print/PDF export via window.print() with @media print styles
- [x] Write vitest tests (22 tests passing including PDF report tests)
- [x] Test in browser - verified report dialog, content, and print button

## Feature: Email Notifications for Comments
- [x] Send email notification to participant when instructor adds a comment
- [x] Include comment text, assignment name, and batch info in email (RTL HTML template)
- [x] Graceful error handling (email failure doesn't block comment creation)
- [x] Write vitest tests (16 tests passing)
- [x] Test in browser - comment added, email attempted (SMTP credentials need user config)

## Feature: Excel Export for Batch Statistics
- [x] Create backend procedure to generate Excel file with all participants' data
- [x] Include: participant name, email, assignments, scores, grades, mastery, completion rates
- [x] Add export button in statistics tab with loading spinner
- [x] File uploaded to S3 and auto-downloaded (7KB verified)
- [x] Write vitest tests (16 tests passing)
- [x] Test in browser - Excel file generated and downloaded with correct Arabic content

## Feature: Batch Comparison Dashboard
- [x] Create backend procedure to fetch statistics for all batches
- [x] Create comparison page with bar charts comparing batch performance
- [x] Show completion rates, average scores, member counts, submissions across batches
- [x] Add detailed comparison table with ranking badges
- [x] Add navigation button from batch manager
- [x] Write vitest tests (16 tests passing)
- [x] Test in browser - all charts, table, and ranking display correctly

## Feature: AI Director Assistant Module (/visual-studio)
- [x] Script-to-Video Engine: LLM splits lesson script into 5 cinematic scenes with detailed prompts
- [x] Character Consistency Injector: Master Character Profiles (Teacher/Leader) auto-injected into every visual prompt
- [x] Video Generation API infrastructure: async loading states, image generation per scene, API connection framework
- [x] Preview Dashboard: Storyline Preview with editable scene prompts, scene navigation, camera angles, mood, duration
- [x] Export Module: merge clips into final video with AI-selected background soundtrack (genre, mood, Arabic description)
- [x] Backend procedures: createProject, generateScenes (LLM), generateSceneImage, updateScenePrompt, suggestSoundtrack, exportProject, mergeVideo
- [x] Frontend UI: tab in Visual Studio, new project form, storyline timeline, scene editor, character selector, export section
- [x] Write vitest tests (20 tests passing)
- [x] Test all features in browser - script generation, scene navigation, prompt editing, character injection all verified

## Feature: Link EduGPT to AI Director
- [x] Backend: lessonToVideoScript LLM procedure in edugpt router (line 5326)
- [x] Frontend: "Convert to Video" button in EduGPT result area with Film icon
- [x] Frontend: Video script preview dialog with scenes, mood, duration
- [x] Frontend: "Go to AI Director" button that passes script via sessionStorage
- [x] Frontend: AI Director auto-prefill from sessionStorage on mount
- [x] Frontend: URL param ?tab=director to auto-switch tab in Visual Studio
- [x] Write vitest tests (18 tests passing)
- [x] Verified code structure and API endpoint (returns UNAUTHORIZED for unauthenticated - correct)

## Feature: Arabic Text-to-Speech for Video Scripts
- [x] Research best TTS API options for Arabic - chose Web Speech API (free, built-in browser, $0 cost)
- [x] Built reusable ArabicTTS component using browser SpeechSynthesis API
- [x] Integrate TTS button in EduGPT video script preview (per-scene + full script)
- [x] Integrate TTS button in AI Director scene editor (description + voiceover section)
- [x] Per-scene TTS ('استمع للمشهد X') with purple gradient button
- [x] All-scenes TTS ('استمع لكل المشاهد') with orange/red gradient button
- [x] Voice selector with Arabic voice auto-detection (ar-SA, ar-EG, etc.)
- [x] Play/pause/stop controls with visual state indicators
- [x] Configurable rate, pitch, volume for speech
- [x] Write vitest tests (18 tests passing)
- [x] Test in browser - all TTS buttons visible and functional, no console errors

## Bug Fix: Legacy Digitizer LLM 500 Error
- [x] Fix "LLM invoke failed: 500 Internal Server Error - received bad response from upstream" in formatWithAI
- [x] Add retry logic with exponential backoff (2s, 4s, 8s) for transient upstream failures in both uploadAndOCR and formatWithAI
- [x] Add better error messages in Arabic for the user with "retry" action button in toast notifications
- [x] Add 3 new vitest tests for retry mechanism (31 total Legacy Digitizer tests passing)
- [ ] Test in browser
- [ ] Save checkpoint

## Bug Fix: pdfParse is not a function in Smart Inspector
- [x] Fix "pdfParse is not a function" error when uploading PDF in /inspector page
- [x] Updated pdf-parse v2 API: use `new PDFParse({data, verbosity})` instead of old `pdfParse(buffer)` function call
- [x] Fixed 3 files: routers.ts (evaluateFiche + extractTextFromFile), fileAnalysis.ts (analyzePDF)
- [x] Write vitest tests (9 tests passing) for PDFParse v2 API
- [x] Save checkpoint

## Feature: محلل خط اليد الذكي (Handwriting Analysis for Learning Difficulties)
- [x] Database schema: studentProfiles table (name, age, grade, gender)
- [x] Database schema: handwritingAnalyses table (imageUrl, studentId, analysisResult, scores, recommendations)
- [x] Backend: analyzeHandwriting procedure (upload image + GPT-4 Vision analysis)
- [x] Backend: getStudentHistory procedure (retrieve analysis history for a student)
- [x] Backend: getAnalysisDetails procedure (get single analysis details)
- [x] Backend: exportAnalysisPdf procedure (export report as PDF with WeasyPrint)
- [x] Frontend: /handwriting-analyzer page with professional RTL Arabic design
- [x] Frontend: Image upload step with student info form (drag & drop, camera)
- [x] Frontend: Analysis loading state with animated indicators (7 axes)
- [x] Frontend: Results dashboard (overall score circle, 7 axis progress bars, color coding)
- [x] Frontend: Disorder probability table (Dysgraphia, Dyslexia, ADHD, ASD)
- [x] Frontend: Pedagogical recommendations section (collapsible with Streamdown)
- [x] Frontend: Student history view with analysis cards
- [x] Frontend: PDF export button
- [x] Navigation: Added to EDUGPT dropdown menu and App.tsx route
- [x] Ethical disclaimer: Always shows "not a medical diagnosis" warning
- [x] Write vitest tests (18 tests passing)
- [x] Save checkpoint (version: b5f3bbf3)

## Handwriting Analyzer - 9 Improvements
### Improvement 1: رسم بياني لتتبع التقدم
- [x] Backend: getStudentProgress procedure (compare analyses over time)
- [x] Frontend: Progress chart component (line chart for 7 axes with color coding)
- [x] Frontend: Student portfolio view with timeline in History tab

### Improvement 2: تقرير مبسط للأولياء
- [x] Backend: exportParentReport procedure (simplified PDF in plain Arabic)
- [x] Frontend: Parent report button in results view
- [x] PDF: No technical terms, home activities suggestions, ethical disclaimer

### Improvement 3: قاعدة بيانات تمارين علاجية
- [x] Database: therapeuticExercises table (linked to disorder types)
- [x] Backend: getExercisesForAnalysis procedure (AI-generated per analysis)
- [x] Frontend: Exercises tab with categorized exercises and printable cards

### Improvement 4: مقارنة مع المعايير العمرية
- [x] Backend: getAgeBenchmarks procedure with scientific data for ages 5-12
- [x] Frontend: Age Benchmarks tab with comparison table and color indicators

### Improvement 5: تحليل متعدد العينات
- [x] Backend: analyzeMultipleSamples procedure (2-5 samples)
- [x] Frontend: Multi-upload UI with drag & drop for each sample type
- [x] Combined comprehensive comparison report generation

### Improvement 6: إشعار تلقائي للأخصائي
- [x] Backend: addSpecialist, getSpecialists, removeSpecialist, notifySpecialist procedures
- [x] Frontend: Specialists tab with contact management
- [x] Auto-notification when disorder probability > 70%

### Improvement 7: تحليل صوتي مرافق
- [x] Backend: analyzeVoice procedure (transcription + LLM analysis)
- [x] Frontend: Voice Analysis tab with audio upload and results display
- [x] Combined writing + reading analysis with fluency/pronunciation/speed/comprehension scores

### Improvement 8: خطة تدخل فردية (PEI)
- [x] Backend: generatePEI, getPEIs, exportPEI procedures
- [x] Frontend: PEI tab with form and AI-generated plan display
- [x] Links to previous handwriting analyses for context

### Improvement 9: لوحة إحصائيات المدير
- [x] Backend: getSchoolStats procedure (aggregated statistics)
- [x] Frontend: Dashboard tab with KPI cards, axis averages, disorder distribution table, grade distribution
- [x] Real data from all analyses

- [x] Write vitest tests for all improvements (53 tests passing)
- [x] Save checkpoint (version: c2550329)

## Bug Fix: Voice Analysis returns empty transcription and 0 scores
- [x] Fix transcription returning empty text - transcribeAudio returns error object instead of throwing, now properly checking for 'error' property
- [x] Add LLM fallback transcription using file_url when Whisper fails
- [x] Fix all scores showing 0 - now sending audio file directly to LLM analysis for comprehensive evaluation
- [x] Improved LLM prompt to analyze audio directly and give realistic scores
- [x] Added error logging for debugging
- [x] All 53 vitest tests passing
- [x] Save checkpoint (version: b8cb229e)

## Bug Fix: Parent Report and PDF Export failures
- [x] Fix exportPdf, exportParentReport, exportPEI - all used weasyprint which fails in production
- [x] Added fallback: try weasyprint first, if it fails upload HTML as printable page to S3
- [x] Fixed all 4 PDF export procedures (Inspector, Handwriting Report, Parent Report, PEI)
- [x] Added @media print and @page CSS for proper A4 printing
- [x] All 53 handwriting tests + 9 PDF parse tests passing
- [x] Save checkpoint (version: 3e98c22f)

## Improvement: Direct Print Button
- [x] Add "طباعة مباشرة" button next to PDF export button in handwriting analysis results
- [x] Add print button in voice analysis results
- [x] Add print button in PEI report results
- [x] Use handlePrintReport() with window.print() and printable HTML in a new window
- [x] Style the print view with @media print and @page CSS for A4

## Improvement: Browser Audio Recording
- [x] Add MediaRecorder API integration for direct audio recording from browser
- [x] Add recording UI with start/stop/pause buttons and timer (formatTime)
- [x] Add animated recording indicator (red pulse dot) and time display
- [x] Convert recorded audio to webm format with File object
- [x] Audio preview with <audio> controls and delete button
- [x] Integrate with existing voice analysis flow (OR divider between record/upload)

## Improvement: Automatic Email Notification for Specialists
- [x] Backend: Updated notifySpecialist to send professional HTML email via SMTP
- [x] Auto-trigger email in analyzeHandwriting when disorder probability = "high"
- [x] Email includes professional HTML template with student info, scores, disorders, and ethical disclaimer
- [x] Frontend: Shows email sent status in toast (success/warning/info based on result)
- [x] Frontend: Shows auto-notification toast when analysis detects high disorders
- [x] Write vitest tests (59 tests passing)
- [x] Save checkpoint (version: c9ebc710)

## Improvement: Student Comparison View (مقارنة بين تلميذين)
- [x] Backend: compareStudents procedure (fetch 2 students by name, compare latest analyses)
- [x] Frontend: Comparison tab with 2 student name selectors from existing students list
- [x] Frontend: Side-by-side score display (overall + 7 axes with progress bars)
- [x] Frontend: Visual comparison with color-coded better/worse indicators
- [x] Frontend: AI-generated comparison summary with Streamdown rendering

## Improvement: AI-Generated Worksheets (أوراق عمل تفاعلية)
- [x] Backend: generateWorksheet procedure (AI creates custom exercises based on weak axes + age)
- [x] Backend: getWorksheets procedure (list saved worksheets per user)
- [x] Database: handwritingWorksheets table for storing generated worksheets
- [x] Frontend: Worksheet generation UI with axis checkboxes and age selector
- [x] Frontend: Printable worksheet display with exercises (Streamdown rendering)
- [x] Frontend: Saved worksheets library with print/delete options

## Improvement: Monthly Progress Report (تقرير دوري شهري)
- [x] Backend: generateMonthlyReport procedure (aggregate all students' progress for a given month/year)
- [x] Backend: LLM-generated summary with trends and recommendations
- [x] Database: monthlyProgressReports table for storing reports
- [x] Frontend: Monthly report view with month/year selector and report display
- [x] Frontend: Email sending option via sendMonthlyReportEmail procedure
- [x] Write vitest tests for all improvements (77 tests passing)
- [x] Save checkpoint (version: 9984b655)

## Bug Fix: Deployment failure - ServiceNotHealth signal:killed (OOM)
- [x] Identify heavy dependencies causing memory overflow during build
- [x] Remove puppeteer and other unnecessary heavy packages
- [x] Optimize package.json to reduce deployment size
- [x] Save checkpoint and redeploy

## Optimization: Reduce project size for stable deployments
- [x] Remove tesseract.js (44MB, already removed in previous session)
- [x] Replace googleapis (196MB) with lighter approach (already removed in previous session)
- [x] Remove puppeteer, replace all 5 PDF generation blocks with htmlToPdf helper (WeasyPrint + HTML fallback)
- [x] Created server/lib/htmlToPdf.ts reusable helper for PDF generation
- [x] Cleaned up all puppeteer dependencies from routers.ts
- [x] Removed unused packages: sharp, alif-toolkit
- [x] Added 6 vitest tests for htmlToPdf helper (all passing)

## UI Fix: Submit buttons not fully visible in admin forms
- [x] Added max-h-[90vh] overflow-y-auto to DialogContent component globally
- [x] Added sticky DialogFooter CSS for all dialog forms
- [x] Added pb-20 padding to AdminDashboard and AdminBatchManager content areas
- [x] Added global CSS rules for page container bottom padding
- [x] Save checkpoint
- [x] Cleaned orphaned node_modules (googleapis, tesseract.js-core, mermaid, jspdf, pdfjs-dist, sharp-libvips, napi-rs/canvas)
- [x] Reduced project size from 1.3GB to ~670MB

## Optimization: lucide-react tree-shaking & bundle code-splitting
- [x] Analyzed all 114 files importing lucide-react - all use named imports (tree-shakeable)
- [x] Verified lucide-react is already tree-shaken (only 15KB / 0.3% of 6MB bundle)
- [x] Deduplicated lucide-react: removed duplicate v0.542.0 (43MB), kept v0.453.0 via pnpm override
- [x] Converted 57 page imports to React.lazy() for code-splitting (only Home & NotFound eagerly loaded)
- [x] Added Suspense with loading spinner for lazy-loaded pages
- [x] Configured Vite manualChunks to split vendors: react, ui, charts, date, mermaid, shiki, katex, markdown, icons, forms, data, animation
- [x] Main bundle reduced from 6,030KB to 253KB (96% reduction)
- [x] node_modules reduced from 821MB to 783MB
- [x] All 84 tests passing
- [x] Save checkpoint (version: 9c43e5f0)

## Feature: Link custom certificate template to Video AI course
- [x] Analyze current certificate generation system and database schema
- [x] Add English certificate content entry in certificateContent.ts (with trailing space variant)
- [x] Implement drawEnglishCertificate function with geometric background, gold accents, Leader Academy logo
- [x] Skip standard borders for English certificates (custom geometric design)
- [x] Certificate matches official template: CERTIFICAT title, OF PARTICIPATION, guillemets course title, topics, Leader Academy footer, Date
- [x] Link template to course ID 30001 ("دورة اعداد الفيديوات التعليمية بالذكاء الاصطناعي")
- [x] All 6 vitest tests passing for English certificate content
- [x] Visual verification: generated PDF matches the official .doc template
- [x] Save checkpoint (version: 2bc3d374)

## CRITICAL BUG: White page on leaderacademy.school
- [x] Diagnosed: deployed version uses old JS chunks from pre-code-splitting checkpoint
- [x] Dev server works perfectly - issue is stale deployed version
- [x] Solution: re-publish from latest checkpoint
- [x] Save checkpoint (version: c1cf616a)

## Feature: مُقيِّم المعلم الرقمي (Digital Teacher Evaluator Agent)
- [x] Analyzed existing course tools structure (EduGPT assistant pattern)
- [x] Created backend tRPC videoEvaluator.chat procedure with LLM integration
- [x] System prompt includes: evaluation criteria, Tunisian cultural context, prompt engineering feedback
- [x] Support for video/image/PDF file uploads via S3
- [x] Context fields: target audience, educational objective, original prompt
- [x] Built frontend chat UI (VideoEvaluator.tsx) with file upload, context form, quick suggestions
- [x] Added lazy-loaded route /video-evaluator in App.tsx
- [x] Added evaluator card to CourseDetail.tsx (only for digital_teacher_ai course)
- [x] Added evaluator to AI_TOOLS array in Home.tsx navigation
- [x] All 8 vitest tests passing
- [x] Server running without errors
- [x] Save checkpoint (version: 5c8b1cfa)

## CRITICAL BUG FIX: Persistent white page on leaderacademy.school (after publish)
- [x] Deep diagnosis: manualChunks causing chunk loading conflicts with manus-runtime in production
- [x] Removed manualChunks from vite.config.ts (React.lazy still provides code-splitting)
- [x] Build succeeds: main bundle 1.86MB, 532 lazy-loaded chunks
- [x] All 20 tests passing
- [x] Dev server running correctly
- [x] Save checkpoint (version: 3ccc8718) - needs re-publish

## Fix Broken Links, 404 Page, About Page & DB Cleanup
- [x] Add redirect from /certificates to /my-certificates
- [x] Add redirect from /career to /jobs
- [x] Add redirect from /management to /managerial-dashboard
- [x] Create About page in Arabic about Leader Academy vision
- [x] Create creative 404 NotFound page in Arabic with educational theme
- [x] Wire NotFound component to catch-all route (*)
- [x] Clean up test data from marketplace (Test Teacher / محتوى للاختبار) — deleted 84 items + 34 downloads + 1 rating

## SEO & Performance Optimization
- [x] Update index.html title to "Leader Academy - منصة التعليم الذكي والمساعد البيداغوجي في تونس"
- [x] Add Arabic Meta Description
- [x] Add French Meta Description
- [x] Add Open Graph tags (og:title, og:description, og:image, og:locale for ar_TN, fr_FR, en_US)
- [x] Install react-helmet-async and configure HelmetProvider
- [x] Add dynamic SEO to key pages (EduGPT, Pricing, Home, About, Marketplace, NotFound)
- [x] Configure Vite manualChunks for code splitting (React, Radix, tRPC, Lucide, Charts, Markdown)
- [x] Verify React.lazy is used for heavy pages (already in place — 60+ pages lazy loaded)
- [x] Add Google Analytics GA4 placeholder in index.html (replace GA_MEASUREMENT_ID with actual ID)

## Sitemap, OG Image & Robots.txt
- [x] Create sitemap.xml with all public pages in client/public (25 URLs)
- [x] Generate OG image 1200x630 with Leader Academy branding (AI-generated)
- [x] Update robots.txt to reference sitemap.xml
- [x] Update index.html og:image and twitter:image to use the new OG image with dimensions

## i18n System Fix & Unified Navbar
- [x] Change default language from English to Arabic (ar)
- [x] Add browser language detection (fr→French, en→English, else→Arabic)
- [x] Save language choice in localStorage for persistence
- [x] Fix missing translations: "Official Plan Test" → Arabic (updated in DB to التوزيع السنوي الرسمي)
- [x] Keep Hero Section in Arabic, add French/English subtitle translations
- [x] Keep Testimonials in Arabic across all languages
- [x] Create unified responsive Navbar component (UnifiedNavbar.tsx) with i18n support
- [x] Add EDUGPT Tools dropdown in Navbar (أدوات EDUGPT / Outils EDUGPT / EDUGPT Tools)
- [x] Ensure Navbar is mobile responsive with language switcher (flags + sections)
- [x] Integrate unified Navbar in Home.tsx (replaced inline header)

## UnifiedNavbar Integration, Testimonials Translation & Contact Page
- [x] Integrate UnifiedNavbar into EduGPT page
- [x] Integrate UnifiedNavbar into Marketplace page
- [x] Integrate UnifiedNavbar into Pricing page
- [x] Integrate UnifiedNavbar into About page
- [x] Integrate UnifiedNavbar into other internal pages (Contact already had route)
- [x] Translate Testimonials section to French
- [x] Translate Testimonials section to English
- [x] Create Contact Us page with trilingual support (ar/fr/en)
- [x] Add contact form with name, email, subject, specialty fields + FAQ + social links
- [x] Wire Contact page route in App.tsx (already existed)
- [x] Add Contact link to UnifiedNavbar
- [x] Write tests for all changes (22 tests passing)

## Advanced Features: PDF Export, Pricing Psychology, Marketplace Gamification
- [x] EDUGPT: Install qrcode library for QR code generation
- [x] EDUGPT: Use Amiri Arabic font via Google Fonts CDN in PDF template
- [x] EDUGPT: Enhanced PDF export with smart blue header + logo space + title
- [x] EDUGPT: Added footer with AI credit + Leader Academy + Tunisia flag emoji
- [x] EDUGPT: Added QR code linking to leaderacademy.school
- [x] EDUGPT: PDF export already integrated in EDUGPT assistant UI
- [x] Pricing: Changed full_bundle price from 699997 to 690000 in DB
- [x] Pricing: Added trilingual Smart Choice badge on EDUGPT PRO
- [x] Pricing: EDUGPT PRO card highlighted with blue border, shadow-xl, ring-2
- [x] Pricing: Added strikethrough old price with discount % badge
- [x] Marketplace: Added "معلم مبدع" badge for 5+ items
- [x] Marketplace: Added "خبير المادة" badge for 4.5+ rating
- [x] Marketplace: Added "نقاط الريادة" points (10/content, 5/rating)
- [x] Marketplace: Added Top Contributors leaderboard (top 5 with ranks)
- [x] Write tests for all new features (34 tests passing)

## Bug Fix: White/Blank Page on Production (leaderacademy.school)
- [x] Diagnose white page issue on production (localStorage SecurityError, GA placeholder, missing ErrorBoundary)
- [x] Fix root cause (hardened LanguageContext, added ErrorBoundary, commented GA placeholder)
- [x] Verify fix works (build succeeds, dev server renders correctly)

## Bug Fix: Persistent White Page on Production (Round 2)
- [x] Deep investigation: identified react-helmet-async incompatibility with React 19 and manualChunks conflict with manus-runtime
- [x] Removed react-helmet-async package completely (pnpm remove)
- [x] Replaced Helmet-based SEOHead with vanilla DOM manipulation (useEffect + document.title + meta tags)
- [x] Removed manualChunks from vite.config.ts (causes chunk loading conflicts with manus-runtime in production)
- [x] Updated seo-performance.test.ts (64 tests passing)
- [x] Updated i18n-navbar.test.ts (21 tests passing)
- [x] Verified build succeeds with no helmet references in output
- [x] Verified dev server renders correctly
- [ ] Republish to production and verify fix on leaderacademy.school

## Database Cleanup for Production Launch
- [x] Delete all duplicate curriculum plans (~40 copies of "التوزيع السنوي الرسمي") from curriculum_plans table
- [x] Delete all related curriculum_topics and teacher_curriculum_progress for deleted plans
- [x] Purge all grading sessions (gradingSessions) and related student submissions
- [x] Delete all duplicate marketplace items (46 copies of "جذاذة درس الأعداد ذات 5 أرقام")
- [x] Delete related marketplace_ratings and marketplace_downloads
- [x] Verify curriculum-map page shows elegant empty state (already has: icon + "لا توجد مخططات بعد" + CTA buttons)
- [x] Verify blind-grading page shows elegant empty state (already has: stats cards + "لا توجد جلسات تصحيح بعد" + CTA)
- [x] Verify marketplace page shows elegant empty state (already has: icon + "كن أول من ينشر محتوى" + CTA)

## Redesign Teacher Tools as Internal App Store
- [x] Redesign /teacher-tools page as App Store with categorized AI tool cards
- [x] Add category sections: أدوات التحضير, أدوات التقييم, أدوات الإبداع + أدوات متخصصة
- [x] Add "جديد" badge on exclusive tools (Drama Engine, Blind Grading)
- [x] Update navbar EDUGPT Tools link to point to /teacher-tools (desktop + mobile)
- [x] Verify all tool cards link to correct routes (11 tools total)
- [x] Visual verification of new design

## Animated Hover Preview for AI Tool Cards
- [x] Add animated hover effect on each tool card showing preview/demo info
- [x] Include tool screenshots or animated descriptions on hover (4-step demo preview)
- [x] Ensure smooth CSS transitions and mobile-friendly fallback

## Update Official Leader Academy Info
- [x] Update About page with official registration details (Ministry license, tax ID, commercial register)
- [x] Update Contact page with phone numbers (52339339/99997729) and WhatsApp (0021652339339)
- [x] Update Footer with official legal info and contact numbers

## Update Social Media Links
- [x] Update Facebook link to https://www.facebook.com/leaderacademy.tn (was LeaderAcademyTunisia)
- [x] Add Instagram link https://www.instagram.com/leaderacademytn/
- [x] Add YouTube link https://www.youtube.com/channel/UCEZWPqq_ONwn-CzD_GwLuVg
- [x] Update all pages: Home footer (FB+IG+YT), Contact social section (FB+IG+YT+Website)

## CRITICAL: EDUGPT Must Not Show Code/JSON
- [x] Fix EDUGPT system prompt to strictly prohibit showing any code, JSON, or technical output
- [x] Ensure all responses are purely pedagogical text formatted for teachers
- [x] Test that lesson plan responses come as readable Arabic text, not JSON blocks

## Floating WhatsApp Button
- [x] Create FloatingWhatsApp component with animated hover effect
- [x] Add to App.tsx so it appears on all pages
- [x] WhatsApp number: +216 52 339 339

## Remove Floating WhatsApp Button
- [x] Remove FloatingWhatsApp import and component from App.tsx
- [x] Delete FloatingWhatsApp.tsx component file

## Phase 1: Video Evaluator Major Overhaul
- [x] Create video_evaluations table in drizzle/schema.ts (25 columns)
- [x] Run pnpm db:push to create the table
- [x] Update backend system prompt to return structured JSON rubric (5 criteria x 20 points)
- [x] Add saveEvaluation procedure to save results to DB
- [x] Add getMyEvaluations procedure to retrieve user's evaluation history
- [x] Redesign VideoEvaluator.tsx: professional evaluation form + visual score display
- [x] Add radar chart for 5 criteria visualization (Recharts RadarChart)
- [x] Add animated score circles + progress bars for each criterion
- [x] Add evaluation history tab with detail view + stats summary + averages radar
- [x] Add re-evaluate button with auto-filled improved prompt
- [x] Test evaluation flow: 49 vitest tests passing

## Fix: Deployment Timeout (PrepareImageActivity)
- [x] Diagnose large files: found 16 PDF test artifacts (8.7MB) + font files in project root
- [x] Removed 16 PDF files from git tracking and added *.pdf to .gitignore
- [x] Uploaded fonts/logo to S3 CDN and added CDN fallback in all code references
- [x] Verified build succeeds locally (31s build time)
- [x] Save checkpoint and redeploy (version: 05189d8a)

## Homepage Redesign Phase 1: Header + Hero Section
- [x] Update global fonts to Cairo/Almarai from Google Fonts
- [x] Update CSS variables for white background + clean design system
- [x] Redesign Navigation Bar: Logo right, 4-item center menu, login/start buttons left
- [x] Redesign Hero Section: Two-column layout (text right, visual left)
- [x] Hero H1 + sub-headline + CTAs (Try Smart Tools + Watch Demo Video)
- [x] Hero visual: Professional AI/tablet mockup with floating badges (animated)
- [x] Border-radius 12px on all buttons and containers
- [x] White background (#FFFFFF) with generous padding
- [x] Update i18n-navbar tests to match new design (21/21 passing)

## Homepage Redesign Phase 2: Features Section (Smart Grid)
- [x] Redesign Features Section with 3-column grid (1-col mobile)
- [x] Light gray background (#F9FAFB) for visual depth
- [x] White card design with 16px border-radius and soft shadow
- [x] Hover effect: card lifts up with increased shadow and icon color change
- [x] 11 AI tool cards with SVG icons in brand color
- [x] "AI Powered", "جديد", "حصري", "الأكثر استخداماً" badges on tools
- [x] Equal margins and padding for visual balance
- [x] Trilingual support (AR/FR/EN) for all card content
- [x] All 21 i18n-navbar tests passing

## Homepage Redesign Phase 3: Courses Section (Professional Gallery)
- [x] Reduce displayed courses from 10 to 4 featured courses (3 showing, 4th awaiting DB entry)
- [x] Generate 4 professional AI course cover images (16:9 aspect ratio)
- [x] Upload images to S3 CDN via manus-upload-file --webdev
- [x] Redesign course cards: white bg, 16px border-radius, soft shadow with hover lift
- [x] Card header: professional image with gradient overlay on hover
- [x] Card badges: colored category tags (الأكثر طلباً, الأكثر شمولاً, فريد)
- [x] Card content: Almarai Bold title, short description, star rating, subscriber count
- [x] Action buttons: "تفاصيل الدورة" / "متابعة الدورة" with hover effects
- [x] Add "استكشف كافة الدورات" ghost button below grid
- [x] All images same 16:9 aspect ratio (object-cover)
- [x] All 21 i18n-navbar tests passing

## Add 7 Courses + Bundle Program + Admin Course Management
- [x] Read DB schema - added price, coverImageUrl, descriptionShortAr, isBundle, bundleCourseIds, axes, schedule, isFeatured, sortOrder, originalPrice fields
- [x] Generate 8 professional course cover images (7 courses + 1 bundle)
- [x] Upload images to S3 CDN
- [x] Add 7 independent courses to DB with topics, pricing, hours, descriptions
- [x] Add 1 bundle program (7-in-1) with special pricing (930→350 د.ت)
- [x] Update homepage to show new courses (featured courses with images)
- [x] Improve admin dashboard: comprehensive course management with 4-tab form (Basic, Pricing, Content/Axes, Display)
- [x] Admin: cover image URL field with live preview
- [x] Admin: manage course topics/axes (add/remove with drag handles)
- [x] Admin: set pricing (original + discounted) with discount calculator
- [x] Admin: bundle management (select courses, show total value)
- [x] Admin: featured/sort order/schedule controls
- [x] Admin: stats summary (active courses, bundles, featured, total revenue)
- [x] Admin: filter by category + show inactive toggle
- [x] Updated routers.ts create/update procedures with all new fields
- [x] 941/953 tests passing (12 pre-existing failures unrelated to our changes)

## Feature: Direct Image Upload in Admin Course Management
- [x] Add file upload tRPC procedure (accept image, upload to S3, return URL)
- [x] Update ManageCourses.tsx: replace URL input with drag-and-drop image uploader
- [x] Show upload progress and preview
- [x] Validate file type (images only) and size limit

## Feature: Professional Course Detail Page
- [x] Create CourseDetail.tsx page component
- [x] Add route /courses/:id in App.tsx
- [x] Display course cover image, title, description, axes/topics list
- [x] Show pricing with discount badge
- [x] Add enrollment CTA button
- [x] Show schedule and duration info
- [x] Bundle page: show included courses list with individual prices

## Feature: Redesign Testimonials + Footer
- [x] Redesign testimonials section with modern card layout (3 cards, quote icons, star ratings, tool badges, trust bar)
- [x] Redesign footer with 4-column layout (brand+social, quick links, AI tools, contact info)
- [x] Bottom bar with copyright, commercial register, "Made in Tunisia" badge
- [x] Ensure RTL consistency and responsive design

## Feature: Real Participant Reviews System
- [x] Create reviews table in database schema (userId, courseId, rating, comment, createdAt)
- [x] Push database migration
- [x] Add tRPC procedures: submitReview, getReviewsByCourse, getLatestReviews, deleteReview (featured)
- [x] Build review submission form in course detail page (star rating + comment)
- [x] Display reviews list in course detail page
- [x] Replace static testimonials on homepage with real reviews from database (with static fallback)
- [x] Add average rating calculation per course
- [x] Prevent duplicate reviews (one review per user per course)
- [x] Admin: ability to moderate/delete reviews

## Feature: Direct Enrollment Form with Payment
- [x] Create enrollment form dialog in course detail page
- [x] Payment method selection (bank transfer, D17, Flouci, cash)
- [x] Receipt image upload with preview
- [x] Show enrollment confirmation with payment instructions
- [x] Course summary with price in dialog header
- [x] Free courses: direct enrollment without payment form

## Feature: Similar Courses Section
- [x] Add similar courses section at bottom of course detail page
- [x] Query courses in same category, fill with other courses if needed
- [x] Display up to 4 course cards with cover images, titles, prices, and duration
- [x] Link to respective course detail pages

## Bug Fix: Broken Links and 404 Pages
- [x] Fix /courses route showing 404 - created Courses.tsx page with full course listing, search, category filters
- [x] Audit all routes defined in App.tsx (60+ routes verified)
- [x] Audit all links/hrefs in Home.tsx and navigation components - all match routes
- [x] No other broken links found - all footer, navbar, and CTA links verified
- [x] Test all links work correctly - /courses, /teacher-tools, /courses/:id all verified

## Feature: Testimonials Section Redesign - Trust Wall
- [x] White background (#FFFFFF) for visual separation
- [x] 3-column grid layout with responsive breakpoints
- [x] Floating cards with 20px border-radius and deep soft shadow
- [x] Quote icon in card corner (elegant design)
- [x] Almarai font 16px for testimonial text with comfortable padding
- [x] Circular avatar (60px diameter) with teacher profile
- [x] Bold name + gray job title next to avatar
- [x] 5 golden star ratings below each testimonial
- [x] Hover effect: border color change + slight card elevation
- [x] RTL/LTR compatibility for all 3 languages
- [x] Dynamic reviews from database with static fallback
- [x] Tool badges (EDUGPT, التصحيح الأعمى, الدورات التدريبية) with sparkle icons
- [x] Trust bar with 4 stats (+5000, 4.9/5, 98%, 12)
- [x] Fixed newsletter 500 to 5000 for consistency

## Feature: Hybrid Testimonials with Real Course Photos
- [x] Upload 7 course photos to S3 CDN
- [x] Redesign testimonial cards with course photo at top (3:2 aspect ratio)
- [x] White background (#FFFFFF) with 3-column grid
- [x] Cards with 20px border-radius and soft shadow (floating effect)
- [x] Quote icon + Almarai 16px text for testimonial
- [x] 5 golden stars below testimonial text
- [x] Circular avatar (60px) overlapping card frame elegantly
- [x] Name (bold) + job title (gray) next to avatar
- [x] Hover effect: image zoom-in + card elevation
- [x] RTL/LTR compatibility for 3 languages
- [x] Dynamic reviews from DB with static fallback using real photos
- [x] Photo gallery section with 4 individual teacher photos
- [x] Trust bar with 4 stats (+5000, 4.9/5, 98%, 12)

## Feature: Premium Dark Footer Redesign
- [x] Dark background with brand deep colors for strong contrast
- [x] 4-column layout: Brand, Quick Links, Support, Newsletter
- [x] Column 1: Light logo + platform description
- [x] Column 2: Quick links (Home, Tools, Courses, FAQ)
- [x] Column 3: Support links (Contact, Privacy, Terms)
- [x] Column 4: Newsletter subscription with elegant input + submit button
- [x] Social media bar (Facebook, YouTube, LinkedIn, Instagram) with official links
- [x] 'Made with AI in Tunisia' badge in corner
- [x] Fully responsive (columns to rows on mobile)
- [x] Almarai font throughout with proportional sizes
- [x] Generous padding for premium feel
- [x] Decorative gradient background with subtle glow effects
- [x] Orange accent line at top of footer
- [x] Colored accent bars for column headers (orange, blue, yellow)
- [x] WhatsApp CTA button in social proof bar
- [x] Social proof stats bar (+5000 teachers, 4.9/5 rating, 12 programs)
- [x] Privacy trust badge with shield icon in newsletter section
- [x] Hover animations on social icons and links
- [x] Copyright with commercial register number
- [x] leaderacademy.school link in bottom bar

## Feature: Unified Tool Page Template (Single Tool Page)
- [x] Create UnifiedToolLayout component with split-screen design
- [x] Right panel: Clean input form (title, level, subject) with RTL support
- [x] Left panel: AI-generated results display area
- [x] Smart Loader with animated rotating status messages during generation
- [x] Floating Action Bar: Copy text, Download PDF/Word, Regenerate button
- [x] Paper-like results container with clear headings and auto-colored titles
- [x] Inline editing capability for results before saving
- [x] Very light background for work area to reduce distraction
- [x] Responsive design (stacked on mobile, split on desktop)
- [x] Apply template to all 11 AI tools (10 tools + EduGPT chat kept as-is)
- [x] Tool 1: تحضير الدروس الفوري (Lesson Prep) — ToolPageHeader
- [x] Tool 2: بنك التقييمات الذكي (Exam Builder) — UnifiedToolLayout
- [x] Tool 3: المتفقد الذكي (AI Inspector) — UnifiedToolLayout
- [x] Tool 4: استوديو الصور التعليمية (Visual Studio) — ToolPageHeader
- [x] Tool 5: مساعد التصحيح الأعمى (Blind Grading) — ToolPageHeader
- [x] Tool 6: خريطة المنهج الذكية (Curriculum Map) — UnifiedToolLayout
- [x] Tool 7: رقمنة الوثائق التعليمية (Document Digitizer) — ToolPageHeader
- [x] Tool 8: محرك الدراما التعليمية (Drama Engine) — ToolPageHeader
- [x] Tool 9: محلل خط اليد الذكي (Handwriting Analyzer) — ToolPageHeader
- [x] Tool 10: التوزيع السنوي الذكي (Annual Plan) — UnifiedToolLayout
- [x] Tool 11: مُقيِّم الفيديو التعليمي (Video Evaluator) — ToolPageHeader
- [x] Created reusable ToolPageHeader component for complex multi-view tools
- [x] EduGPT Assistant kept with original chat UI (not applicable for tool layout)

## Fix: Bidirectional Text (BiDi) in Chat Interface
- [x] Add dir='auto' to chat bubbles and input field
- [x] Replace text-align:right with text-align:start
- [x] Dynamic bubble tail and avatar positioning based on text direction
- [x] Input field: send/attachment icons adapt to text direction
- [x] Typography fallback: Inter font for English text alongside Almarai

## Fix: Strict Language Consistency Across All Pages
- [ ] Analyze current i18n/language system and identify all hardcoded strings
- [ ] Ensure ALL UI elements follow the selected language (no mixing AR/FR/EN)
- [ ] Fix EduGPT sidebar labels (Conversations, Nouveau, Rechercher, tags)
- [ ] Fix EduGPT quick action buttons (تحضير جذاذة, إنشاء اختبار, سيناريو دراما)
- [ ] Fix EduGPT welcome screen text and description
- [ ] Fix EduGPT input placeholder
- [ ] Fix navigation bar labels
- [ ] Fix tool page headers and descriptions
- [ ] Fix footer text and links
- [ ] Fix all other hardcoded Arabic strings in FR/EN mode

## Full Multilingual Translation: All 11 Tool Pages (Internal Content)
- [x] Create centralized toolTranslations.ts with common + tool-specific strings (DONE - 684 lines)
- [x] Translate ExamBuilder.tsx (labels, buttons, toasts, dropdowns, placeholders)
- [ ] Translate Inspector.tsx
- [ ] Translate AnnualPlanGenerator.tsx
- [ ] Translate CurriculumMap.tsx
- [ ] Translate LessonSheetFromPlan.tsx
- [ ] Translate BlindGrading.tsx
- [ ] Translate LeaderVisualStudio.tsx
- [ ] Translate DramaEngine.tsx
- [ ] Translate VideoEvaluator.tsx
- [ ] Translate HandwritingAnalyzer.tsx
- [ ] Translate LegacyDigitizer.tsx
- [ ] Translate UnifiedToolLayout loader messages (multilingual)
- [ ] Translate shared components (LockedFeature, PrintPreview, etc.)
- [ ] Verify build and run tests
- [ ] Save checkpoint

## Prompt Engineering Lab (أداة هندسة الأوامر) - مجانية
- [x] Create PromptLab.tsx page with 4 tabs (Library, Optimizer, Templates, Tips)
- [x] Build prompt library with categories (video, exams, lessons, drama, analysis, general)
- [x] Build smart prompt optimizer (LLM-powered) backend procedure
- [x] Build interactive templates with fill-in-the-blanks
- [x] Build tips & golden rules section
- [x] Register route in App.tsx (public - no login required)
- [x] Add navigation entry on Home page
- [x] Add full multilingual translations (AR/FR/EN)
- [x] Make it fully accessible without login (publicProcedure)

## Bug Fix: DramaEngine DRAMA_GRADIENT not defined
- [x] Fix ReferenceError: DRAMA_GRADIENT is not defined in DramaEngine.tsx

## Bug Fix: Inspector page input panel empty
- [x] Fix Inspector.tsx - input panel shows no tabs/fields/buttons (UnifiedToolLayout children support added)

## Bug Fix: Inspector file upload - invalid_type errors
- [x] Fix base64Data, mimeType, fileName undefined when uploading PDF in Inspector (frontend sent wrong field names)

## Comprehensive Technical Audit - All Pages
- [x] Audit Home page (/) - OK
- [x] Audit EduGPT page (/edugpt) - OK
- [x] Audit ExamBuilder (/exam-builder) - OK
- [x] Audit Inspector (/inspector) - Fixed file upload + children support
- [x] Audit AnnualPlanGenerator (/annual-plan) - Fixed toolConfig→config
- [x] Audit CurriculumMap (/curriculum-map) - Fixed Label import + nested button
- [x] Audit LessonSheetFromPlan (/lesson-sheet) - OK
- [x] Audit BlindGrading (/blind-grading) - Fixed optional chaining _count
- [x] Audit LeaderVisualStudio (/visual-studio) - OK (requires auth)
- [x] Audit DramaEngine (/drama-engine) - OK (DRAMA_GRADIENT fixed)
- [x] Audit VideoEvaluator (/video-evaluator) - Fixed getHistory→getMyEvaluations
- [x] Audit HandwritingAnalyzer (/handwriting) - OK (requires auth)
- [x] Audit LegacyDigitizer (/legacy-digitizer) - OK (requires auth)
- [x] Audit PromptLab (/prompt-lab) - OK
- [x] Audit Assistant (/assistant) - Fixed 't' variable shadowing + tag translations
- [x] Audit LessonBank (/lesson-bank) - OK
- [x] Audit Courses (/courses) - OK
- [x] Audit About (/about) - OK
- [x] Fix all discovered errors (9 bugs fixed across 7 files)

## Bug Fix: Inspector PDF text extraction says "unreadable" for clear PDFs
- [x] Diagnose why PDF text extraction returns garbled/encoded text (Arabic fonts cause garbled pdftotext)
- [x] Fix the extractTextFromFile procedure - now uses LLM file_url instead of pdf-parse
- [x] Test with vitest (3/3 passed)

## Bug Fix: Inspector text input not editable
- [x] Fix textarea not accepting input when 'نص' tab is selected (removed disabled={!canAnalyze})

## Admin Dashboard - لوحة تحكم المدير
### Database Schema
- [ ] Create adminSettings table (key-value store for global settings)
- [ ] Create usageLimits table (per-tier limits for each tool)
- [ ] Create usageTracking table (track per-user usage per tool per month)
- [ ] Push database migrations

### Backend Procedures
- [ ] Admin settings CRUD (get/update global settings)
- [ ] Usage limits CRUD (get/update per-tier limits)
- [ ] User management (list, update role/tier, ban/unban)
- [ ] Statistics queries (active users, daily/monthly ops, tool usage)
- [ ] Usage checking middleware (check limits before tool execution)

### Admin Dashboard UI
- [ ] Dashboard overview page with key statistics
- [ ] Usage limits management panel
- [ ] User management panel (list, search, edit, ban)
- [ ] Subscription tiers management panel
- [ ] Content & messages management panel
- [ ] Tool enable/disable management panel

### Integration
- [ ] Enforce usage limits in all 11 tools dynamically
- [ ] Update image generation limit from hardcoded to admin-controlled
- [ ] Show dynamic limit messages based on admin settings

### Route & Navigation
- [ ] Register /admin route in App.tsx
- [ ] Add admin link in navigation (visible only to admin)

## لوحة التحكم الشاملة V2 (Admin Control Panel)
- [x] إنشاء جداول قاعدة البيانات الجديدة (admin_settings, tool_configurations, tool_usage_tracking, platform_messages)
- [x] إضافة نوع "system" لجدول الإشعارات
- [x] بناء Backend Router شامل (adminControl) مع أكثر من 20 endpoint
- [x] قسم نظرة عامة - إحصائيات + رسوم بيانية (AreaChart, PieChart, BarChart)
- [x] قسم حدود الاستخدام - إدارة الأدوات وتهيئتها وتعديل حدود كل مستوى
- [x] قسم إدارة المستخدمين - بحث متقدم، فلترة، حظر/إلغاء حظر، تعديل أدوار، تفاصيل
- [x] قسم الاشتراكات - خطط الأسعار + إحصائيات + توزيع المستويات
- [x] قسم المحتوى والرسائل - رسائل المنصة + إعدادات عامة + إرسال إشعارات
- [x] تسجيل المسار /admin-control في App.tsx
- [x] كتابة اختبارات Vitest (20 اختبار - جميعها ناجحة)
- [x] إصلاح مشكلة GROUP BY في MySQL (only_full_group_by)
- [x] حفظ checkpoint

## فصل قائمة الإدارة عن قائمة "المزيد"
- [x] قراءة هيكل التنقل الحالي وتحديد روابط الإدارة
- [x] إنشاء قائمة منفصلة للإدارة في شريط التنقل
- [x] إضافة رابط لوحة التحكم الشاملة في القائمة الجديدة
- [x] اختبار وحفظ checkpoint

## تغيير "التصحيح الأعمى" إلى "التصحيح الذكي"
- [x] البحث عن كل ظهور لـ "التصحيح الأعمى" و"Correction aveugle" و"Blind Grading" واستبدالها
- [x] التحقق من عدم وجود أي ظهور متبقي

## إضافة قسم إدارة الصفحات في لوحة التحكم الشاملة
- [x] إنشاء جدول page_configurations في قاعدة البيانات
- [x] بناء Backend API لعمليات CRUD على الصفحات
- [x] إضافة قسم "إدارة الصفحات" في واجهة لوحة التحكم الشاملة
- [x] ربط إعدادات الإخفاء/الإظهار بالتنقل والمسارات
- [x] اختبار وحفظ checkpoint

## إضافة محرر محتوى مرئي WYSIWYG للصفحات المخصصة
- [x] تثبيت مكتبة Tiptap وإضافاتها
- [x] بناء مكوّن المحرر المرئي مع شريط أدوات كامل ودعم RTL
- [x] دمج المحرر في نوافذ إضافة/تعديل الصفحات في لوحة التحكم
- [x] إنشاء صفحة عرض المحتوى المخصص للزوار
- [x] اختبار وحفظ checkpoint

## صفحة مستقلة لأدوات مرافقة ذوي صعوبات التعلم
- [x] قراءة هيكل التنقل والأدوات الحالية
- [x] إنشاء صفحة LearningDifficultiesTools.tsx بتصميم مميز
- [x] نقل أداة محلل خط اليد من BONUS_TOOLS إلى الصفحة الجديدة
- [x] تجهيز بنية لاستقبال الأدوات القادمة (قريباً)
- [x] إضافة مسار في App.tsx
- [x] إضافة رابط في شريط التنقل الرئيسي
- [x] اختبار وحفظ checkpoint

## أداة المرافق البيداغوجي الخاص
- [x] قراءة هيكل الكود الحالي (schema, routers, subscription)
- [x] تصميم جداول قاعدة البيانات (ملفات التلاميذ، خطط المرافقة)
- [x] بناء Backend مع تكامل LLM لتوليد خطط المرافقة
- [x] بناء واجهة الأداة (نموذج متعدد الخطوات + عرض النتائج)
- [x] ربط صفحة أدوات ذوي الصعوبات بنظام الاشتراكات (مجاني/Pro)
- [x] اختبار وحفظ checkpoint

## أداة مكيّف المحتوى التعليمي
- [x] قراءة هيكل الكود الحالي والتخطيط
- [x] إنشاء جدول adapted_content في قاعدة البيانات
- [x] بناء Backend Router مع تكامل LLM لتكييف المحتوى
- [x] بناء واجهة الأداة (إدخال الدرس + عرض المحتوى المكيّف)
- [x] ربط الأداة بصفحة أدوات ذوي الصعوبات وتفعيلها
- [x] إضافة الأداة في DEFAULT_TOOLS في adminControl
- [x] اختبار وحفظ checkpoint

## أداة مولّد التمارين العلاجية
- [x] قراءة هيكل الكود الحالي والتخطيط
- [x] إنشاء جدول therapeutic_exercises في قاعدة البيانات
- [x] بناء Backend Router مع تكامل LLM لتوليد التمارين
- [x] بناء واجهة الأداة (اختيار نوع الاضطراب + المستوى + عرض التمارين)
- [x] ربط الأداة بصفحة أدوات ذوي الصعوبات وتفعيلها
- [x] إضافة الأداة في DEFAULT_TOOLS في adminControl
- [x] اختبار وحفظ checkpoint

## أداة تقرير المتابعة الفردي
- [x] قراءة هيكل الكود الحالي والتخطيط
- [x] إنشاء جدول follow_up_reports في قاعدة البيانات
- [x] بناء Backend Router مع تكامل LLM لتوليد التقارير
- [x] بناء واجهة الأداة (نموذج إدخال + عرض التقرير مع رسوم بيانية)
- [x] ربط الأداة بصفحة أدوات ذوي الصعوبات وتفعيلها
- [x] إضافة الأداة في DEFAULT_TOOLS في adminControl
- [x] اختبار وحفظ checkpoint

## أداة مقيّم التقدم
- [x] إنشاء جدول progress_evaluations في قاعدة البيانات
- [x] بناء Backend Router مع تحليل البيانات وLLM
- [x] بناء واجهة الأداة (تحليل زمني + رسوم بيانية + توصيات)
- [x] ربط الأداة بصفحة أدوات ذوي الصعوبات وتفعيلها
- [x] إضافة الأداة في DEFAULT_TOOLS في adminControl
- [x] اختبار وحفظ checkpoint


#### تصدير التقارير كـ PDF
- [x] إنشاء helper لتوليد PDF احترافي بالعربية
- [x] إضافة endpoint exportPdf في followUpReports router
- [x] إضافة endpoint exportPdf في progressEvaluator router
- [x] إضافة زر تحميل PDF في واجهة تقرير المتابعة
- [x] إضافة زر تحميل PDF في واجهة مقيّم التقدم
## ربط الأدوات ببعضها
- [x] إنشاء endpoint لجلب التمارين العلاجية المنجزة لتلميذ معين
- [x] إضافة خيار استيراد بيانات التمارين تلقائياً في مقيّم التقدم
## لوحة متابعة شاملة
- [x] إنشاء backend router للوحة متابعة التلاميذ
- [x] إنشاء واجهة لوحة المتابعة مع رسوم بيانية
- [x] تسجيل المسار في App.tsx
- [x] إضافة الأداة في صفحة أدوات ذوي الصعوبات
- [x] إضافة الأداة في DEFAULT_TOOLS في adminControl
- [x] اختبار وحفظ checkpoint

## أداة Répartition Journalière (التوزيع اليومي للغة الفرنسية)
- [x] تحليل النموذج المرجعي وتخطيط الهيكل
- [x] إنشاء جدول repartition_journaliere في قاعدة البيانات
- [x] بناء Backend Router مع تكامل LLM لتوليد المحتوى
- [x] بناء واجهة الأداة (نموذج إدخال + عرض الجدول بالفرنسية LTR)
- [x] إضافة تصدير PDF/DOCX للتوزيع اليومي
- [x] تسجيل المسار في App.tsx
- [x] إضافة الأداة في صفحة أدوات المعلم
- [x] إضافة الأداة في DEFAULT_TOOLS في adminControl
- [x] اختبار وحفظ checkpoint

## تحديث أداة Répartition Journalière - الالتزام الحرفي بالمنهج التونسي
- [x] تحديث LLM prompt لفرض الهيكل البيداغوجي الرسمي بالضبط
- [x] تحديث بنية JSON المتوقعة من LLM (3 أنشطة إلزامية مع مراحل محددة)
- [x] تحديث الواجهة لعرض جدول من 5 أعمدة بشكل صحيح
- [x] ضمان توليد المحتوى بالفرنسية السليمة مع المصطلحات التونسية
- [x] اختبار وحفظ checkpoint

## قاعدة بيانات المحتوى المرجعي (Répartition Journalière)
- [x] تحليل الهيكل الحالي وتصميم جدول المحتوى المرجعي
- [x] إنشاء جدول reference_content في قاعدة البيانات
- [x] بناء Backend Router مع عمليات CRUD
- [x] إنشاء بيانات أولية (seed data) للوحدة 1 والوحدة 2
- [x] بناء واجهة إدارة المحتوى المرجعي (admin)
- [x] ربط المحتوى المرجعي بأداة Répartition Journalière
- [x] تسجيل المسارات في App.tsx
- [x] كتابة اختبارات والتحقق
- [x] حفظ checkpoint

## المرحلة 1: نظام الأدوار (RBAC)
- [x] تحليل نظام المصادقة الحالي وهيكل الأدوار
- [x] توسيع enum الأدوار في schema (teacher, school, admin, user)
- [x] إنشاء middleware محمي لكل دور (teacherProcedure, schoolProcedure, adminProcedure)
- [ ] بناء صفحة اختيار نوع الحساب للمستخدمين الجدد
- [ ] بناء لوحة تحكم المدرسة الشريكة (School Dashboard)
- [ ] تحديث لوحة المعلم وتوجيه المسارات حسب الدور
- [ ] تحديث لوحة Admin مع إدارة أدوار المستخدمين
- [ ] كتابة اختبارات وحفظ checkpoint

## RBAC Phase 1: Role-Based Access Control
- [x] Expand role enum in database schema (teacher, school roles already exist)
- [x] Create middleware procedures (teacherProcedure, schoolProcedure, staffProcedure, teacherOrSchoolProcedure) - already existed
- [x] Add profile.selectRole endpoint for new users to choose their role
- [x] Add profile.getMyProfile endpoint for fetching full user profile
- [x] Build RoleSelection page with teacher/school choice and confirmation flow
- [x] Create TeacherDashboard with tier system, points, quick tools, career tab, achievements
- [x] Create SchoolDashboard with job management, applications, talent discovery
- [x] Add role-based navigation links in UnifiedNavbar (desktop + mobile)
- [x] Show "Choose your role" prompt for users with default 'user' role
- [x] Show teacher dashboard link for teacher role
- [x] Show school dashboard link for school role
- [x] Write vitest tests for RBAC logic (20 tests passing)
- [x] Register new routes in App.tsx (/select-role, /teacher-dashboard, /school-dashboard)
- [x] Save checkpoint

## الخطوة الثانية: ربط لوحات التحكم ببيانات حقيقية + إشعارات + توجيه تلقائي
- [x] إنشاء endpoints خلفية لإحصائيات لوحة تحكم المعلم (نقاط، مستوى، أنشطة)
- [x] إنشاء endpoints خلفية لإحصائيات لوحة تحكم المدرسة (وظائف، طلبات، معلمين)
- [x] ربط TeacherDashboard بالبيانات الحقيقية من قاعدة البيانات
- [x] ربط SchoolDashboard بالبيانات الحقيقية من قاعدة البيانات
- [x] إضافة نظام إشعارات حسب الدور (معلم/مدرسة)
- [x] تفعيل التوجيه التلقائي للمستخدمين الجدد لصفحة اختيار الدور
- [x] كتابة اختبارات والتحقق (19 اختبار - نجحت جميعها)
- [x] حفظ checkpoint (version: 0ca07d8d)

## تعزيز نظام المطابقة الذكي بمعايير إضافية
- [x] تحليل نظام المطابقة الحالي وتحديد نقاط التحسين
- [x] إضافة معايير جديدة: الخبرة، المنطقة، التخصص، الشهادات، التوفر
- [x] إنشاء خوارزمية تسجيل مرجّحة (weighted scoring) متعددة المعايير
- [x] تحديث schema الملف المهني للمعلم لبيانات أغنى
- [x] تحديث نموذج نشر الوظائف لتشمل متطلبات تفصيلية
- [x] إنشاء واجهة نتائج المطابقة المحسّنة مع تفصيل النقاط
- [x] كتابة اختبارات vitest للخوارزمية الجديدة (17 اختبار - نجحت جميعها)
- [x] حفظ checkpoint (version: cb9f06be)

## إصلاح أخطاء
- [x] إصلاح مشكلة عرض صفحة المساعد التعليمي الذكي (شريط أزرق في الأعلى وعرض غير مكتمل على الجوال)

## تحسينات المساعد التعليمي الذكي
- [x] إضافة زر "محادثة جديدة" في رأس نافذة المساعد
- [x] إضافة اقتراحات سريعة (Quick prompts) أسفل رسالة الترحيب

## تفعيل PWA (تطبيق ويب تقدمي)
- [x] إنشاء ملف manifest.json مع بيانات التطبيق
- [x] إنشاء أيقونات التطبيق بأحجام متعددة (10 أيقونات + maskable)
- [x] إنشاء Service Worker للتخزين المؤقت والعمل بدون إنترنت
- [x] تسجيل Service Worker في التطبيق
- [x] إضافة زر/نافذة تثبيت التطبيق (Install Prompt + دليل iOS)
- [x] إضافة meta tags للتوافق مع iOS (Apple Touch Icon 180x180)
- [x] اختبار والتحقق من PWA (25 اختبار - نجحت جميعها)
- [x] حفظ checkpoint (version: 2a24b7c0)

## تحديث الشعار الرسمي لـ Leader Academy
- [x] استخراج الشعار من ملف PDF
- [x] إنشاء أيقونات PWA بأحجام متعددة من الشعار الجديد (10 أحجام + favicon)
- [x] تحديث الشعار في الـ navbar وجميع الصفحات (Navbar, Home, SmartInspector, SEOHead)
- [x] تحديث الـ favicon (16x16, 32x32, ICO)
- [x] تحديث manifest.json بالأيقونات الجديدة
- [ ] حفظ checkpoint (جاري)
