// src/usecases/client/status/get.client-status.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';
import { GetClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

export class GetClientStatusUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetClientStatusUsecaseDto): Promise<ClientStatusUsecaseModel | null> {
    try {
      const result = await this.inversify.bddService.clientStatus.get({ id: dto.id });
      return result ? { ...result } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetClientStatusUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_CLIENT_STATUS_USECASE);
    }
  }
}
