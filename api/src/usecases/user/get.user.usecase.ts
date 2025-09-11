// src\usecase\user\create.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { UserPojo } from '@services/db/mongo/user/service.db.mongo.user';
import { UserUsecaseModel } from '@usecases/user/model/user.usecase.model';
import { GetUserUsecaseDto } from '@usecases/user/dto/get.user.usecase.dto';

export class GetUserUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(dto: GetUserUsecaseDto): Promise<UserUsecaseModel> {
    try {
      const userPojo:UserPojo = await this.inversify.bddService.getById(dto.id);

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
      this.inversify.loggerService.error(`GetUserUsecase#execute=>${e.message}`);
      throw new Error(ERRORS.CREATE_USER_USECASE);
    }
  }
}
