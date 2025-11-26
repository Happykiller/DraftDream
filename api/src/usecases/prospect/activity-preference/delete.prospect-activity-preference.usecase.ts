// src/usecases/prospect/activity-preference/delete.prospect-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteProspectActivityPreferenceUsecaseDto } from './prospect-activity.usecase.dto';

export class DeleteProspectActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProspectActivityPreferenceUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospectActivityPreference.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
