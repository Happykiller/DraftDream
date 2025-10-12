# ./Makefile
# ========================
# Makefile utilities - DraftDream
# ========================

PROJECT_NAME ?= fitdesk
PROD_HOST ?= user@server
REMOTE_ROOT ?= /opt/fitdesk
REMOTE_IMAGE_DIR ?= $(REMOTE_ROOT)/images

COMPOSE ?= docker compose -p $(PROJECT_NAME)
BASE_FILE ?= -f docker-compose.yml
DEV_FILES ?= $(BASE_FILE) -f docker-compose.dev.yml

DEV_STACK := $(COMPOSE) $(DEV_FILES) --profile dev
PROD_STACK := $(COMPOSE) $(BASE_FILE) --profile prod

.PHONY: help up-dev down-dev logs-dev up-prod down-prod logs-prod reset clean ps save install deploy-prod

help:
	@echo ""
	@echo "Core workflow:"
	@echo "  make up-dev        # start MongoDB for local development"
	@echo "  make down-dev      # stop MongoDB (dev profile)"
	@echo "  make logs-dev      # follow MongoDB logs (dev profile)"
	@echo "  make up-prod       # start the full production stack"
	@echo "  make down-prod     # stop the production stack"
	@echo "  make logs-prod     # follow production logs"
	@echo "  make save          # build and export images for deployment"
	@echo "  make install       # load images on the server and restart prod (requires ssh)"
	@echo "  make deploy-prod   # run save followed by install"
	@echo ""
	@echo "Useful variables:"
	@echo "  PROD_HOST=$(PROD_HOST)"
	@echo "  REMOTE_ROOT=$(REMOTE_ROOT)"
	@echo "  REMOTE_IMAGE_DIR=$(REMOTE_IMAGE_DIR)"

up-dev: ## Start MongoDB (exposed ports)
	$(DEV_STACK) up -d mongo

down-dev:
	$(DEV_STACK) down

logs-dev:
	$(DEV_STACK) logs -f --tail=200

up-prod: ## Start the full stack (apps + nginx)
	$(PROD_STACK) up -d

down-prod:
	$(PROD_STACK) down

logs-prod:
	$(PROD_STACK) logs -f --tail=200

reset: ## Full rebuild (refresh images)
	$(PROD_STACK) down --remove-orphans
	docker image prune -af
	$(PROD_STACK) build --no-cache --pull

ps:
	$(COMPOSE) $(BASE_FILE) ps

clean:
	$(COMPOSE) $(BASE_FILE) down -v

save: ## Build and export images for deployment
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

install: ## Load images on the server and restart the prod stack
	ssh $(PROD_HOST) 'cd $(REMOTE_IMAGE_DIR) && \
	 docker load -i fitdesk_api.tar && \
	 docker load -i fitdesk_frontoffice.tar && \
	 docker load -i fitdesk_backoffice.tar && \
	 docker load -i fitdesk_showcase.tar && \
	 docker load -i fitdesk_mobile.tar && \
	 cd $(REMOTE_ROOT) && docker compose --profile prod up -d'

deploy-prod: save install ## Full deployment sequence

# Deployment notes:
# 1. Update PROD_HOST and the remote paths before running commands.
# 2. Copy the *.tar files to $(REMOTE_IMAGE_DIR) (example: scp fitdesk_*.tar $(PROD_HOST):$(REMOTE_IMAGE_DIR)).
# 3. Run make install or make deploy-prod depending on the need.
