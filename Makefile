# ./Makefile
# ========================
# Makefile utils - fitdesk
# ========================

PROJECT_NAME = fitdesk
DOCKER_COMPOSE = docker compose -p $(PROJECT_NAME) -f docker-compose.yml

.PHONY: help up-dev down-dev logs-dev up-prod down-prod logs-prod build clean ps

help:
	@echo "make up-dev    # démarre Mongo (+ UI sur http://localhost:8081 si profil dev)"
	@echo "make up-prod   # démarre toute la stack prod derrière nginx"

up-dev: ## Démarre Mongo (ports exposés)
	$(DOCKER_COMPOSE) --profile dev up -d mongo

down-dev:
	$(DOCKER_COMPOSE) --profile dev down

logs-dev:
	$(DOCKER_COMPOSE) --profile dev logs -f --tail=200

up-prod: ## Démarre toute la stack (apps + nginx)
	$(DOCKER_COMPOSE) --profile prod up -d

down-prod:
	$(DOCKER_COMPOSE) --profile prod down

logs-prod:
	$(DOCKER_COMPOSE) --profile prod logs -f --tail=200

reset: ## Rebuild complet (reset images)
	$(DOCKER_COMPOSE) down --remove-orphans
	docker image prune -af
	$(DOCKER_COMPOSE) build --no-cache --pull

ps:
	$(DOCKER_COMPOSE) ps

clean:
	$(DOCKER_COMPOSE) down -v
