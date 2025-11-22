// src/usecases/client/client/list.clients.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { ListProspectsUsecaseDto } from './prospect.usecase.dto';

interface ListProspectsResult {
  items: ProspectUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectsUsecaseDto = {}): Promise<ListProspectsResult> {
    try {
      const result = await this.inversify.bddService.prospect.list({
        q: dto.q,
        status: dto.status,
        levelId: dto.levelId,
        sourceId: dto.sourceId,
        createdBy: dto.createdBy,
        limit: dto.limit,
        page: dto.page,
      });
      return {
        items: result.items.map((item) => ({ ...item })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectsUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_PROSPECTS_USECASE);
    }
  }
}
