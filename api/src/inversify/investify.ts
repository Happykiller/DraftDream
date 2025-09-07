// src\inversify\investify.ts
import { Db } from 'mongodb';
import { config } from '@src/config';
import { logger } from '@src/common/logger';
import { BddService } from '@services/db/db.service';
import { CryptService } from '@services/crypt/crypt.service';
import { DbTestUsecase } from '@usecases/default/db.test.usecase';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { CryptServiceReal } from '@src/services/crypt/crypt.service.real';

export class Inversify {
  mongo: Db;
  loggerService: any;
  bddService: BddService;
  cryptService: CryptService;
  dbTestUsecase: DbTestUsecase;

  constructor() {
    /**
     * Services
     */
    this.loggerService = logger;
    this.cryptService = new CryptServiceReal();
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
