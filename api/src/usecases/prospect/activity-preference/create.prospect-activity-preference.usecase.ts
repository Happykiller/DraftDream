// src/usecases/prospect/activity-preference/create.prospect-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { buildSlug } from '@src/common/slug.util';
import { CreateProspectActivityPreferenceUsecaseDto } from './prospect-activity.usecase.dto';

export class CreateProspectActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateProspectActivityPreferenceUsecaseDto): Promise<ProspectActivityPreference | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'activity-preference' });
      const created = await this.inversify.bddService.prospectActivityPreference.create({
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
        slug,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProspectActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
