// src/services/db/mongo/db.service.mongo.ts
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { BddServiceInitMongo } from '@services/db/mongo/db.service.init.mongo';
import { BddServiceTestMongo } from '@services/db/mongo/db.service.test.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';

type InfraDeps = { inversify: any; config: any };

export class BddServiceMongo {
  readonly init: BddServiceInitMongo;
  readonly test: BddServiceTestMongo;
  readonly user: BddServiceUserMongo;
  readonly muscle: BddServiceMuscleMongo;
  readonly category: BddServiceCategoryMongo;
  readonly equipment: BddServiceEquipmentMongo;
  readonly tag: BddServiceTagMongo;

  constructor({ inversify, config }: InfraDeps) {
    this.init = new BddServiceInitMongo(inversify, config);
    this.test = new BddServiceTestMongo(inversify);
    this.user = new BddServiceUserMongo();
    this.muscle = new BddServiceMuscleMongo();
    this.category = new BddServiceCategoryMongo();
    this.equipment = new BddServiceEquipmentMongo();
    this.tag = new BddServiceTagMongo();
  }
}
