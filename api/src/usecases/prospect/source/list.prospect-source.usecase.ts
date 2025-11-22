// src/usecases/prospect/source/list.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectSource } from '@services/db/models/prospect/source.model';
import { ListProspectSourcesDto } from '@services/db/dtos/prospect/source.dto';

export interface ListProspectSourcesUsecaseResult {
  items: ProspectSource[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectSourcesUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectSourcesDto = {}): Promise<ListProspectSourcesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.prospectSource.list(dto);
      return {
        items: res.items.map(item => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectSourcesUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_PROSPECT_SOURCES_USECASE);
    }
  }
}
