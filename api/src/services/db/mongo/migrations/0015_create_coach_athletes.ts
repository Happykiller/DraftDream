// src/services/db/mongo/migrations/0015_create_coach_athletes.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0015_create_coach_athletes',
  description: 'Ensure coach_athletes collection indexes',

  async up(db: Db, log) {
    const col = db.collection('coach_athletes');
    await col.createIndexes([
      {
        key: { coachId: 1, athleteId: 1 },
        name: 'coach_athletes_unique_pair',
        unique: true,
        partialFilterExpression: { deletedAt: { $exists: false } },
      },
      { key: { coachId: 1 }, name: 'coach_athletes_coachId' },
      { key: { athleteId: 1 }, name: 'coach_athletes_athleteId' },
      { key: { is_active: 1 }, name: 'coach_athletes_is_active' },
      { key: { updatedAt: -1 }, name: 'coach_athletes_updatedAt' },
      { key: { deletedAt: 1 }, name: 'coach_athletes_deletedAt' },
    ]);
    log('coach_athletes indexes ensured');
  },
};

export default migration;
