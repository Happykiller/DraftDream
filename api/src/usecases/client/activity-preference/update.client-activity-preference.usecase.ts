// src/usecases/client/activity-preference/update.client-activity-preference.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';
import { UpdateClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

export class UpdateClientActivityPreferenceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientActivityPreferenceUsecaseDto): Promise<ClientActivityPreferenceUsecaseModel | null> {
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

      if (dto.slug !== undefined || dto.label !== undefined) {
        payload.slug = buildSlug({
          slug: dto.slug,
          label: dto.label,
          fallback: 'activity-preference',
        });
      }

      const updated = await this.inversify.bddService.clientActivityPreference.update(dto.id, payload);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientActivityPreferenceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    }
  }
}
