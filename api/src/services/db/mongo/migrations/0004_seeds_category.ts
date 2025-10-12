// src/migrations/000X_seeds_category.ts
import { Db, ObjectId } from 'mongodb';
import { Migration } from '@services/db/mongo/migration.runner.mongo';

function toSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const FR_LABELS = [
  'Haut du corps',
  'Bas du corps',
  'Full body',
  'Cardio',
  'Core',
  'Etirements',
  'Fonctionnel',
  'Pliometrie',
];

const migration: Migration = {
  id: '0004_seeds_category',
  description: 'Seed categories (locale=fr) and link to admin user as createdBy',

  async up(db: Db, log) {
    const col = db.collection('categories');
    await col.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
    log('categories indexes ensured');

    const admin = await db.collection('users').findOne(
      { email: 'admin@fitdesk.com' },
      { projection: { _id: 1 } }
    );
    if (!admin?._id) throw new Error('Admin user not found (email: "admin@fitdesk.com").');

    const createdBy: ObjectId = admin._id as ObjectId;
    const now = new Date();

    const ops = FR_LABELS.map((label) => {
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
    log(`categories upserted: inserted=${res.upsertedCount ?? 0}, modified=${res.modifiedCount ?? 0}`);
  },
};

export default migration;
export { toSlug };

