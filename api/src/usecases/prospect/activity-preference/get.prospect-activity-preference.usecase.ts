// src/usecases/prospect/activity-preference/get.prospect-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { GetProspectActivityPreferenceDto } from '@services/db/dtos/prospect/activity-preference.dto';

export class GetProspectActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectActivityPreferenceDto): Promise<ProspectActivityPreference | null> {
    try {
      const found = await this.inversify.bddService.prospectActivityPreference.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
