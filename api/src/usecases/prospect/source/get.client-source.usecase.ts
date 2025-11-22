// src/usecases/client/source/get.client-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';
import { GetClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';

export class GetClientSourceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetClientSourceUsecaseDto): Promise<ClientSourceUsecaseModel | null> {
    try {
      const result = await this.inversify.bddService.clientSource.get({ id: dto.id });
      return result ? { ...result } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetClientSourceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_CLIENT_SOURCE_USECASE);
    }
  }
}
