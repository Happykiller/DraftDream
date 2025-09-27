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
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { CryptServiceReal } from '@services/crypt/crypt.service.real';
import { CreateUserUsecase } from '@usecases/user/create.user.usecase';
import { GetMuscleUsecase } from '@usecases/muscle/get.muscle.usecase';
import { ListMusclesUsecase } from '@usecases/muscle/list.muscles.usecase';
import { GetCategoryUsecase } from '@usecases/category/get.category.usecase';
import { CreateMuscleUsecase } from '@usecases/muscle/create.muscle.usecase';
import { UpdateMuscleUsecase } from '@usecases/muscle/update.muscle.usecase';
import { DeleteMuscleUsecase } from '@usecases/muscle/delete.muscle.usecase';
import { GetEquipmentUsecase } from '@usecases/equipment/get.equipment.usecase';
import { ListCategoriesUsecase } from '@usecases/category/list.category.usecase';
import { ListEquipmentUsecase } from '@usecases/equipment/list.equipment.usecase';
import { UpdateCategoryUsecase } from '@usecases/category/update.category.usecase';
import { CreateCategoryUsecase } from '@usecases/category/create.category.usecase';
import { DeleteCategoryUsecase } from '@usecases/category/delete.category.usecase';
import { CreateEquipmentUsecase } from '@usecases/equipment/create.equipment.usecase';
import { UpdateEquipmentUsecase } from '@usecases/equipment/update.equipment.usecase';
import { DeleteEquipmentUsecase } from '@usecases/equipment/delete.equipment.usecase';

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
  updateTagUsecase: UpdateTagUsecase;
  deleteTagUsecase: DeleteTagUsecase;
  createTagUsecase: CreateTagUsecase;
  getMuscleUsecase: GetMuscleUsecase;
  createUserUsecase: CreateUserUsecase;
  getCategoryUsecase: GetCategoryUsecase;
  listMusclesUsecase: ListMusclesUsecase;
  updateMuscleUsecase: UpdateMuscleUsecase;
  deleteMuscleUsecase: DeleteMuscleUsecase;
  getEquipmentUsecase: GetEquipmentUsecase;
  createMuscleUsecase: CreateMuscleUsecase;
  listEquipmentUsecase: ListEquipmentUsecase;
  updateCategoryUsecase: UpdateCategoryUsecase;
  createCategoryUsecase: CreateCategoryUsecase;
  listCategoriesUsecase: ListCategoriesUsecase;
  deleteCategoryUsecase: DeleteCategoryUsecase;
  createEquipmentUsecase: CreateEquipmentUsecase;
  updateEquipmentUsecase: UpdateEquipmentUsecase;
  deleteEquipmentUsecase: DeleteEquipmentUsecase;

  constructor() {
    /**
     * Services
     */
    this.loggerService = logger;
    this.cryptService = new CryptServiceReal();
    this.jwtService = new JwtServiceReal(config);
    this.bddService = new BddServiceMongo({
      inversify:this, 
      config:config
    });
    this.bddService.init.initConnection();

    /**
     * Usecases
     */
    this.authUsecase = new AuthUsecase(this);
    this.dbTestUsecase = new DbTestUsecase(this);
    this.getUserUsecase = new GetUserUsecase(this);
    this.createUserUsecase = new CreateUserUsecase(this);
    this.getCategoryUsecase = new GetCategoryUsecase(this);
    this.createCategoryUsecase = new CreateCategoryUsecase(this);
    this.listCategoriesUsecase = new ListCategoriesUsecase(this);
    this.updateCategoryUsecase = new UpdateCategoryUsecase(this);
    this.deleteCategoryUsecase = new DeleteCategoryUsecase(this);
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
  }
}

const inversify = new Inversify();

export default inversify;
