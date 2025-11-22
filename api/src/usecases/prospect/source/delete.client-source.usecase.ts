// src/usecases/client/source/delete.client-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';

export class DeleteClientSourceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteClientSourceUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.clientSource.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteClientSourceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_CLIENT_SOURCE_USECASE);
    }
  }
}
