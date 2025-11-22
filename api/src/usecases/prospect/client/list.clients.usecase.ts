// src/usecases/client/client/list.clients.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ClientUsecaseModel } from './client.usecase.model';
import { ListClientsUsecaseDto } from './client.usecase.dto';

interface ListClientsResult {
  items: ClientUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListClientsUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListClientsUsecaseDto = {}): Promise<ListClientsResult> {
    try {
      const result = await this.inversify.bddService.client.list({
        q: dto.q,
        statusId: dto.statusId,
        levelId: dto.levelId,
        sourceId: dto.sourceId,
        createdBy: dto.createdBy,
        limit: dto.limit,
        page: dto.page,
      });
      return {
        items: result.items.map((item) => ({ ...item })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListClientsUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_CLIENTS_USECASE);
    }
  }
}
