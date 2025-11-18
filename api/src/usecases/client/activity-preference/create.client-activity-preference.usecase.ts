// src/usecases/client/activity-preference/create.client-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';
import { CreateClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

export class CreateClientActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateClientActivityPreferenceUsecaseDto): Promise<ClientActivityPreferenceUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.clientActivityPreference.create({
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateClientActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
