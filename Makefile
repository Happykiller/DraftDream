# Makefile minimal corrigé
.PHONY: help build $(SERVICES) build-%

SERVICES := api frontoffice backoffice showcase mobile nginx mongo mongo_express

.DEFAULT_GOAL := help

help:
	@echo "Usage :"
	@echo "  make [service]     -> build + save l'image (ex: make api)"
	@echo "  make build         -> build toutes les images"
	@echo
	@echo "Services disponibles :"
	@for s in $(SERVICES); do echo "  - $$s"; done

# Appel simple : make api
$(SERVICES): FORCE
	@$(MAKE) build-$@

build: $(addprefix build-,$(SERVICES))

build-%:
	docker build -t fitdesk_$* ./$*
	docker save fitdesk_$* -o fitdesk_$*.tar
	@echo "OK -> fitdesk_$*.tar"

.PHONY: FORCE
