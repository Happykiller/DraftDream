// src/usecases/client/level/get.client-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';
import { GetClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';

export class GetClientLevelUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetClientLevelUsecaseDto): Promise<ClientLevelUsecaseModel | null> {
    try {
      const result = await this.inversify.bddService.clientLevel.get({ id: dto.id });
      return result ? { ...result } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetClientLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_CLIENT_LEVEL_USECASE);
    }
  }
}
