// src/usecases/client/level/update.client-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';
import { UpdateClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';

export class UpdateClientLevelUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientLevelUsecaseDto): Promise<ClientLevelUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.clientLevel.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_LEVEL_USECASE);
    }
  }
}
