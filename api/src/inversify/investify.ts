// src\inversify\investify.ts
import { Db } from 'mongodb';
import { config } from '@src/config';
import { logger } from '@src/common/logger';
import { BddService } from '@services/db/db.service';
import { JwtService } from '@services/jwt/jwt.service';
import { CryptService } from '@services/crypt/crypt.service';
import { AuthUsecase } from '@src/usecases/auth/auth.usecase';
import { DbTestUsecase } from '@usecases/default/db.test.usecase';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { CryptServiceReal } from '@services/crypt/crypt.service.real';
import { JwtServiceReal } from '@src/services/jwt/jwt.service.real';

export class Inversify {
  mongo: Db;
  loggerService: any;
  jwtService: JwtService;
  bddService: BddService;
  authUsecase: AuthUsecase;
  cryptService: CryptService;
  dbTestUsecase: DbTestUsecase;

  constructor() {
    /**
     * Services
     */
    this.loggerService = logger;
    this.cryptService = new CryptServiceReal();
    this.jwtService = new JwtServiceReal(config);
    this.bddService = new BddServiceMongo(this, config) as BddService;
    this.bddService.initConnection();

    /**
     * Usecases
     */
    this.authUsecase = new AuthUsecase(this);
    this.dbTestUsecase = new DbTestUsecase(this);
  }
}

const inversify = new Inversify();

export default inversify;
