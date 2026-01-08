// src/services/db/mongo/migrations/0020_create_meal_records.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0020_create_meal_records',
  description: 'Ensure meal_records collection indexes',

  async up(db: Db, log) {
    const col = db.collection('meal_records');
    await col.createIndexes([
      { key: { userId: 1 }, name: 'meal_records_userId' },
      { key: { mealPlanId: 1 }, name: 'meal_records_mealPlanId' },
      { key: { mealDayId: 1 }, name: 'meal_records_mealDayId' },
      { key: { mealId: 1 }, name: 'meal_records_mealId' },
      { key: { state: 1 }, name: 'meal_records_state' },
      { key: { updatedAt: -1 }, name: 'meal_records_updatedAt' },
    ]);
    log('meal_records indexes ensured');
  },
};

export default migration;
