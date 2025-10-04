// src/services/db/mongo/db.service.mongo.ts
import { BddServiceInitMongo } from '@services/db/mongo/db.service.init.mongo';
import { BddServiceTestMongo } from '@services/db/mongo/db.service.test.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';

type InfraDeps = { inversify: any; config: any };

export class BddServiceMongo {
  readonly tag: BddServiceTagMongo;
  readonly init: BddServiceInitMongo;
  readonly test: BddServiceTestMongo;
  readonly user: BddServiceUserMongo;
  readonly muscle: BddServiceMuscleMongo;
  readonly category: BddServiceCategoryMongo;
  readonly exercise: BddServiceExerciseMongo;
  readonly equipment: BddServiceEquipmentMongo;

  constructor({ inversify, config }: InfraDeps) {
    this.tag = new BddServiceTagMongo();
    this.user = new BddServiceUserMongo();
    this.muscle = new BddServiceMuscleMongo();
    this.category = new BddServiceCategoryMongo();
    this.exercise = new BddServiceExerciseMongo();
    this.equipment = new BddServiceEquipmentMongo();
    this.test = new BddServiceTestMongo(inversify);
    this.init = new BddServiceInitMongo(inversify, config);
  }
}
