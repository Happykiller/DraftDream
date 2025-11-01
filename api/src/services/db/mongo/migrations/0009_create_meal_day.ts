// src/services/db/mongo/migrations/0009_create_meal_day.ts

import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0009_create_meal_day',
  description: 'Ensure meal days collection and indexes exist',

  async up(db: Db, log, inversify): Promise<void> {
    const collection = db.collection('meal_days');
    await collection.createIndexes([
      {
        key: { slug: 1, locale: 1 },
        name: 'mealDay_unique_slug_locale',
        unique: true,
        partialFilterExpression: { deletedAt: { $exists: false } },
      },
      { key: { updatedAt: -1 }, name: 'mealDay_by_updatedAt' },
      { key: { createdBy: 1 }, name: 'mealDay_by_createdBy' },
      { key: { locale: 1 }, name: 'mealDay_by_locale' },
      { key: { visibility: 1 }, name: 'mealDay_by_visibility' },
    ]);

    log('meal_days indexes ensured');
  },
};

export default migration;

