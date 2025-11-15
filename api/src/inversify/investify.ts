// src\inversify\investify.ts
import { Db } from 'mongodb';
import { config } from '@src/config';
import { logger } from '@src/common/logger';
import { JwtService } from '@services/jwt/jwt.service';
import { AuthUsecase } from '@usecases/auth/auth.usecase';
import { CryptService } from '@services/crypt/crypt.service';
import { GetTagUsecase } from '@usecases/tag/get.tag.usecase';
import { JwtServiceReal } from '@services/jwt/jwt.service.real';
import { GetUserUsecase } from '@usecases/user/get.user.usecase';
import { DbTestUsecase } from '@usecases/default/db.test.usecase';
import { ListTagsUsecase } from '@usecases/tag/list.tags.usecase';
import { CreateTagUsecase } from '@usecases/tag/create.tag.usecase';
import { UpdateTagUsecase } from '@usecases/tag/update.tag.usecase';
import { DeleteTagUsecase } from '@usecases/tag/delete.tag.usecase';
import { ListUsersUsecase } from '@usecases/user/list.users.usecase';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { CryptServiceReal } from '@services/crypt/crypt.service.real';
import { UpdateUserUsecase } from '@usecases/user/update.user.usecase';
import { CreateUserUsecase } from '@usecases/user/create.user.usecase';
import { GetMuscleUsecase } from '@usecases/muscle/get.muscle.usecase';
import { GetSessionUsecase } from '@usecases/session/get.session.usecase';
import { ListMusclesUsecase } from '@usecases/muscle/list.muscles.usecase';
import { GetCategoryUsecase } from '@usecases/category/get.category.usecase';
import { CreateMuscleUsecase } from '@usecases/muscle/create.muscle.usecase';
import { UpdateMuscleUsecase } from '@usecases/muscle/update.muscle.usecase';
import { DeleteMuscleUsecase } from '@usecases/muscle/delete.muscle.usecase';
import { GetExerciseUsecase } from '@usecases/exercise/get.exercise.usecase';
import { ListSessionsUsecase } from '@usecases/session/list.sessions.usecase';
import { DeleteSessionUsecase } from '@usecases/session/delete.session.usecase';
import { UpdateSessionUsecase } from '@usecases/session/update.session.usecase';
import { CreateSessionUsecase } from '@usecases/session/create.session.usecase';
import { GetProgramUsecase } from '@usecases/program/get.program.usecase';
import { ListProgramsUsecase } from '@usecases/program/list.programs.usecase';
import { DeleteProgramUsecase } from '@usecases/program/delete.program.usecase';
import { UpdateProgramUsecase } from '@usecases/program/update.program.usecase';
import { CreateProgramUsecase } from '@usecases/program/create.program.usecase';
import { GetEquipmentUsecase } from '@usecases/equipment/get.equipment.usecase';
import { ListExercisesUsecase } from '@usecases/exercise/list.exercises.usecase';
import { ListCategoriesUsecase } from '@usecases/category/list.category.usecase';
import { ListEquipmentUsecase } from '@usecases/equipment/list.equipment.usecase';
import { DeleteExerciseUsecase } from '@usecases/exercise/delete.exercise.usecase';
import { UpdateCategoryUsecase } from '@usecases/category/update.category.usecase';
import { CreateCategoryUsecase } from '@usecases/category/create.category.usecase';
import { DeleteCategoryUsecase } from '@usecases/category/delete.category.usecase';
import { GetClientObjectiveUsecase } from '@usecases/client/objective/get.client-objective.usecase';
import { ListClientObjectivesUsecase } from '@usecases/client/objective/list.client-objective.usecase';
import { CreateClientObjectiveUsecase } from '@usecases/client/objective/create.client-objective.usecase';
import { UpdateClientObjectiveUsecase } from '@usecases/client/objective/update.client-objective.usecase';
import { DeleteClientObjectiveUsecase } from '@usecases/client/objective/delete.client-objective.usecase';
import { GetMealTypeUsecase } from '@usecases/meal-type/get.meal-type.usecase';
import { ListMealTypesUsecase } from '@usecases/meal-type/list.meal-type.usecase';
import { CreateMealTypeUsecase } from '@usecases/meal-type/create.meal-type.usecase';
import { UpdateMealTypeUsecase } from '@usecases/meal-type/update.meal-type.usecase';
import { DeleteMealTypeUsecase } from '@usecases/meal-type/delete.meal-type.usecase';
import { CreateExerciseUsecase } from '@usecases/exercise/create.exercise.usecase';
import { UpdateExerciseUsecase } from '@usecases/exercise/update.exercise.usecase';
import { CreateEquipmentUsecase } from '@usecases/equipment/create.equipment.usecase';
import { UpdateEquipmentUsecase } from '@usecases/equipment/update.equipment.usecase';
import { DeleteEquipmentUsecase } from '@usecases/equipment/delete.equipment.usecase';
import { CreateMealUsecase } from '@usecases/meal/create.meal.usecase';
import { GetMealUsecase } from '@usecases/meal/get.meal.usecase';
import { ListMealsUsecase } from '@usecases/meal/list.meal.usecase';
import { UpdateMealUsecase } from '@usecases/meal/update.meal.usecase';
import { DeleteMealUsecase } from '@usecases/meal/delete.meal.usecase';
import { CreateMealDayUsecase } from '@usecases/meal-day/create.meal-day.usecase';
import { GetMealDayUsecase } from '@usecases/meal-day/get.meal-day.usecase';
import { ListMealDaysUsecase } from '@usecases/meal-day/list.meal-days.usecase';
import { UpdateMealDayUsecase } from '@usecases/meal-day/update.meal-day.usecase';
import { DeleteMealDayUsecase } from '@usecases/meal-day/delete.meal-day.usecase';
import { GetMealPlanUsecase } from '@usecases/meal-plan/get.meal-plan.usecase';
import { ListMealPlansUsecase } from '@usecases/meal-plan/list.meal-plans.usecase';
import { CreateMealPlanUsecase } from '@usecases/meal-plan/create.meal-plan.usecase';
import { UpdateMealPlanUsecase } from '@usecases/meal-plan/update.meal-plan.usecase';
import { DeleteMealPlanUsecase } from '@usecases/meal-plan/delete.meal-plan.usecase';

export class Inversify {
  mongo: Db;
  loggerService: any;
  jwtService: JwtService;
  authUsecase: AuthUsecase;
  cryptService: CryptService;
  bddService: BddServiceMongo;
  dbTestUsecase: DbTestUsecase;
  getTagUsecase: GetTagUsecase;
  getUserUsecase: GetUserUsecase;
  listTagsUsecase: ListTagsUsecase;
  listUsersUsecase: ListUsersUsecase;
  updateTagUsecase: UpdateTagUsecase;
  deleteTagUsecase: DeleteTagUsecase;
  createTagUsecase: CreateTagUsecase;
  getMuscleUsecase: GetMuscleUsecase;
  updateUserUsecase: UpdateUserUsecase;
  createUserUsecase: CreateUserUsecase;
  getSessionUsecase: GetSessionUsecase;
  getProgramUsecase: GetProgramUsecase;
  getCategoryUsecase: GetCategoryUsecase;
  listMusclesUsecase: ListMusclesUsecase;
  getExerciseUsecase: GetExerciseUsecase;
  updateMuscleUsecase: UpdateMuscleUsecase;
  deleteMuscleUsecase: DeleteMuscleUsecase;
  getEquipmentUsecase: GetEquipmentUsecase;
  createMuscleUsecase: CreateMuscleUsecase;
  listSessionsUsecase: ListSessionsUsecase;
  listProgramsUsecase: ListProgramsUsecase;
  listEquipmentUsecase: ListEquipmentUsecase;
  listExercisesUsecase: ListExercisesUsecase;
  createSessionUsecase: CreateSessionUsecase;
  deleteSessionUsecase: DeleteSessionUsecase;
  updateSessionUsecase: UpdateSessionUsecase;
  createProgramUsecase: CreateProgramUsecase;
  deleteProgramUsecase: DeleteProgramUsecase;
  updateProgramUsecase: UpdateProgramUsecase;
  updateCategoryUsecase: UpdateCategoryUsecase;
  createCategoryUsecase: CreateCategoryUsecase;
  listCategoriesUsecase: ListCategoriesUsecase;
  deleteCategoryUsecase: DeleteCategoryUsecase;
  getClientObjectiveUsecase: GetClientObjectiveUsecase;
  createClientObjectiveUsecase: CreateClientObjectiveUsecase;
  listClientObjectivesUsecase: ListClientObjectivesUsecase;
  updateClientObjectiveUsecase: UpdateClientObjectiveUsecase;
  deleteClientObjectiveUsecase: DeleteClientObjectiveUsecase;
  getMealTypeUsecase: GetMealTypeUsecase;
  listMealTypesUsecase: ListMealTypesUsecase;
  createMealTypeUsecase: CreateMealTypeUsecase;
  updateMealTypeUsecase: UpdateMealTypeUsecase;
  deleteMealTypeUsecase: DeleteMealTypeUsecase;
  createExerciseUsecase: CreateExerciseUsecase;
  deleteExerciseUsecase: DeleteExerciseUsecase;
  updateExerciseUsecase: UpdateExerciseUsecase;
  createEquipmentUsecase: CreateEquipmentUsecase;
  updateEquipmentUsecase: UpdateEquipmentUsecase;
  deleteEquipmentUsecase: DeleteEquipmentUsecase;
  createMealUsecase: CreateMealUsecase;
  getMealUsecase: GetMealUsecase;
  listMealsUsecase: ListMealsUsecase;
  updateMealUsecase: UpdateMealUsecase;
  deleteMealUsecase: DeleteMealUsecase;
  createMealDayUsecase: CreateMealDayUsecase;
  getMealDayUsecase: GetMealDayUsecase;
  listMealDaysUsecase: ListMealDaysUsecase;
  updateMealDayUsecase: UpdateMealDayUsecase;
  deleteMealDayUsecase: DeleteMealDayUsecase;
  createMealPlanUsecase: CreateMealPlanUsecase;
  getMealPlanUsecase: GetMealPlanUsecase;
  listMealPlansUsecase: ListMealPlansUsecase;
  updateMealPlanUsecase: UpdateMealPlanUsecase;
  deleteMealPlanUsecase: DeleteMealPlanUsecase;
  

  constructor() {
    /**
     * Services
     */
    this.loggerService = logger;
    this.cryptService = new CryptServiceReal();
    this.jwtService = new JwtServiceReal(config);
    this.bddService = new BddServiceMongo({
      inversify: this,
      config,
    });
    void this.bddService.init.initConnection();

    /**
     * Usecases
     */
    this.authUsecase = new AuthUsecase(this);
    this.dbTestUsecase = new DbTestUsecase(this);
    // usecases user
    this.getUserUsecase = new GetUserUsecase(this);
    this.createUserUsecase = new CreateUserUsecase(this);
    this.listUsersUsecase = new ListUsersUsecase(this);
    this.updateUserUsecase = new UpdateUserUsecase(this);
    // usecases category
    this.getCategoryUsecase = new GetCategoryUsecase(this);
    this.createCategoryUsecase = new CreateCategoryUsecase(this);
    this.listCategoriesUsecase = new ListCategoriesUsecase(this);
    this.updateCategoryUsecase = new UpdateCategoryUsecase(this);
    this.deleteCategoryUsecase = new DeleteCategoryUsecase(this);
    // usecases client objective
    this.getClientObjectiveUsecase = new GetClientObjectiveUsecase(this);
    this.createClientObjectiveUsecase = new CreateClientObjectiveUsecase(this);
    this.listClientObjectivesUsecase = new ListClientObjectivesUsecase(this);
    this.updateClientObjectiveUsecase = new UpdateClientObjectiveUsecase(this);
    this.deleteClientObjectiveUsecase = new DeleteClientObjectiveUsecase(this);
    // usecases meal type
    this.createMealTypeUsecase = new CreateMealTypeUsecase(this);
    this.getMealTypeUsecase = new GetMealTypeUsecase(this);
    this.listMealTypesUsecase = new ListMealTypesUsecase(this);
    this.updateMealTypeUsecase = new UpdateMealTypeUsecase(this);
    this.deleteMealTypeUsecase = new DeleteMealTypeUsecase(this);
    // usecases meal
    this.createMealUsecase = new CreateMealUsecase(this);
    this.getMealUsecase = new GetMealUsecase(this);
    this.listMealsUsecase = new ListMealsUsecase(this);
    this.updateMealUsecase = new UpdateMealUsecase(this);
    this.deleteMealUsecase = new DeleteMealUsecase(this);
    // usecases meal day
    this.createMealDayUsecase = new CreateMealDayUsecase(this);
    this.getMealDayUsecase = new GetMealDayUsecase(this);
    this.listMealDaysUsecase = new ListMealDaysUsecase(this);
    this.updateMealDayUsecase = new UpdateMealDayUsecase(this);
    this.deleteMealDayUsecase = new DeleteMealDayUsecase(this);
    // usecases meal plan
    this.createMealPlanUsecase = new CreateMealPlanUsecase(this);
    this.getMealPlanUsecase = new GetMealPlanUsecase(this);
    this.listMealPlansUsecase = new ListMealPlansUsecase(this);
    this.updateMealPlanUsecase = new UpdateMealPlanUsecase(this);
    this.deleteMealPlanUsecase = new DeleteMealPlanUsecase(this);
    // usecases equipment
    this.createEquipmentUsecase = new CreateEquipmentUsecase(this);
    this.getEquipmentUsecase = new GetEquipmentUsecase(this);
    this.listEquipmentUsecase = new ListEquipmentUsecase(this);
    this.updateEquipmentUsecase = new UpdateEquipmentUsecase(this);
    this.deleteEquipmentUsecase = new DeleteEquipmentUsecase(this);
    // usecases muscle
    this.createMuscleUsecase = new CreateMuscleUsecase(this);
    this.getMuscleUsecase = new GetMuscleUsecase(this);
    this.listMusclesUsecase = new ListMusclesUsecase(this);
    this.updateMuscleUsecase = new UpdateMuscleUsecase(this);
    this.deleteMuscleUsecase = new DeleteMuscleUsecase(this);
    // usecases tag
    this.createTagUsecase = new CreateTagUsecase(this);
    this.getTagUsecase = new GetTagUsecase(this);
    this.listTagsUsecase = new ListTagsUsecase(this);
    this.updateTagUsecase = new UpdateTagUsecase(this);
    this.deleteTagUsecase = new DeleteTagUsecase(this);
    // usecase exercise
    this.createExerciseUsecase = new CreateExerciseUsecase(this);
    this.getExerciseUsecase = new GetExerciseUsecase(this);
    this.listExercisesUsecase = new ListExercisesUsecase(this);
    this.deleteExerciseUsecase = new DeleteExerciseUsecase(this);
    this.updateExerciseUsecase = new UpdateExerciseUsecase(this);
    // usecase session
    this.createSessionUsecase = new CreateSessionUsecase(this);
    this.getSessionUsecase = new GetSessionUsecase(this);
    this.listSessionsUsecase = new ListSessionsUsecase(this);
    this.deleteSessionUsecase = new DeleteSessionUsecase(this);
    this.updateSessionUsecase = new UpdateSessionUsecase(this);
    // usecase program
    this.createProgramUsecase = new CreateProgramUsecase(this);
    this.getProgramUsecase = new GetProgramUsecase(this);
    this.listProgramsUsecase = new ListProgramsUsecase(this);
    this.deleteProgramUsecase = new DeleteProgramUsecase(this);
    this.updateProgramUsecase = new UpdateProgramUsecase(this);
  }
}

const inversify = new Inversify();

export default inversify;
