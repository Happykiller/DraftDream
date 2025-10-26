# /opt/fitdesk/Makefile (serveur)
.PHONY: refresh $(SERVICES) up down logs ps

SERVICES := api frontoffice backoffice showcase mobile nginx mongo mongo_express
COMPOSE  := docker compose -p fitdesk -f docker-compose.prod.yml

# Alias "make refresh api" -> refresh-api
$(SERVICES):
	@$(MAKE) refresh-$@

refresh: ; @true

# Refresh d'un service à partir du tar déjà présent dans $(IMAGES_DIR)
refresh-%:
	test -f fitdesk_$*.tar
	$(COMPOSE) stop $* || true
	docker image rm -f fitdesk_$* || true
	docker load -i fitdesk_$*.tar
	$(COMPOSE) up -d --no-deps --force-recreate $*
	@echo "OK -> service $* relancé"