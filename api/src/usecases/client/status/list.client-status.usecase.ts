// src/usecases/client/status/list.client-status.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';
import { ListClientStatusesUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

export class ListClientStatusesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListClientStatusesUsecaseDto = {}): Promise<{
    items: ClientStatusUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const res = await this.inversify.bddService.clientStatus.list({
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
      this.inversify.loggerService.error(`ListClientStatusesUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_CLIENT_STATUSES_USECASE);
    }
  }
}
