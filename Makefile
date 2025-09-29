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
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml --profile dev up -d mongo

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

save:
	docker build -t mongo ./mongo
	docker build -t mongo_express ./mongo_express
	docker build -t nginx ./nginx
	docker build -t fitdesk_api ./api
	docker build -t fitdesk_frontoffice ./frontoffice
	docker build -t fitdesk_backoffice ./backoffice
	docker build -t fitdesk_showcase ./showcase
	docker build -t fitdesk_mobile ./mobile
	docker save fitdesk_api -o fitdesk_api.tar
	docker save fitdesk_frontoffice -o fitdesk_frontoffice.tar
	docker save fitdesk_backoffice -o fitdesk_backoffice.tar
	docker save fitdesk_showcase -o fitdesk_showcase.tar
	docker save fitdesk_mobile -o fitdesk_mobile.tar
