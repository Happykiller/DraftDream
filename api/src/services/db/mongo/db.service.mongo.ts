// src/services/db/mongo/db.service.mongo.ts
import { BddServiceInitMongo } from '@services/db/mongo/db.service.init.mongo';
import { BddServiceTestMongo } from '@services/db/mongo/db.service.test.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { BddServiceProgramRecordMongo } from '@services/db/mongo/repositories/program-record.repository';
import { BddServiceMealRecordMongo } from '@services/db/mongo/repositories/meal-record.repository';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { BddServiceProspectObjectiveMongo } from '@services/db/mongo/repositories/prospect/objective.repository';
import { BddServiceProspectActivityPreferenceMongo } from '@services/db/mongo/repositories/prospect/activity-preference.repository';
// import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/prospect/status.repository';
import { BddServiceProspectLevelMongo } from '@services/db/mongo/repositories/prospect/level.repository';
import { BddServiceProspectSourceMongo } from '@services/db/mongo/repositories/prospect/source.repository';
import { BddServiceProspectMongo } from '@services/db/mongo/repositories/prospect/prospect.repository';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';

interface InfraDeps { inversify: any; config: any }

export class BddServiceMongo {
  readonly tag: BddServiceTagMongo;
  readonly init: BddServiceInitMongo;
  readonly test: BddServiceTestMongo;
  readonly user: BddServiceUserMongo;
  readonly muscle: BddServiceMuscleMongo;
  readonly session: BddServiceSessionMongo;
  readonly program: BddServiceProgramMongo;
  readonly programRecord: BddServiceProgramRecordMongo;
  readonly mealRecord: BddServiceMealRecordMongo;
  readonly category: BddServiceCategoryMongo;
  readonly prospectObjective: BddServiceProspectObjectiveMongo;
  readonly prospectActivityPreference: BddServiceProspectActivityPreferenceMongo;
  // readonly clientStatus: BddServiceClientStatusMongo;
  readonly prospectLevel: BddServiceProspectLevelMongo;
  readonly prospectSource: BddServiceProspectSourceMongo;
  readonly prospect: BddServiceProspectMongo;
  readonly coachAthlete: BddServiceCoachAthleteMongo;
  readonly athleteInfo: BddServiceAthleteInfoMongo;
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
    this.programRecord = new BddServiceProgramRecordMongo();
    this.mealRecord = new BddServiceMealRecordMongo();
    this.category = new BddServiceCategoryMongo();
    this.prospectObjective = new BddServiceProspectObjectiveMongo();
    this.prospectActivityPreference = new BddServiceProspectActivityPreferenceMongo();
    // this.clientStatus = new BddServiceClientStatusMongo();
    this.prospectLevel = new BddServiceProspectLevelMongo();
    this.prospectSource = new BddServiceProspectSourceMongo();
    this.prospect = new BddServiceProspectMongo();
    this.coachAthlete = new BddServiceCoachAthleteMongo();
    this.athleteInfo = new BddServiceAthleteInfoMongo();
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
