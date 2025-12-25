// src/usecases/prospect/prospect/delete.prospect.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

import { DeleteProspectUsecaseDto } from './prospect.usecase.dto';

/**
 * Handles prospect deletion operations.
 */
export class DeleteProspectUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Soft-deletes a prospect record by id.
   */
  async execute(dto: DeleteProspectUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospect.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_PROSPECT_USECASE);
    }
  }
}
