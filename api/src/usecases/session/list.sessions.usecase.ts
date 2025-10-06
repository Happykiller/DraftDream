// src\usecases\session\list.sessions.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapSessionToUsecase } from '@usecases/session/session.mapper';
import { ListSessionsUsecaseDto } from '@usecases/session/session.usecase.dto';
import type { SessionUsecaseModel } from '@usecases/session/session.usecase.model';

export class ListSessionsUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListSessionsUsecaseDto = {}): Promise<{
    items: SessionUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const res = await this.inversify.bddService.session.list(dto);
      return {
        items: res.items.map(mapSessionToUsecase),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListSessionsUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_SESSIONS_USECASE);
    }
  }
}
