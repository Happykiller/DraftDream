// src\usecase\user\create.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { GetUserUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@src/usecases/user/user.usecase.model';

export class GetUserUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(dto: GetUserUsecaseDto): Promise<UserUsecaseModel> {
    try {
      const user:User|null = await this.inversify.bddService.user.getUser({
        id: dto.id
      });

      if (!user) throw new Error(ERRORS.USER_NOT_FOUND);

      return {
        id: user.id,
        type: user.type,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        company: user.company,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        is_active: user.is_active,
        createdBy: user.createdBy,
      };
    } catch (e) {
      this.inversify.loggerService.error(`GetUserUsecase#execute=>${e.message}`);
      throw new Error(ERRORS.GET_USER_USECASE);
    }
  }
}
