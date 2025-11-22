// src/usecases/client/level/delete.client-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';

export class DeleteClientLevelUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteClientLevelUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.clientLevel.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteClientLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_CLIENT_LEVEL_USECASE);
    }
  }
}
