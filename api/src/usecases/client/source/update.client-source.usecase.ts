// src/usecases/client/source/update.client-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';
import { UpdateClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';

export class UpdateClientSourceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientSourceUsecaseDto): Promise<ClientSourceUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.clientSource.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientSourceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_SOURCE_USECASE);
    }
  }
}
