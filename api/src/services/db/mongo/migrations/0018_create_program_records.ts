// src/services/db/mongo/migrations/0018_create_program_records.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0018_create_program_records',
  description: 'Ensure program_records collection indexes',

  async up(db: Db, log) {
    const col = db.collection('program_records');
    await col.createIndexes([
      {
        key: { userId: 1, programId: 1 },
        name: 'program_records_user_program_unique',
        unique: true,
        partialFilterExpression: { deletedAt: { $eq: null } },
      },
      { key: { userId: 1 }, name: 'program_records_userId' },
      { key: { programId: 1 }, name: 'program_records_programId' },
      { key: { state: 1 }, name: 'program_records_state' },
      { key: { updatedAt: -1 }, name: 'program_records_updatedAt' },
    ]);
    log('program_records indexes ensured');
  },
};

export default migration;
