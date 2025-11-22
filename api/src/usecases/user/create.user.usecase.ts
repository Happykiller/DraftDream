// src\usecase\user\create.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { UserUsecaseModel } from '@src/usecases/user/user.usecase.model';
import { CreateUserUsecaseDto } from '@src/usecases/user/user.usecase.dto';

export class CreateUserUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(dto: CreateUserUsecaseDto): Promise<UserUsecaseModel> {
    try {
      const hashed = await this.inversify.cryptService.hash({ message: dto.password });
      const toCreate = { ...dto, password: hashed };
      const user: User = await this.inversify.bddService.user.createUser(toCreate);

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
      this.inversify.loggerService.error(`CreateUserUsecase#execute=>${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_USER_USECASE);
    }
  }
}
