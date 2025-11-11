// src/services/db/mongo/migration.runner.mongo.ts
import * as mongoDB from 'mongodb';
import { Configuration } from '@src/config/configuration';
import { config } from '@src/config';
import migration0001 from './migrations/0001_create_admin';
import migration0002 from './migrations/0002_seeds_muscle';
import migration0003 from './migrations/0003_seeds_equipment';
import migration0004 from './migrations/0004_seeds_category';
import migration0005 from './migrations/0005_seeds_exercise';
import migration0006 from './migrations/0006_seeds_session';
import migration0007 from './migrations/0007_seeds_meal_type';
import migration0008 from './migrations/0008_create_meal';

export interface Migration {
  id: string;
  description?: string;
  up(db: mongoDB.Db, log: (msg: string) => void, inversify: Inversify, config: Configuration): Promise<void>;
}

interface Inversify { mongo: mongoDB.Db, loggerService: { log: (lvl: string, msg: string) => void } }

export class MongoMigrationRunner {
  constructor(
    private readonly inversify: Inversify,
  ) {}

  private migrations(): Migration[] {
    return [
      migration0001,
      migration0002,
      migration0003,
      migration0004,
      migration0005,
      migration0006,
      migration0007,
      migration0008,
    ];
  }

  private colMigrations(db: mongoDB.Db) {
    return db.collection<{ _id: string; appliedAt: Date; description?: string; elapsedMs?: number }>('__migrations');
  }

  async runAll(): Promise<void> {
    const db = this.inversify.mongo;
    const log = (msg: string) => this.inversify.loggerService.log('info', `[migrations] ${msg}`);

    log('Starting migrations (no lock)...');

    try {
      const done = await this.colMigrations(db).find({}, { projection: { _id: 1 } }).toArray();
      const doneSet = new Set(done.map((item) => item._id));
      const list = this.migrations().sort((a, b) => a.id.localeCompare(b.id));

      for (const migration of list) {
        if (doneSet.has(migration.id)) {
          log(`Skip ${migration.id} (already applied).`);
          continue;
        }
        log(`Apply ${migration.id}...`);
        const t0 = Date.now();
        await migration.up(db, (msg) => log(`${migration.id}: ${msg}`), this.inversify, config);
        const elapsed = Date.now() - t0;

        await this.colMigrations(db).insertOne({
          _id: migration.id,
          appliedAt: new Date(),
          description: migration.description,
          elapsedMs: elapsed,
        });
        log(`Done ${migration.id} in ${elapsed}ms.`);
      }

      log('All migrations up to date.');
    } catch (e: any) {
      this.inversify.loggerService.log('error', `[migrations] FAILED: ${e?.message ?? e}`);
      throw e;
    }
  }
}

