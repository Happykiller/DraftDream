// src/usecases/client/client/delete.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

import { DeleteProspectUsecaseDto } from './prospect.usecase.dto';

export class DeleteProspectUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProspectUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospect.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_PROSPECT_USECASE);
    }
  }
}
