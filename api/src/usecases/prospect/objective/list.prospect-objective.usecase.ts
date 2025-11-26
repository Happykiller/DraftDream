// src/usecases/prospect/objective/list.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { ListProspectObjectivesUsecaseDto } from './prospect-objective.usecase.dto';

export interface ListProspectObjectivesUsecaseResult {
  items: ProspectObjective[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectObjectivesUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectObjectivesUsecaseDto = {}): Promise<ListProspectObjectivesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.prospectObjective.list(dto);
      return {
        items: res.items.map(item => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectObjectivesUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_PROSPECT_OBJECTIVES_USECASE);
    }
  }
}
