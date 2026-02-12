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
