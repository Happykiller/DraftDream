// src/usecases/prospect/objective/create.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { buildSlug } from '@src/common/slug.util';
import { CreateProspectObjectiveUsecaseDto } from './prospect-objective.usecase.dto';

export class CreateProspectObjectiveUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateProspectObjectiveUsecaseDto): Promise<ProspectObjective | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'activity-preference' });
      const created = await this.inversify.bddService.prospectObjective.create({
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
        slug,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProspectObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_PROSPECT_OBJECTIVE_USECASE);
    }
  }
}
