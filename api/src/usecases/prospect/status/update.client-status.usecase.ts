// src/usecases/client/status/update.client-status.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';
import { UpdateClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

export class UpdateClientStatusUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientStatusUsecaseDto): Promise<ClientStatusUsecaseModel | null> {
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
        payload.slug = buildSlug({ label: dto.label, fallback: 'client-status' });
      }

      const updated = await this.inversify.bddService.clientStatus.update(dto.id, payload);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientStatusUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_STATUS_USECASE);
    }
  }
}
