// src/usecases/prospect/level/list.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectLevel } from '@services/db/models/prospect/level.model';
import { ListProspectLevelsUsecaseDto } from './prospect-level.usecase.dto';

export interface ListProspectLevelsUsecaseResult {
  items: ProspectLevel[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectLevelsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectLevelsUsecaseDto = {}): Promise<ListProspectLevelsUsecaseResult> {
    try {
      const res = await this.inversify.bddService.prospectLevel.list(dto);
      return {
        items: res.items.map(item => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectLevelsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_PROSPECT_LEVELS_USECASE);
    }
  }
}
