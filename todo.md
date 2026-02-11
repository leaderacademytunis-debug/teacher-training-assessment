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
