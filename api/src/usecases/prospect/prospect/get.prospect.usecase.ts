// src/usecases/prospect/prospect/get.prospect.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { GetProspectUsecaseDto } from './prospect.usecase.dto';

/**
 * Retrieves a single prospect while enforcing ownership rules.
 */
export class GetProspectUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Returns the prospect when the session is authorized to view it.
   */
  async execute(dto: GetProspectUsecaseDto): Promise<ProspectUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const found = await this.inversify.bddService.prospect.get({ id: payload.id });
      if (!found) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const createdBy = typeof found.createdBy === 'string' ? found.createdBy : undefined;
      if (!isAdmin && createdBy !== session.userId) {
        return null;
      }

      return { ...found };
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_PROSPECT_USECASE);
    }
  }
}
