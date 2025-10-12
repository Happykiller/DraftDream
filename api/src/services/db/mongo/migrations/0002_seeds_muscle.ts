// src/migrations/0002_seeds_muscle.ts
import { Db, ObjectId } from "mongodb";
import { Migration } from "@services/db/mongo/migration.runner.mongo";

/**
 * NOTE: on reste volontairement en "raw" MongoDB ici.
 * Avantages: pas de dÃ©pendance Ã  la couche service, migration stable dans le temps.
 */

const FR_LABELS = [
  "pectoraux",
  "dos",
  "epaules",
  "biceps",
  "triceps",
  "quadriceps",
  "ischio-jambiers",
  "fessiers",
  "mollets",
  "abdominaux",
  "cardio",
  "trapezes",
  "dorsaux",
  "obliques",
];

/** Petit utilitaire pour uniformiser les slugs Ã  partir dâ€™un libellÃ© FR */
function toSlug(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")    // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toTitleCaseLabel(label: string): string {
  return label
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const migration: Migration = {
  id: "0002_seeds_muscle",
  description: "Seed muscles (locale=fr) and link to admin user as createdBy",

  async up(db: Db, log) {
    // 1) Ensure indexes for muscles
    const musclesCol = db.collection("muscles");
    await musclesCol.createIndexes([
      { key: { slug: 1, locale: 1 }, name: "uniq_slug_locale", unique: true },
      { key: { updatedAt: -1 }, name: "by_updatedAt" },
    ]);
    log("muscles indexes ensured");

    // 2) Get admin user _id
    const admin = await db.collection("users").findOne(
      { email: "admin@fitdesk.com" },
      { projection: { _id: 1 } }
    );
    if (!admin?._id) {
      throw new Error(
        'Admin user not found (email: "admin@fitdesk.com"). Run admin migration first.'
      );
    }
    const createdBy: ObjectId = admin._id as ObjectId;

    // 3) Build docs (idempotent upsert)
    const now = new Date();
    const docs = FR_LABELS.map((label) => {
      const formattedLabel = toTitleCaseLabel(label);
      const slug = toSlug(label);
      return {
        updateOne: {
          filter: { slug, locale: "fr" },
          update: {
            $setOnInsert: {
              slug,
              locale: "fr",
              visibility: "public",
              createdBy: createdBy.toHexString ? createdBy.toHexString() : String(createdBy),
              createdAt: now,
            },
            $set: { updatedAt: now, label: formattedLabel },
          },
          upsert: true,
        },
      };
    });

    const res = await musclesCol.bulkWrite(docs, { ordered: false });
    log(
      `muscles upserted: inserted=${res.upsertedCount ?? 0}, modified=${res.modifiedCount ?? 0}`
    );
  },
};

export default migration;





