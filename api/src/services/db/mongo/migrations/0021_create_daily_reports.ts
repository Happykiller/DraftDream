import { Db } from 'mongodb';

import { Migration } from '@services/db/mongo/migration.runner.mongo';

const migration: Migration = {
  id: '0021_create_daily_reports',
  description: 'Ensure daily_reports collection indexes',

  async up(db: Db, log) {
    const col = db.collection('daily_reports');
    await col.createIndexes([
      { key: { athleteId: 1, reportDate: -1 }, name: 'daily_reports_athleteId_reportDate' },
      { key: { createdBy: 1 }, name: 'daily_reports_createdBy' },
      { key: { reportDate: -1 }, name: 'daily_reports_reportDate' },
      { key: { updatedAt: -1 }, name: 'daily_reports_updatedAt' },
    ]);
    log('daily_reports indexes ensured');
  },
};

export default migration;
