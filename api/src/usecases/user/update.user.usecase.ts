// src/usecases/user/update.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { UpdateUserUsecaseDto } from '@usecases/user/user.usecase.dto';

export class UpdateUserUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateUserUsecaseDto): Promise<UserUsecaseModel> {
    try {
      const updated: User | null = await this.inversify.bddService.user.updateUser(dto.id, {
        type: dto.type,
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        company: dto.company,
        is_active: dto.is_active,
      });

      if (!updated) throw new Error(ERRORS.USER_NOT_FOUND);

      return {
        id: updated.id,
        type: updated.type,
        first_name: updated.first_name,
        last_name: updated.last_name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        company: updated.company,
        is_active: updated.is_active,
        createdBy: updated.createdBy,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateUserUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_USER_USECASE);
    }
  }
}
