// src/services/db/mongo/migrations/0008_create_meal.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0008_create_meal',
  description: 'Ensure meals collection and indexes are created',

  async up(db: Db, log, inversify): Promise<void> {
    const collection = db.collection('meals');
    await collection.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_meal_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'meal_by_updatedAt' },
      { key: { typeId: 1 }, name: 'meal_by_typeId' },
    ]);
    log('meals indexes ensured');

  },
};

export default migration;
