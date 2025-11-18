// src/usecases/client/activity-preference/get.client-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';
import { GetClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

export class GetClientActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetClientActivityPreferenceUsecaseDto): Promise<ClientActivityPreferenceUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.clientActivityPreference.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetClientActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
