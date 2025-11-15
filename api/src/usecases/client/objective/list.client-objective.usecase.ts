// src/usecases/client/objective/list.client-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';
import { ListClientObjectivesUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';

export interface ListClientObjectivesUsecaseResult {
  items: ClientObjectiveUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListClientObjectivesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListClientObjectivesUsecaseDto = {}): Promise<ListClientObjectivesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.clientObjective.list(dto);
      return {
        items: res.items.map(item => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListClientObjectivesUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_CLIENT_OBJECTIVES_USECASE);
    }
  }
}
