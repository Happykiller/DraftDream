// src/usecases/client/status/update.client-status.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';
import { UpdateClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

export class UpdateClientStatusUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientStatusUsecaseDto): Promise<ClientStatusUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.clientStatus.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientStatusUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_STATUS_USECASE);
    }
  }
}
