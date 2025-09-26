// src/services/db/mongo/db.service.init.mongo.ts
import * as mongoDB from 'mongodb';
import { MongoMigrationRunner } from './migration.runner.mongo';

export class BddServiceInitMongo {
  constructor(
    private readonly inversify: { mongo: mongoDB.Db, loggerService: any, bddService: any },
    private readonly config: any
  ) {}

  async initConnection() {
    const clientMongo = new mongoDB.MongoClient(this.config.mongo.connection_string);
    await clientMongo.connect();
    this.inversify.mongo = clientMongo.db(this.config.mongo.name);
    this.inversify.loggerService.log(
      'info',
      `Successfully connected to database: ${this.inversify.mongo.databaseName} ✅`,
    );

    const runner = new MongoMigrationRunner(this.inversify as any);
    await runner.runAll();
  }
}
