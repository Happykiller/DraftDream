// src\inversify\investify.ts
import { Db } from 'mongodb';
import { config } from '@src/config';
import { BddService } from '@services/db/db.service';
import { DbTestUsecase } from '@usecases/default/db.test.usecase';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { LoggerServiceFake } from '@services/logger/logger.service.fake';

export class Inversify {
  mongo: Db;
  loggerService: any;
  bddService: BddService;
  dbTestUsecase: DbTestUsecase;

  constructor() {
    /**
     * Services
     */
    this.loggerService = new LoggerServiceFake();
    this.bddService = new BddServiceMongo(this, config) as BddService;
    this.bddService.initConnection();

    /**
     * Usecases
     */
    this.dbTestUsecase = new DbTestUsecase(this);
  }
}

const inversify = new Inversify();

export default inversify;
