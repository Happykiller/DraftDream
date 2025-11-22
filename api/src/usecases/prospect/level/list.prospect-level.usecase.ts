// src/usecases/prospect/level/list.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ProspectLevel } from '@services/db/models/prospect/level.model';
import { ListProspectLevelsDto } from '@services/db/dtos/prospect/level.dto';

export interface ListProspectLevelsUsecaseResult {
  items: ProspectLevel[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectLevelsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectLevelsDto = {}): Promise<ListProspectLevelsUsecaseResult> {
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
      throw new Error(ERRORS.LIST_PROSPECT_LEVELS_USECASE);
    }
  }
}
