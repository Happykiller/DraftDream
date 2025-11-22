// src/usecases/prospect/objective/list.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { ListProspectObjectivesDto } from '@services/db/dtos/prospect/objective.dto';

export interface ListProspectObjectivesUsecaseResult {
  items: ProspectObjective[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectObjectivesUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectObjectivesDto = {}): Promise<ListProspectObjectivesUsecaseResult> {
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
      throw new Error(ERRORS.LIST_PROSPECT_OBJECTIVES_USECASE);
    }
  }
}
