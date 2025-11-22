// src/usecases/client/client/get.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ClientUsecaseModel } from './client.usecase.model';
import { GetClientUsecaseDto } from './client.usecase.dto';

export class GetClientUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetClientUsecaseDto): Promise<ClientUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.client.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetClientUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_CLIENT_USECASE);
    }
  }
}
