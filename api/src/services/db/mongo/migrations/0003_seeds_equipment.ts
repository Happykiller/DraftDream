// src/migrations/0003_seeds_equipment.ts
import { Db, ObjectId } from 'mongodb';
import { Migration } from '@services/db/mongo/migration.runner.mongo';

/** Convert FR label to slug */
function toSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const FR_LABELS = [
  'Aucun',
  'Haltères',
  'Barre',
  'Banc',
  'Disques',
  'Élastiques',
  'Kettlebell',
  'TRX',
  'Ballon',
  'Tapis',
  'Barre de traction',
  'Câbles',
];

const migration: Migration = {
  id: '0003_seeds_equipment',
  description: 'Seed equipments (locale=fr) and link to admin user as createdBy',

  async up(db: Db, log) {
    // indexes
    const col = db.collection('equipments');
    await col.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
    log('equipments indexes ensured');

    // admin
    const admin = await db.collection('users').findOne(
      { email: 'admin@fitdesk.com' },
      { projection: { _id: 1 } }
    );
    if (!admin?._id) {
      throw new Error('Admin user not found (email: "admin@fitdesk.com"). Run admin migration first.');
    }
    const createdBy: ObjectId = admin._id as ObjectId;

    // upserts
    const now = new Date();
    const ops = FR_LABELS.map((label) => {
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
            $set: { updatedAt: now },
          },
          upsert: true,
        },
      };
    });

    const res = await col.bulkWrite(ops, { ordered: false });
    log(`equipments upserted: inserted=${res.upsertedCount ?? 0}, modified=${res.modifiedCount ?? 0}`);
  },
};

export default migration;
export { toSlug };
