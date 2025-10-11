import { AnyBulkWriteOperation, Db } from 'mongodb';
import { Migration } from '@services/db/mongo/migration.runner.mongo';

function toTitleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const migration: Migration = {
  id: '0007_backfill_category_name',
  description: 'Ensure all categories have a name field populated',

  async up(db: Db, log) {
    const col = db.collection('categories');
    const cursor = col.find(
      { $or: [{ name: { $exists: false } }, { name: '' }] },
      { projection: { _id: 1, slug: 1 } }
    );

    const updates: AnyBulkWriteOperation[] = [];
    for await (const doc of cursor) {
      const derivedName = toTitleCase(doc.slug ?? '');
      updates.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { name: derivedName || doc.slug || 'Categorie' } },
        },
      });
    }

    if (updates.length === 0) {
      log('No categories missing name field.');
      return;
    }

    const res = await col.bulkWrite(updates, { ordered: false });
    log(
      `categories name backfill: matched=${res.matchedCount ?? 0}, modified=${res.modifiedCount ?? 0}`
    );
  },
};

export default migration;
