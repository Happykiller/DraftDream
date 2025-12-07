// src/usecases/prospect/objective/update.prospect-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { UpdateProspectObjectiveUsecaseDto } from './prospect-objective.usecase.dto';

export class UpdateProspectObjectiveUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateProspectObjectiveUsecaseDto): Promise<ProspectObjective | null> {
    try {
      const payload: {
        slug?: string;
        locale?: string;
        label?: string;
        visibility?: 'PRIVATE' | 'PUBLIC';
      } = {
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      };

      if (dto.label) {
        payload.slug = buildSlug({ label: dto.label, fallback: 'objective' });
      }

      const updated = await this.inversify.bddService.prospectObjective.update(dto.id, payload);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateProspectObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_PROSPECT_OBJECTIVE_USECASE);
    }
  }
}
