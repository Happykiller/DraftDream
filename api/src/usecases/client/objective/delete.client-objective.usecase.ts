// src/usecases/client/objective/delete.client-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';

export class DeleteClientObjectiveUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteClientObjectiveUsecaseDto): Promise<boolean> {
    try {
      return this.inversify.bddService.clientObjective.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteClientObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_CLIENT_OBJECTIVE_USECASE);
    }
  }
}
