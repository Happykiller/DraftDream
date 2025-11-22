// src/usecases/prospect/source/create.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectSource } from '@services/db/models/prospect/source.model';
import { buildSlug } from '@src/common/slug.util';
import { CreateProspectSourceUsecaseDto } from './prospect-source.usecase.dto';

export class CreateProspectSourceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateProspectSourceUsecaseDto): Promise<ProspectSource | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'activity-preference' });
      const created = await this.inversify.bddService.prospectSource.create({
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
        slug
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProspectSourceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_PROSPECT_SOURCE_USECASE);
    }
  }
}
