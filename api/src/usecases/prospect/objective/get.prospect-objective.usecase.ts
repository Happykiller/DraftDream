// src/usecases/prospect/objective/get.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { GetProspectObjectiveDto } from '@services/db/dtos/prospect/objective.dto';

export class GetProspectObjectiveUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectObjectiveDto): Promise<ProspectObjective | null> {
    try {
      const found = await this.inversify.bddService.prospectObjective.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_PROSPECT_OBJECTIVE_USECASE);
    }
  }
}
