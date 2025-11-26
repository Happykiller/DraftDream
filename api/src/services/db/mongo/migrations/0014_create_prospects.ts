// src/services/db/mongo/migrations/0014_create_clients.ts
import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0014_create_prospects',
  description: 'Ensure clients collection indexes',

  async up(db: Db, log) {
    const col = db.collection('prospects');
    await col.createIndexes([
      { key: { email: 1 }, name: 'clients_email_unique', unique: true },
      { key: { statusId: 1 }, name: 'clients_statusId' },
      { key: { levelId: 1 }, name: 'clients_levelId' },
      { key: { sourceId: 1 }, name: 'clients_sourceId' },
      { key: { updatedAt: -1 }, name: 'clients_updatedAt' },
    ]);
    log('clients indexes ensured');
  },
};

export default migration;
