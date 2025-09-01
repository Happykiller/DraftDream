# ---- Stage 1: récupérer le binaire 'mc' sur Alpine ----
FROM alpine:3.20 AS get-mc
RUN apk add --no-cache ca-certificates curl \
 && curl -fsSL -o /mc https://dl.min.io/client/mc/release/linux-amd64/mc \
 && chmod +x /mc

# ---- Stage 2: image finale MinIO (sans apk/curl/bash) ----
FROM minio/minio:latest

# Copie du client 'mc' uniquement
COPY --from=get-mc /mc /usr/local/bin/mc

# Entrypoint + policies (facultatif)
COPY entrypoint.sh /entrypoint.sh
COPY policies/ /policies/

USER root
RUN chmod +x /entrypoint.sh

# NE PAS repasser en USER 1000 ici : l'entrypoint doit chown /data puis démarrer MinIO
ENTRYPOINT ["/entrypoint.sh"]
