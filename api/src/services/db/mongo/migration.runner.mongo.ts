// src/services/db/mongo/migration.runner.mongo.ts
import * as mongoDB from 'mongodb';
import { Configuration } from '@src/config/configuration';
import { config } from '@src/config';

export interface Migration {
  id: string;
  description?: string;
  up(db: mongoDB.Db, log: (msg: string) => void, inversify: Inversify, config: Configuration): Promise<void>;
}

type Inversify = { mongo: mongoDB.Db, loggerService: { log: (lvl: string, msg: string) => void } };

export class MongoMigrationRunner {
  constructor(
    private readonly inversify: Inversify,
  ) {}

  private migrations(): Migration[] {
    // @ts-ignore
    const admin: Migration = require('./migrations/0001_create_admin').default;
    const muscles: Migration = require('./migrations/0002_seeds_muscle').default;
    const equipments: Migration = require('./migrations/0003_seeds_equipment').default;
    const categories: Migration = require('./migrations/0004_seeds_category').default;
    const exercises: Migration = require('./migrations/0005_seeds_exercise').default;
    const sessions: Migration = require('./migrations/0006_seeds_session').default;
    const mealTypes: Migration = require('./migrations/0007_seeds_meal_type').default;
    const meals: Migration = require('./migrations/0008_create_meal').default;
    return [
      admin,
      muscles,
      equipments,
      categories,
      exercises,
      sessions,
      mealTypes,
      meals,
    ];
  }

  private colMigrations(db: mongoDB.Db) {
    return db.collection<{ _id: string; appliedAt: Date; description?: string; elapsedMs?: number }>('__migrations');
  }

  async runAll(): Promise<void> {
    const db = this.inversify.mongo;
    const log = (msg: string) => this.inversify.loggerService.log('info', `[migrations] ${msg}`);

    log('Starting migrations (no lock)…');

    try {
      const done = await this.colMigrations(db).find({}, { projection: { _id: 1 } }).toArray();
      const doneSet = new Set(done.map(d => d._id));
      const list = this.migrations().sort((a, b) => a.id.localeCompare(b.id));

      for (const m of list) {
        if (doneSet.has(m.id)) {
          log(`Skip ${m.id} (already applied).`);
          continue;
        }
        log(`Apply ${m.id}…`);
        const t0 = Date.now();
        await m.up(db, (msg) => log(`${m.id}: ${msg}`), this.inversify, config);
        const elapsed = Date.now() - t0;

        await this.colMigrations(db).insertOne({
          _id: m.id,
          appliedAt: new Date(),
          description: m.description,
          elapsedMs: elapsed,
        });
        log(`Done ${m.id} in ${elapsed}ms.`);
      }

      log('All migrations up to date ✅');
    } catch (e: any) {
      this.inversify.loggerService.log('error', `[migrations] FAILED: ${e?.message ?? e}`);
      throw e;
    }
  }
}
