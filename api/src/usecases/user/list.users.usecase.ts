// src/usecases/user/list.users.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import type { User } from '@services/db/models/user.model';
import { ListUserUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';

export class ListUsersUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListUserUsecaseDto = {}): Promise<{ items: UserUsecaseModel[]; total: number; page: number; limit: number }> {
    try {
      const res = await this.inversify.bddService.user.listUsers({
        q: dto.q,
        type: dto.type,
        companyName: dto.companyName,
        is_active: dto.is_active,
        createdBy: dto.createdBy,
        limit: dto.limit,
        page: dto.page,
        sort: dto.sort,
      });

      return {
        items: res.items.map(this.mapToUsecase),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListUsersUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_USERS_USECASE);
    }
  }

  private mapToUsecase(this: void, u: User): UserUsecaseModel {
    return {
      id: u.id,
      type: u.type,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      company: u.company,
      is_active: u.is_active,
      createdBy: u.createdBy,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
