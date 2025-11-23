// src/usecases/prospect/source/update.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectSource } from '@services/db/models/prospect/source.model';
import { UpdateProspectSourceUsecaseDto } from './prospect-source.usecase.dto';

export class UpdateProspectSourceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateProspectSourceUsecaseDto): Promise<ProspectSource | null> {
    try {
      const payload: {
        slug?: string;
        locale?: string;
        label?: string;
        visibility?: 'private' | 'public';
      } = {
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      };

      if (dto.label) {
        payload.slug = buildSlug({ label: dto.label, fallback: 'source' });
      }

      const updated = await this.inversify.bddService.prospectSource.update(dto.id, payload);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateProspectSourceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_PROSPECT_SOURCE_USECASE);
    }
  }
}
