// src/services/db/mongo/migrations/0017_create_athlete_infos.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0017_create_athlete_infos',
  description: 'Ensure athlete_infos collection indexes',

  async up(db: Db, log) {
    const col = db.collection('athlete_infos');
    await col.createIndexes([
      {
        key: { userId: 1 },
        name: 'athlete_infos_userId_unique',
        unique: true,
        partialFilterExpression: { deletedAt: { $eq: null } },
      },
      { key: { createdBy: 1 }, name: 'athlete_infos_createdBy' },
      { key: { updatedAt: -1 }, name: 'athlete_infos_updatedAt' },
    ]);
    log('athlete_infos indexes ensured');
  },
};

export default migration;
