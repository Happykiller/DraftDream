// src/services/db/mongo/migrations/0009_seeds_client_objective.ts
import { Db, ObjectId } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

import { toSlug } from './0004_seeds_category';

const FR_OBJECTIVES = [
  'Perte de poids',
  'Prise de masse',
  'Tonification',
  'Endurance',
  'Force',
  'Souplesse',
  'Bien-être',
  'Performance',
];

const migration: Migration = {
  id: '0009_seeds_prospect_objective',
  description: 'Seed default prospect objectives (locale=fr) and link to admin user as createdBy',

  async up(db: Db, log) {
    const col = db.collection('prospect_objectives');
    await col.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
    log('client_objectives indexes ensured');

    const admin = await db.collection('users').findOne(
      { email: 'admin@fitdesk.com' },
      { projection: { _id: 1 } },
    );
    if (!admin?._id) throw new Error('Admin user not found (email: "admin@fitdesk.com").');

    const createdBy: ObjectId = admin._id;
    const now = new Date();

    const ops = FR_OBJECTIVES.map((label) => {
      const trimmedLabel = label.trim();
      const slug = toSlug(label);
      return {
        updateOne: {
          filter: { slug, locale: 'fr' },
          update: {
            $setOnInsert: {
              slug,
              locale: 'fr',
              visibility: 'public',
              createdBy: createdBy.toHexString ? createdBy.toHexString() : String(createdBy),
              createdAt: now,
            },
            $set: { updatedAt: now, label: trimmedLabel },
          },
          upsert: true,
        },
      };
    });

    const res = await col.bulkWrite(ops, { ordered: false });
    log(`client_objectives upserted: inserted=${res.upsertedCount ?? 0}, modified=${res.modifiedCount ?? 0}`);
  },
};

export default migration;
