#!/bin/sh
# mongo\mongo-init\001-app-user.sh
set -e

echo "[mongo-init] Creating app user '${MONGO_APP_USER}' on DB '${MONGO_INITDB_DATABASE}' ..."

cat >/tmp/create-app-user.js <<'JS'
const dbName  = process.env.MONGO_INITDB_DATABASE;
const appUser = process.env.MONGO_APP_USER;
const appPass = process.env.MONGO_APP_PASSWORD;

if (!dbName || !appUser || !appPass) {
  print(`[mongo-init] Missing env: MONGO_INITDB_DATABASE/MONGO_APP_USER/MONGO_APP_PASSWORD`);
  quit(1);
}

const db = db.getSiblingDB(dbName);
const existing = db.getUser(appUser);

if (existing) {
  print(`[mongo-init] User '${appUser}' already exists on db '${dbName}', skipping.`);
} else {
  db.createUser({
    user: appUser,
    pwd:  appPass,
    roles: [{ role: 'readWrite', db: dbName }]
  });
  print(`[mongo-init] User '${appUser}' created on db '${dbName}'.`);
}
JS

# Pendant l'init officielle, mongod tourne en "noauth", on peut appeler mongosh sans creds
mongosh --file /tmp/create-app-user.js
