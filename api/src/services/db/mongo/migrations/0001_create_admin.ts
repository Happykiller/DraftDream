// src/migrations/0004_create_admin_user.ts
import { Db } from "mongodb";
import { Migration } from "@services/db/mongo/migration.runner.mongo";

/**
 * Idempotent admin creation using upsert.
 * - Ensures user collection indexes (including uniq_email).
 * - Normalizes email to lowercase/trim.
 * - Upserts on { email } and sets timestamps.
 */
const migration: Migration = {
  id: "0001_create_admin",
  description: "Create or ensure initial admin user (admin@fitdesk.com)",

  async up(db: Db, log) {
    const users = db.collection("users");

    // 1) Ensure indexes (aligned with new repository ensureIndexes)
    await users.createIndexes([
      { key: { email: 1 }, name: "uniq_email", unique: true },
      { key: { type: 1 }, name: "by_type" },
      { key: { last_name: 1, first_name: 1 }, name: "by_name" },
      { key: { "company.name": 1 }, name: "by_company_name", sparse: true },
      { key: { createdAt: -1 }, name: "by_createdAt" },
      { key: { updatedAt: -1 }, name: "by_updatedAt" },
    ]);
    log("users indexes ensured");

    // 2) Admin payload (email normalized)
    const email = "admin@fitdesk.com".toLowerCase().trim();
    const now = new Date();

    const adminDoc = {
      type: "admin" as const,
      first_name: "admin",
      last_name: "admin",
      email,
      phone: "+33683786804",
      // NOTE: hash must be produced by usecase; here we keep your existing Argon2 hash
      password:
        "$argon2id$v=19$m=19456,t=3,p=1$vRKlEa/nt1vN0GtCuSpV/g$YQ7pSluenBK3d04n/d+7Ah0+5r58dU+wc6ZMfS3ft28",
      address: {
        name: "35 chemin du chapitre",
        city: "Grenoble",
        code: "38100",
        country: "FR",
      },
      company: {
        name: "FitDesk SAS",
        address: {
          name: "35 chemin du chapitre",
          city: "Grenoble",
          code: "38100",
          country: "FR",
        },
      },
      updatedAt: now,
    };

    // 3) Idempotent upsert (keeps createdAt if exists)
    const res = await users.updateOne(
      { email }, // normalized unique key
      {
        $setOnInsert: { ...adminDoc, createdAt: now, schemaVersion: 1 },
        $set: { updatedAt: now },
      },
      { upsert: true }
    );

    if (res.upsertedCount === 1) {
      log("Admin user created ✅");
    } else {
      log("Admin user already present, ensured ✅");
    }
  },
};

export default migration;
