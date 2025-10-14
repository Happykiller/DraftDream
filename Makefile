# ./Makefile
.PHONY: build $(SERVICES) build-%

SERVICES := api frontoffice backoffice showcase mobile nginx mongo mongo_express

# Appel simple : make build api
$(SERVICES):
	@$(MAKE) build-$@

build: ; @true

# Build + Save
build-%:
	docker build -t fitdesk_$* ./$*
	docker save fitdesk_$* -o fitdesk_$*.tar
	@echo "OK -> fitdesk_$*.tar"
