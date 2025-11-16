// src/usecases/client/activity-preference/delete.client-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

export class DeleteClientActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteClientActivityPreferenceUsecaseDto): Promise<boolean> {
    try {
      return this.inversify.bddService.clientActivityPreference.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteClientActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
