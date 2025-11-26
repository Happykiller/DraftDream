// src/usecases/prospect/objective/delete.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteProspectObjectiveUsecaseDto } from './prospect-objective.usecase.dto';

export class DeleteProspectObjectiveUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProspectObjectiveUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospectObjective.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_PROSPECT_OBJECTIVE_USECASE);
    }
  }
}
