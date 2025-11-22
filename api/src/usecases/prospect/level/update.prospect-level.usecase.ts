// src/usecases/prospect/level/update.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectLevel } from '@services/db/models/prospect/level.model';
import { UpdateProspectLevelUsecaseDto } from './prospect-level.usecase.dto';

export class UpdateProspectLevelUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(id: string, dto: UpdateProspectLevelUsecaseDto): Promise<ProspectLevel | null> {
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
        payload.slug = buildSlug({ label: dto.label, fallback: 'client-level' });
      }

      const updated = await this.inversify.bddService.prospectLevel.update(id, payload);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateProspectLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_PROSPECT_LEVEL_USECASE);
    }
  }
}
