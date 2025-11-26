// src/usecases/client/client/list.clients.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { ListProspectsUsecaseDto } from './prospect.usecase.dto';

interface ListProspectsResult {
  items: ProspectUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListProspectsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProspectsUsecaseDto): Promise<ListProspectsResult> {
    try {
      const { session, ...filters } = dto;
      const createdBy = session.role === Role.ADMIN ? filters.createdBy : session.userId;

      const result = await this.inversify.bddService.prospect.list({
        q: filters.q,
        status: filters.status,
        levelId: filters.levelId,
        sourceId: filters.sourceId,
        createdBy,
        limit: filters.limit,
        page: filters.page,
      });
      return {
        items: result.items.map((item) => ({ ...item })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_PROSPECTS_USECASE);
    }
  }
}
