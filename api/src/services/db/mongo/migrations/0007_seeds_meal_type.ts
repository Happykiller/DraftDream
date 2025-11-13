// src/services/db/mongo/migrations/0007_seeds_meal_type.ts
import { Db, ObjectId } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';
import { toSlug } from './0004_seeds_category';

const FR_MEAL_TYPES = [
  'Petit déjeuner',
  'Déjeuner',
  'Dîner',
  'Goûter',
  'Collation',
];

const migration: Migration = {
  id: '0007_seeds_meal_type',
  description: 'Seed meal types (locale=fr) linked to admin user',

  async up(db: Db, log): Promise<void> {
    const collection = db.collection('meal_types');
    await collection.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
    log('meal_types indexes ensured');

    const admin = await db.collection('users').findOne(
      { email: 'admin@fitdesk.com' },
      { projection: { _id: 1 } },
    );
    if (!admin?._id) {
      throw new Error('Admin user not found (email: "admin@fitdesk.com").');
    }

    const createdBy: ObjectId = admin._id;
    const now = new Date();

    const operations = FR_MEAL_TYPES.map((label) => {
      const trimmed = label.trim();
      const slug = toSlug(trimmed);
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
            $set: { label: trimmed, updatedAt: now },
          },
          upsert: true,
        },
      };
    });

    const result = await collection.bulkWrite(operations, { ordered: false });
    log(`meal_types upserted: inserted=${result.upsertedCount ?? 0}, modified=${result.modifiedCount ?? 0}`);
  },
};

export default migration;
