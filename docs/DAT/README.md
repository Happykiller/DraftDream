# Dossier d'Architecture Technique (DAT)

## 1. Vision technique
Objectif: fournir une plateforme multi-apps (API, frontoffice, backoffice, mobile, showcase) respectant l'architecture hexagonale et les exigences fonctionnelles du DAF.
Principes directeurs:
- **Séparation nette des responsabilités**: logique métier encapsulée dans des use cases NestJS, frontaux en React consommant uniquement GraphQL.
- **Déploiement conteneurisé**: chaque composant est packagé via Docker pour garantir la parité dev/prod.
- **Observabilité et traçabilité**: logs Winston consolidés côté API, navigation front/back instrumentée par un loader global.
- **Industrialisation**: pipeline `make save` → `make install` pour préparer les images (`fitdesk_*`) puis les déployer sur le serveur cible (voir `serv/docker-compose.prod.yml`).

Lien DAF/DAT:
- Les parcours prospects↔clients↔athlètes reposent sur Mongo et les résolveurs GraphQL (DAF §2) → couverts par les use cases `clients`, `athletes`, `athlete-info` dans l'API.
- La cohérence FR/EN (DAF §6) dépend des bundles i18n versionnés dans frontoffice/backoffice.
- Les exigences de visibilité (DAF §4) s'appuient sur des champs de métadonnées propagés de Mongo aux frontaux via DTOs partagés.

## 2. Architecture logique
### Vue globale
```
[Showcase (Vite)]          [Mobile PWA]
          \                 /
           \               /
        [Frontoffice React]    [Backoffice React]
                 \            /
                  \          /
                 [GraphQL API NestJS]
                          |
                     [Usecases]
                          |
                [Services / Adapters]
                          |
                      [MongoDB]
```
- **Couche présentation**: React/Vite + MUI, routers clients, i18n. Les applications n'interagissent avec le backend qu'à travers le client GraphQL.
- **Couche application** (`api/src/usecases`) : traitements métiers (gestion clients, programmes, nutrition). Injectés via Inversify.
- **Adapters** (`api/src/graphql`, `api/src/services`) : exposent GraphQL via Mercurius, gèrent JWT, Mongo repositories.
- **Services externes**: MongoDB, potentiellement MinIO pour médias, Certbot/nginx pour TLS.

Flux principaux:
1. Authentification: front/back récupèrent un JWT via mutation GraphQL, stocké en mémoire (Zustand). Les requêtes suivantes portent le header `Authorization`.
2. Gestion contenu: front/back invoquent des mutations (programCreate, mealPlanUpdate, etc.) → use cases → repositories Mongo.
3. Publication releases: showcase consomme un fichier JSON statique versionné (`showcase/public/i18n/*/releases.json`).

## 3. Architecture physique
- **Environnements**: développement local (Docker Compose minimal + Vite dev servers), production (stack complète décrite dans `docker-compose.yml` et `serv/docker-compose.prod.yml`).
- **Réseau**: réseau Docker `internal` isolé; nginx agit comme reverse proxy exposant ports 80/443. Les apps front/back/mobile/showcase sont servies via nginx (profil `prod`).
- **Stockage**: volume `mongo_data` persistant; volumes `letsencrypt` et `certbot_www` pour TLS.
- **Accès**: `api.local.fo`, `front.local.fo`, etc., via hosts file pour reproduire le routage local.

## 4. Stack applicative
| Composant | Langages/Frameworks | Particularités |
| --- | --- | --- |
| API | NestJS 11, Mercurius GraphQL, Fastify, TypeScript, Inversify | Hexagonal, DTOs stricts, jose pour JWT, winston pour logs.
| Frontoffice | React 19, Vite 7, TypeScript, MUI 7, Zustand, i18next | PWA-ready, navigation React Router 7, store centralisé `useAsyncTask`.
| Backoffice | React 19, Vite 7, MUI 7, i18next | Orientation admin, modules multiples via onglets.
| Mobile | React 19, Vite | PWA légère pour consultation.
| Showcase | React 19, Vite | Site statique multilingue.
| DevOps | Docker Compose, Makefile, Certbot, nginx | Pipeline `make deploy-prod`, reverse proxy mutualisé.

Règles de structuration: imports en escalier, séparation strictes entre `usecases` et `services`, conventions i18n (pas de fallback `defaultValue`).

## 5. Stockage et données
- **MongoDB 7**: base unique déclarée via `MONGO_DB`. Utilisation des collections `users`, `clients`, `athletes`, `athleteInfos`, `programs`, `sessions`, `exercises`, `nutritionPlans`, `releases`, etc. Accès via `mongodb` driver/Mongoose.
  - Paramètres critiques: authentification SCRAM (user root + user applicatif), volume persistant, healthcheck `db.runCommand({ ping:1 })`.
  - Sauvegardes: exports mongodump à automatiser (actuellement manuel via `make save`).
- **Object storage (MinIO)**: référencé pour servir médias (icônes, vidéos). À intégrer via URL signées.
- **Logs**: rotation via `winston-daily-rotate-file` côté API; frontaux utilisent la console du navigateur (à centraliser futur).
- **Migrations**: scripts TypeScript sous `api/src/services/db/mongo/migrations` exécutés lors du bootstrap.

## 6. Intégrations et interfaces techniques
- **GraphQL schema** (généré au runtime par NestJS/Mercurius): mutations/queries pour clients, programmes, nutrition, relations, fiches info athlète. Auth via header `Authorization: Bearer <JWT>`.
- **JWT service** (`api/src/services/jwt`) : signe HS256, configuration via `JWT_SECRET` et `jwt.expire`.
- **Webhooks**: non implémentés; planifiés pour export release/analytics.
- **Showcase**: consomme JSON statique, pas d'API runtime.
- **Mongo Express**: console d'admin protégée par Basic Auth (profil prod/dev).

## 7. Sécurité
- **Secrets**: `.env` stocke les variables sensibles (MONGO creds, JWT secret, APP_ADMIN_PASSWORD). Non commit.
- **Authentification**: mutation GraphQL génère un JWT; contrôles via guards Nest et décorateurs `@Auth`.
- **Autorisation**: rôles (coach, admin, athlete) portés dans le token; guards appliqués au niveau resolver.
- **Chiffrement**: TLS via nginx + Certbot. Mots de passe hachés argon2 côté API.
- **Journalisation**: Winston consigne les évènements critiques (login, erreurs). Besoin futur: SIEM.
- **Conformité RGPD**: soft delete, anonymisation planifiée, logs d'accès à conserver < 365 jours.

## 8. Observabilité et opérations
- **Logs**: `docker compose logs -f <service>` côté infra, Winston rotate côté API, frontaux s'appuient sur Sentry (à intégrer) / console.
- **Métriques**: à implémenter (Fastify hooks pour P95). Pour l'instant, healthchecks (Mongo, containers).
- **Déploiement**: `make save` construit les images, `make install` pousse et redéploie via `serv/docker-compose.prod.yml`. Rollback via `make down-prod` + rechargement des images précédentes.
- **Incident response**: `docker compose ps`, `docker compose logs --tail=100`, restart ciblé (`docker compose --profile prod restart <service>`).

## 9. Performance et scalabilité
- **Goulots**: API monolithique NestJS, Mongo single-node. Risques sur CPU lors de requêtes agrégées (programs + sessions + exercises). Mitigation: indexes Mongo (status, visibility, relations), pagination GraphQL.
- **Scalabilité**: possibilité de séparer frontaux statiques derrière CDN; API scale horizontale via multiples conteneurs derrière nginx (nécessite sticky sessions si websockets). Mongo replicaset à planifier.
- **Tests de performance**: planifiés via k6/Gatling sur GraphQL, Lighthouse pour frontaux.
- **SLOs**: API P95 < 500 ms, erreurs GraphQL < 1 %, disponibilité 99.5 %.

## 10. Gestion des risques techniques
| Risque | Criticité | Mitigation |
| --- | --- | --- |
| Monorepo multi-apps complexe | Élevée | Règles AGENT, linting partagé, automatisation CI (npm run build) pour chaque app.
| Secrets exposés | Critique | Fichiers `.env` exclus, utilisation de vault distant à planifier.
| Tests insuffisants | Moyen | Couverture Jest côté API, ajout tests React (Vitest) pour flows critiques.
| TLS/Cerbot non renouvelé | Moyen | Automatiser `certbot renew`, monitoring cron.
| Manque d'observabilité | Moyen | Introduire stack ELK ou Grafana Loki + Prometheus.

Décisions d'architecture clés (ADR):
1. **GraphQL unique** plutôt que REST multiple pour uniformiser la consommation multi-fronts.
2. **MongoDB** choisi pour la flexibilité des structures programmes/nutrition.
3. **React + Vite** pour tous les frontaux afin de mutualiser les composants et la toolchain.
4. **Docker Compose** comme cible de déploiement pour préserver la simplicité opérationnelle avant une migration Kubernetes.
5. **Nginx unique** pour agréger les frontaux statiques et proxy l'API derrière TLS.

---
_Mettre à jour ce dossier à chaque évolution majeure de l'architecture technique._
