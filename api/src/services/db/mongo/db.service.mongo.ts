// src/services/db/mongo/db.service.mongo.ts
import { BddServiceInitMongo } from '@services/db/mongo/db.service.init.mongo';
import { BddServiceTestMongo } from '@services/db/mongo/db.service.test.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { BddServiceClientObjectiveMongo } from '@services/db/mongo/repositories/client/objective.repository';
import { BddServiceClientActivityPreferenceMongo } from '@services/db/mongo/repositories/client/activity-preference.repository';
import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/client/status.repository';
import { BddServiceClientLevelMongo } from '@services/db/mongo/repositories/client/level.repository';
import { BddServiceClientSourceMongo } from '@services/db/mongo/repositories/client/source.repository';
import { BddServiceClientMongo } from '@services/db/mongo/repositories/client/client.repository';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';

interface InfraDeps { inversify: any; config: any }

export class BddServiceMongo {
  readonly tag: BddServiceTagMongo;
  readonly init: BddServiceInitMongo;
  readonly test: BddServiceTestMongo;
  readonly user: BddServiceUserMongo;
  readonly muscle: BddServiceMuscleMongo;
  readonly session: BddServiceSessionMongo;
  readonly program: BddServiceProgramMongo;
  readonly category: BddServiceCategoryMongo;
  readonly clientObjective: BddServiceClientObjectiveMongo;
  readonly clientActivityPreference: BddServiceClientActivityPreferenceMongo;
  readonly clientStatus: BddServiceClientStatusMongo;
  readonly clientLevel: BddServiceClientLevelMongo;
  readonly clientSource: BddServiceClientSourceMongo;
  readonly client: BddServiceClientMongo;
  readonly mealType: BddServiceMealTypeMongo;
  readonly mealDay: BddServiceMealDayMongo;
  readonly meal: BddServiceMealMongo;
  readonly mealPlan: BddServiceMealPlanMongo;
  readonly exercise: BddServiceExerciseMongo;
  readonly equipment: BddServiceEquipmentMongo;

  constructor({ inversify, config }: InfraDeps) {
    this.tag = new BddServiceTagMongo();
    this.user = new BddServiceUserMongo();
    this.muscle = new BddServiceMuscleMongo();
    this.session = new BddServiceSessionMongo();
    this.program = new BddServiceProgramMongo();
    this.category = new BddServiceCategoryMongo();
    this.clientObjective = new BddServiceClientObjectiveMongo();
    this.clientActivityPreference = new BddServiceClientActivityPreferenceMongo();
    this.clientStatus = new BddServiceClientStatusMongo();
    this.clientLevel = new BddServiceClientLevelMongo();
    this.clientSource = new BddServiceClientSourceMongo();
    this.client = new BddServiceClientMongo();
    this.mealType = new BddServiceMealTypeMongo();
    this.mealDay = new BddServiceMealDayMongo();
    this.meal = new BddServiceMealMongo();
    this.mealPlan = new BddServiceMealPlanMongo();
    this.exercise = new BddServiceExerciseMongo();
    this.test = new BddServiceTestMongo(inversify);
    this.equipment = new BddServiceEquipmentMongo();
    this.init = new BddServiceInitMongo(inversify, config);
  }
}
