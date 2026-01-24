#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-master}"
TARGET_BRANCH="${2:-HEAD}"
OUT_DIR="${3:-./git_diffs}"

mkdir -p "$OUT_DIR"

# Nettoyage des noms (slash => underscore)
BASE_SAFE="${BASE_BRANCH//\//_}"
TARGET_SAFE="${TARGET_BRANCH//\//_}"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"

COMMITS_FILE="${OUT_DIR}/commits_${BASE_SAFE}_to_${TARGET_SAFE}_${TIMESTAMP}.log"
DIFF_FILE="${OUT_DIR}/diff_${BASE_SAFE}_to_${TARGET_SAFE}_${TIMESTAMP}.patch"

echo "Base   : ${BASE_BRANCH}"
echo "Target : ${TARGET_BRANCH}"
echo "Dossier de sortie : ${OUT_DIR}"
echo

# 1) Liste des commits (présents dans TARGET mais pas dans BASE)
git log "${BASE_BRANCH}..${TARGET_BRANCH}" \
  --oneline \
  --decorate \
  > "$COMMITS_FILE"

# 2) Diff du code complet (en excluant les fichiers non-fonctionnels)
git diff "origin/${BASE_BRANCH}...${TARGET_BRANCH}" \
  -- . \
  ':(exclude)**/package.json' \
  ':(exclude)**/package-lock.json' \
  ':(exclude)**/yarn.lock' \
  ':(exclude)**/pnpm-lock.yaml' \
  ':(exclude)**/.env' \
  ':(exclude)**/.env.*' \
  ':(exclude)**/node_modules/*' \
  ':(exclude)**/dist/*' \
  ':(exclude)**/build/*' \
  > "$DIFF_FILE"

echo "Fichier commits : $COMMITS_FILE"
echo "Fichier diff    : $DIFF_FILE"
