// src/usecases/client/client/delete.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { DeleteClientUsecaseDto } from './client.usecase.dto';

export class DeleteClientUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteClientUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.client.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteClientUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_CLIENT_USECASE);
    }
  }
}
