// src/usecases/prospect/activity-preference/list.prospect-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { ListProspectActivityPreferencesDto } from '@services/db/dtos/prospect/activity-preference.dto';

export interface ListProspectActivityPreferencesUsecaseResult {
  items: ProspectActivityPreference[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectActivityPreferencesUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectActivityPreferencesDto = {}): Promise<ListProspectActivityPreferencesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.prospectActivityPreference.list(dto);
      return {
        items: res.items.map(item => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectActivityPreferencesUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_PROSPECT_ACTIVITY_PREFERENCES_USECASE);
    }
  }
}
