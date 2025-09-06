# ========================
# Makefile utils - draftdream
# ========================

PROJECT_NAME = draftdream
DOCKER_COMPOSE = docker compose -p $(PROJECT_NAME) -f docker-compose.yml

# ------------------------
# Services
# ------------------------
SERVICES = api frontoffice backoffice showcase mobile nginx postgres mongo redis

# ------------------------
# Commands
# ------------------------

.PHONY: help up down build logs ps restart clean prune shell

help: ## Affiche la liste des commandes disponibles
	@echo "Makefile pour $(PROJECT_NAME)"
	@echo
	@echo "Commandes disponibles :"
	@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-15s %s\n", $$1, $$2}'

up: ## Démarre tous les services en background
	$(DOCKER_COMPOSE) up -d

down: ## Stoppe et supprime les conteneurs (pas les volumes)
	$(DOCKER_COMPOSE) down

restart: ## Redémarre tous les services
	$(DOCKER_COMPOSE) restart

build: ## Rebuild les images
	$(DOCKER_COMPOSE) build --no-cache

logs: ## Affiche les logs (tous services)
	$(DOCKER_COMPOSE) logs -f --tail=100

logs-%: ## Affiche les logs d’un service ex: make logs-api
	$(DOCKER_COMPOSE) logs -f $*

ps: ## Liste les conteneurs
	$(DOCKER_COMPOSE) ps

shell-%: ## Ouvre un shell dans un service (ex: make shell-api)
	$(DOCKER_COMPOSE) exec $* sh

clean: ## Supprime conteneurs + volumes liés au projet
	$(DOCKER_COMPOSE) down -v

prune: ## Nettoie TOUT docker (dangereux : containers/volumes/images)
	docker system prune -af --volumes

# ------------------------
# Services spécifiques
# ------------------------

start-%: ## Démarre un service spécifique (ex: make start-api)
	$(DOCKER_COMPOSE) up -d $*

stop-%: ## Stoppe un service spécifique (ex: make stop-api)
	$(DOCKER_COMPOSE) stop $*

rebuild-%: ## Rebuild un service spécifique (ex: make rebuild-api)
	$(DOCKER_COMPOSE) build --no-cache $* && $(DOCKER_COMPOSE) up -d $*

# Dev infra only (pas les apps)
up-dev: ## Démarre l'infra (DB/queues/minio/nginx) avec ports exposés
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml up -d postgres mongo redis clamav minio nginx

down-dev: ## Stoppe l'infra Dev
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml down

logs-dev: ## Logs infra Dev
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml logs -f --tail=200

# Prod/pseudo-prod (tout)
up-prod: ## Démarre toute la stack en profil prod
	DOCKER_DEFAULT_PLATFORM= $(DOCKER_COMPOSE) --profile prod up -d

down-prod:
	$(DOCKER_COMPOSE) --profile prod down