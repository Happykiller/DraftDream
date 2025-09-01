#!/bin/sh
set -eu

# ---------- Paramètres ----------
MINIO_DATA_DIR="${MINIO_DATA_DIR:-/data}"
MINIO_API_ADDR="${MINIO_API_ADDR:-:9000}"
MINIO_CONSOLE_ADDR="${MINIO_CONSOLE_ADDR:-:9001}"

RETRIES="${RETRIES:-60}"      # secondes d'attente max readiness
SLEEP_SECS="${SLEEP_SECS:-1}" # délai entre tentatives

# Variables requises
if [ -z "${MINIO_ROOT_USER:-}" ] || [ -z "${MINIO_ROOT_PASSWORD:-}" ]; then
  echo "ERROR: MINIO_ROOT_USER and MINIO_ROOT_PASSWORD must be set." >&2
  exit 1
fi

# ---------- Prépare le volume /data ----------
mkdir -p "${MINIO_DATA_DIR}"
# Fix des droits (root -> accès service)
# NB: si tu veux faire tourner minio en user non-root ensuite, mets 1000:1000 ici
chown -R root:root "${MINIO_DATA_DIR}"

echo "[minio] starting server..."
/usr/bin/minio server "${MINIO_DATA_DIR}" \
  --address "${MINIO_API_ADDR}" \
  --console-address "${MINIO_CONSOLE_ADDR}" &
MINIO_PID=$!

# ---------- Attente de readiness via 'mc' ----------
echo "[minio] waiting for readiness ..."
i=0
while [ "$i" -lt "$RETRIES" ]; do
  if /usr/local/bin/mc alias set local http://127.0.0.1:9000 \
       "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" >/dev/null 2>&1; then
    echo "[minio] ready."
    break
  fi
  i=$((i+1))
  sleep "$SLEEP_SECS"
  if ! kill -0 "$MINIO_PID" 2>/dev/null; then
    echo "ERROR: minio exited prematurely." >&2
    wait "$MINIO_PID" || true
    exit 1
  fi
done

# ---------- Init (idempotent) ----------
echo "[init] start ..."

if [ -n "${MINIO_BUCKET:-}" ]; then
  /usr/local/bin/mc mb -p "local/${MINIO_BUCKET}" >/dev/null 2>&1 || true
  /usr/local/bin/mc anonymous set none "local/${MINIO_BUCKET}" >/dev/null 2>&1 || true
fi

if [ -n "${MINIO_API_USER:-}" ] && [ -n "${MINIO_API_PASSWORD:-}" ]; then
  /usr/local/bin/mc admin user add local "${MINIO_API_USER}" "${MINIO_API_PASSWORD}" >/dev/null 2>&1 || true
  if [ -n "${MINIO_POLICY_FILE:-}" ] && [ -f "${MINIO_POLICY_FILE}" ]; then
    POLICY_NAME="${MINIO_POLICY_NAME:-draftdream-readwrite}"
    /usr/local/bin/mc admin policy create local "${POLICY_NAME}" "${MINIO_POLICY_FILE}" >/dev/null 2>&1 || true
    /usr/local/bin/mc admin policy attach local "${POLICY_NAME}" --user "${MINIO_API_USER}" >/dev/null 2>&1 || true
  fi
fi

if [ "${MINIO_NOTIFY_WEBHOOK_ENABLE_miniohook:-off}" = "on" ]; then
  /usr/local/bin/mc admin config set local notify_webhook:miniohook \
    endpoint="${MINIO_NOTIFY_WEBHOOK_ENDPOINT_miniohook:-}" \
    auth_token="${MINIO_NOTIFY_WEBHOOK_AUTH_TOKEN_miniohook:-}" >/dev/null 2>&1 || true
  /usr/local/bin/mc admin service restart local >/dev/null 2>&1 || true
fi

echo "[init] done."
wait "$MINIO_PID"
