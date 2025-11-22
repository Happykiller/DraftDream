// src/usecases/prospect/objective/delete.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetProspectObjectiveDto } from '@services/db/dtos/prospect/objective.dto';

export class DeleteProspectObjectiveUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectObjectiveDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospectObjective.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_PROSPECT_OBJECTIVE_USECASE);
    }
  }
}
