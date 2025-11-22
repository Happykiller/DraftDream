// src/usecases/client/activity-preference/list.client-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';
import { ListClientActivityPreferencesUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

export interface ListClientActivityPreferencesUsecaseResult {
  items: ClientActivityPreferenceUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListClientActivityPreferencesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListClientActivityPreferencesUsecaseDto = {}): Promise<ListClientActivityPreferencesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.clientActivityPreference.list(dto);
      return {
        items: res.items.map(item => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListClientActivityPreferencesUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_CLIENT_ACTIVITY_PREFERENCES_USECASE);
    }
  }
}
