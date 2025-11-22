// src/usecases/client/level/list.client-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';
import { ListClientLevelsUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';

export class ListClientLevelsUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListClientLevelsUsecaseDto = {}): Promise<{
    items: ClientLevelUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const res = await this.inversify.bddService.clientLevel.list({
        q: dto.q,
        locale: dto.locale,
        createdBy: dto.createdBy,
        visibility: dto.visibility,
        limit: dto.limit,
        page: dto.page,
      });
      return {
        items: res?.items ?? [],
        total: res?.total ?? 0,
        page: res?.page ?? dto.page ?? 1,
        limit: res?.limit ?? dto.limit ?? 20,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListClientLevelsUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_CLIENT_LEVELS_USECASE);
    }
  }
}
