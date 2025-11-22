// src/usecases/client/source/list.client-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';
import { ListClientSourcesUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';

export class ListClientSourcesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListClientSourcesUsecaseDto = {}): Promise<{
    items: ClientSourceUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const res = await this.inversify.bddService.clientSource.list({
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
      this.inversify.loggerService.error(`ListClientSourcesUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_CLIENT_SOURCES_USECASE);
    }
  }
}
