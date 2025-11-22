// src/usecases/client/objective/get.client-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';
import { GetClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';

export class GetClientObjectiveUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetClientObjectiveUsecaseDto): Promise<ClientObjectiveUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.clientObjective.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetClientObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_CLIENT_OBJECTIVE_USECASE);
    }
  }
}
