// src\services\db\mongo\db.service.test.mongo.ts
import * as mongoDB from 'mongodb';

export class BddServiceTestMongo {
  constructor(
    private readonly inversify:{mongo: mongoDB.Db},
  ){}

  async test(): Promise<boolean> {
    try {
      const result = await this.inversify.mongo.command({ ping: 1 });
      return result.ok === 1;
    } catch (err) {
      console.error('❌ MongoDB ping failed:', err);
      return false;
    }
  }
}
