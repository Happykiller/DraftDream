// src/usecases/client/status/delete.client-status.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

export class DeleteClientStatusUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteClientStatusUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.clientStatus.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteClientStatusUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_CLIENT_STATUS_USECASE);
    }
  }
}
