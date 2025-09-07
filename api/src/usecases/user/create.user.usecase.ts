// src\usecase\user\create.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { UserPojo } from '@services/db/mongo/user/service.db.mongo.user';
import { UserUsecaseModel } from '@usecases/user/model/user.usecase.model';
import { CreateUserUsecaseDto } from '@usecases/user/dto/create.user.usecase.dto';

export class CreateUserUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(dto: CreateUserUsecaseDto): Promise<UserUsecaseModel> {
    try {
      const hashed = await this.inversify.cryptService.hash({ message: dto.password });
      const toCreate = { ...dto, password: hashed };
      const userPojo:UserPojo = await this.inversify.bddService.createUser(toCreate);

      return {
        id: userPojo._id,
        type: userPojo.type,
        first_name: userPojo.first_name,
        last_name: userPojo.last_name,
        email: userPojo.email,
        phone: userPojo.phone,
        address: userPojo.address,
        company: userPojo.company,
        createdAt: userPojo.createdAt,
        updatedAt: userPojo.updatedAt
      };
    } catch (e) {
      this.inversify.loggerService.error(`CreateUserUsecase#execute=>${e.message}`);
      throw new Error(ERRORS.CREATE_USER_USECASE);
    }
  }
}
