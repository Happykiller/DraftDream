// src/usecases/prospect/level/create.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectLevel } from '@services/db/models/prospect/level.model';
import { CreateProspectLevelUsecaseDto } from './prospect-level.usecase.dto';
import { buildSlug } from '@src/common/slug.util';

export class CreateProspectLevelUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateProspectLevelUsecaseDto): Promise<ProspectLevel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'activity-preference' });
      const created = await this.inversify.bddService.prospectLevel.create({
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
        slug
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProspectLevelUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_PROSPECT_LEVEL_USECASE);
    }
  }
}
