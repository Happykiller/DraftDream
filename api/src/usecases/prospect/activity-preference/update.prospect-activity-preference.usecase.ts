// src/usecases/prospect/activity-preference/update.prospect-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { UpdateProspectActivityPreferenceUsecaseDto } from './prospect-activity.usecase.dto';

export class UpdateProspectActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateProspectActivityPreferenceUsecaseDto): Promise<ProspectActivityPreference | null> {
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
        payload.slug = buildSlug({ label: dto.label, fallback: 'activity-preference' });
      }

      const updated = await this.inversify.bddService.prospectActivityPreference.update(dto.id, payload);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateProspectActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
