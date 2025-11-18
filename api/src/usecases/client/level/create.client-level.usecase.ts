// src/usecases/client/level/create.client-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';
import { CreateClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';

export class CreateClientLevelUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateClientLevelUsecaseDto): Promise<ClientLevelUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.clientLevel.create({
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateClientLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_CLIENT_LEVEL_USECASE);
    }
  }
}
