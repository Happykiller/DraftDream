import { AnyBulkWriteOperation, Db } from 'mongodb';
import { Migration } from '@services/db/mongo/migration.runner.mongo';

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const migration: Migration = {
  id: '0010_backfill_tag_name',
  description: 'Ensure all tags have a populated name field',

  async up(db: Db, log) {
    const col = db.collection('tags');
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
          update: { $set: { name: derivedName || doc.slug || 'Tag' } },
        },
      });
    }

    if (updates.length === 0) {
      log('No tags missing name field.');
      return;
    }

    const res = await col.bulkWrite(updates, { ordered: false });
    log(
      `tags name backfill: matched=${res.matchedCount ?? 0}, modified=${res.modifiedCount ?? 0}`
    );
  },
};

export default migration;
