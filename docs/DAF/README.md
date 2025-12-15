# Dossier d'Architecture Fonctionnelle (DAF)

## 1. Objectifs et contexte
FitDesk est une plateforme CRM spécialisée pour les équipes de coaching sportif et nutritionnel. Elle vise à:
- **Unifier l'entonnoir prospects → clients → athlètes** en consolidant les statuts commerciaux, les préférences d'activité et les liens coach/athlète décrits dans les releases 0.6.x du produit.
- **Orchestrer la fabrication de programmes d'entraînement et de plans nutritionnels** en réutilisant les bibliothèques d'exercices, de séances et de repas partagées entre frontoffice (coach/athlète) et backoffice (opérations).
- **Offrir une expérience cohérente sur tous les canaux** (backoffice administrateur, frontoffice coach/athlète, PWA mobile, showcase public) avec des traductions FR/EN et une navigation alignée.

Parties prenantes clés:
- **Direction produit** (FitDesk SAS) : garantit l'alignement stratégique et la conformité (RGPD, sécurité). Attente principale: time-to-market rapide avec une dette maîtrisée.
- **Équipes commerciales & Customer Success** (utilisateurs backoffice) : souhaitent tracer prospects/clients, qualifier leurs objectifs et orchestrer l'onboarding.
- **Coachs et préparateurs** (frontoffice) : recherchent des outils rapides pour construire, partager et suivre des programmes/menus.
- **Athlètes** (frontoffice & mobile) : consultent les programmes, rapportent leur progression et collaborent avec les coachs.
- **Équipe technique** : doit livrer une architecture hexagonale testable et scalable.

## 2. Périmètre fonctionnel
| Domaine | Capacités couvertes | Limitations actuelles |
| --- | --- | --- |
| **Gestion prospects/clients** | Création, qualification (statut, niveau, source), suivi des préférences, budget, objectifs, historique. | Pas encore de scoring automatique ni d'intégration CRM externe.
| **Relations coach ↔ athlète** | Création/édition des liaisons, dates d'effet, statut actif/inactif, notes contextuelles partagées entre front/back office. | Pas de multi-coaching (un athlète rattaché à un coach unique par relation).
| **Fiches info athlète** | Données spécifiques aux athlètes (niveau, objectifs, préférences d'activité, conditions médicales, allergies, notes) issues du référentiel prospects. | Un seul enregistrement par athlète, en lecture/écriture via l'API GraphQL.
| **Programmes & bibliothèque d'exercices** | CRUD complet sur programmes, séances, exercices, catégories, muscles, tags, équipements, visibilité privée/publique. | Pas de moteur d'entraînement temps-réel ni d'intégration capteurs.
| **Nutrition** | Gestion des plans, jours, repas, aliments, macros, icônes de type de repas, visibilité. | Pas de synchronisation automatique avec applis tierces (MyFitnessPal, wearables).
| **Profils & authentification** | Connexion, snapshot de session, changement de langue, visualisation du token actif. | MFA et SSO non implémentés.
| **Showcase** | Publication des notes de version multilingues pour les parties prenantes externes. | Pas de génération automatique depuis CI/CD.

Hors périmètre immédiat: facturation, analytics en temps réel, marketplace partenaires, support intégré.

## 3. Personae et parcours utilisateurs
### Coach principal (frontoffice + mobile)
- **Objectifs**: transformer un prospect, attribuer un programme, suivre l'adhésion.
- **Parcours clé**:
  1. Consulte le module Prospects, filtre par statut.
  2. Crée/édite la fiche prospect (objectifs, préférences, budget).
  3. Passe l'état du prospect à « converti » puis crée le lien Athlète ↔ Coach.
  4. Construit un programme (sessions, exercices) et le partage.
  5. Suit les retours via la section Athlètes.
- **Irritants adressés**: double saisie entre outils, perte de contexte sur les objectifs, manque de visibilité sur la disponibilité des contenus.

### Responsable Customer Success (backoffice)
- **Objectifs**: piloter la qualité des données, déployer les modèles (exercices, repas), contrôler la visibilité.
- **Parcours**:
  1. Paramètre les bibliothèques (exercices, nutriments, tags) dans le backoffice.
  2. Ouvre la fiche d'un prospect, enrichit les champs commerciaux.
  3. Suivi des relations coach/athlète pour assurer la charge adéquate.
  4. Publie des programmes/menus en visibilité publique lorsque validés.
- **Irritants traités**: manque d'audit, absence de référentiel unique.

### Athlète
- **Objectifs**: recevoir des programmes personnalisés, comprendre les consignes, partager du feedback.
- **Parcours**:
  1. Reçoit une invitation et active son compte (via frontoffice ou mobile PWA).
  2. Consulte l'onglet « My programs » et parcourt les séances.
  3. Visualise les consignes détaillées (exercices, répétitions, nutrition).
  4. (Future) Remonte des notes ou un statut d'achèvement.
- **Irritants adressés**: dispersion des contenus, manque de contexte nutritionnel.

### Administrateur plateforme
- **Objectifs**: garantir la conformité (RGPD), superviser les environnements, diffuser les releases.
- **Parcours**: utilise le backoffice pour vérifier les comptes, l'API pour audits et le showcase pour communiquer aux partenaires.

## 4. Règles métier et cas d'usage
- **Hiérarchie des statuts**: `Prospect → Client actif → Client perdu`. La transition ne peut se faire qu'en suivant les étapes (pas de retour direct de perdu à actif sans recréation). _Cas d'usage: "Conversion prospect" — valider que budget et objectifs sont remplis avant de permettre l'attribution d'un coach._
- **Lien coach/athlète**: une relation active doit comporter une date de début, une visibilité (privée par défaut) et un statut. Les suppressions sont logiques (soft delete) pour préserver l'historique.
- **Visibilité des contenus**: `private` limite l'accès à l'équipe propriétaire; `public` les expose dans les catalogues frontoffice/backoffice. Toute publication requiert un créateur identifié et une vérification de complétude (sessions ≥1, exercices ≥1).
- **Nutrition**: un plan contient `n` jours, chaque jour `m` repas, et chaque repas référence des aliments ou macros. Les champs calories/macros doivent rester cohérents (somme des aliments = macros du repas).
- **Fiche info athlète**: une fiche est unique par athlète, réutilise les référentiels prospects (niveaux, objectifs, préférences d'activité) et stocke des données de santé sensibles (conditions médicales, allergies) soumises à visibilité privée.
- **Localisation**: les interfaces doivent rester entièrement bilingues (FR/EN). Les formulaires valident la présence des clés i18n avant publication.
- **Filtrage locale front/back office**: toutes les requêtes frontoffice (coach/athlète) vers les bibliothèques partagées (jours de repas, repas, types de repas, séances, exercices, etc.) doivent embarquer la langue active pour ne remonter que les contenus correspondant à cet utilisateur. Les formulaires de création/édition du backoffice doivent eux aussi restreindre les options proposées à la langue sélectionnée pour empêcher qu'un coach publie du contenu dans une langue non désirée.
- **Terminologie frontoffice**: toute interface coach/athlète affiche la fiche commerciale sous l'intitulé « Prospect » (même si l'API conserve l'entité `Client`). La mention « client » n'apparaît que lors du reporting backoffice.
- **Traçabilité**: toute création/édition supprime la possibilité de supprimer définitivement un enregistrement si celui-ci est référencé (ex: un exercice présent dans un programme ne peut être supprimé qu'après retrait du programme).

Cas d'usage détaillés:
1. **Onboarding d'un prospect**: depuis le backoffice, création d'une fiche avec informations commerciales → synchronisation frontoffice → le coach voit immédiatement le prospect dans Prospects avec les champs configurés.
2. **Attribution d'un programme**: un coach sélectionne un athlète, clone un programme modèle, personnalise les séances puis confirme. Le système verrouille la version pour garantir la cohérence entre coach et athlète.
3. **Publication d'un plan nutritionnel**: un responsable nutrition ajoute des jours/meals, assigne des icônes et définit la visibilité publique. Le plan devient disponible dans le frontoffice et mobile.
4. **Consultation Athlète**: l'athlète ouvre son espace, filtre ses programmes actifs et consulte les détails, guidé par les instructions et vidéos fournies.

## 5. Modèle de données fonctionnel
Principales entités et relations:
- **User** (coach, admin, athlète) — identifiant unique, rôle, langues préférées. Relations 1..n vers Clients créés, Programmes publiés.
- **Client** — regroupe l'information commerciale (statut, source, budget, objectifs, préférences, allergies). Lié à un User propriétaire et à 0..n **AthleteLinks**.
- **AthleteLink** — représente la relation coach ↔ athlète avec dates, statut, notes. Cardinalité 1 Coach : n liens, 1 Athlète : n liens (mais politique métier limite à un actif).
- **Program** — entité regroupant metadata (titre, durée, visibilité). Contient n **Session**.
- **Session** — agrège l'ordre d'exécution, la durée, et référence 1..n **ExerciseInstance**.
- **Exercise** — référentiel central (catégorie, muscles ciblés, équipement, tags, média). Instances dérivent de ce référentiel.
- **NutritionPlan** — regroupe n **NutritionDay** avec macros cibles.
- **NutritionDay** — contient des **Meal**; chaque Meal référence 1..n **FoodItem** ou macros.
- **AthleteInfo** — fiche par athlète, pointe vers un **User** de type ATHLETE, référence les niveaux/objectifs/préférences prospects, stocke conditions médicales et allergies, auditée (creator, timestamps) et supprimable en soft/hard delete.
- **ReleaseNote** — entité publiée côté showcase pour tracer les évolutions.

Contraintes fonctionnelles:
- Un client doit posséder au moins une source et un statut valide.
- Un programme public doit avoir au moins une session, et chaque session au moins un exercice.
- Les plans nutritionnels exigent des totaux macros cohérents et des icônes valides.
- Les relations coach/athlète doivent avoir un statut `active` ou `inactive`, jamais `null`.

## 6. Interfaces et canaux
- **Frontoffice (React, Vite)**: interface coaches/athlètes, modules Prospects, Athletes, Programs, Nutrition, Profile, Login. Utilise React Router, Zustand pour l'état, i18next pour les langues, MUI pour l'UI.
- **Backoffice (React, Vite)**: interface opérationnelle pour paramétrer les référentiels, gérer les comptes, contrôler la visibilité.
- **Mobile PWA**: déclinaison légère ciblant l'accès athlète sur smartphone.
- **API GraphQL (NestJS)**: exposée via Mercurius/Fastify, alimente front/back/mobile. Endpoints protégés par JWT.
- **Showcase (Vite)**: site marketing public listant les releases et la proposition de valeur.
- **Flux externes**: import/export JSON/CSV (prévu), webhooks internes (à définir). Pour l'instant aucune dépendance SaaS externe critique hormis l'object storage MinIO pour médias.

## 7. Exigences non fonctionnelles
- **Sécurité**: authentification JWT, chiffrement TLS via nginx+Certbot en prod, gestion stricte des rôles (coach/admin/athlète). Les données sensibles (santé) doivent être pseudonymisées en export.
- **Performance**: temps de réponse cible < 500 ms P95 pour les requêtes GraphQL complexes; interface front/back < 1,5 s LCP sur desktop.
- **Disponibilité**: 99,5 % mensuel pour l'API et les frontends; procédures de redémarrage via Docker Compose.
- **Accessibilité**: interfaces conformes WCAG 2.1 AA sur les modules critiques (contrastes MUI, navigation clavier).
- **Conformité**: RGPD (droit à l'effacement géré via soft delete), traçabilité des consentements.
- **KPIs fonctionnels**: taux de conversion prospect→client, nombre de programmes actifs, adoption des plans nutrition, délai de publication d'un contenu.

## 8. Risques et plans d'atténuation
| Risque | Impact | Probabilité | Mitigation |
| --- | --- | --- | --- |
| Données incohérentes entre front/back | Blocage des coachs | Moyen | Valider le schéma GraphQL unique, mutualiser les DTOs et tests end-to-end.
| Adoption limitée des modules nutrition | Valeur perçue réduite | Moyen | Poursuivre les interviews utilisateurs, ajouter des analytics ciblées.
| Fuite de données santé | Critique | Faible | Chiffrement, audit d'accès, rotation des secrets.
| Dette sur la localisation | Irritants UX | Moyen | Checklist de couverture i18n avant release, tests UI automatisés.
| Dépendance à Mongo unique | indisponibilité service | Moyen | Préparer un plan de réplication et sauvegardes quotidiennes.

## 9. Historique des décisions
| Date | Décision | Motif | Impact |
| --- | --- | --- | --- |
| 2025-10-15 | Intégration complète de la suite Nutrition (release 0.4.0) | Répondre aux besoins de coaching holistique | Nouvelles entités meal/plan, modules UI dédiés.
| 2025-11-06 | Unification des plans nutrition et programmes (release 0.5.0) | Cohérence parcours athlète | Harmonisation des formulaires et visibilité.
| 2025-11-20 | Gestion bout-en-bout prospects → athlètes (release 0.6.0) | Centraliser les données client et relationnelles | Ajout statuts, préférences, Athletes module.
| 2025-12-?? | Alignement complet FR/EN | Exigence marchés UE/NA | Bundles i18n maintenus côté front/back.

---
_Mettre à jour ce dossier à chaque évolution majeure du périmètre fonctionnel._
