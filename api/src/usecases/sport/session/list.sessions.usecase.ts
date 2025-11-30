// src\usecases\session\list.sessions.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapSessionToUsecase } from '@src/usecases/sport/session/session.mapper';
import { ListSessionsUsecaseDto } from '@src/usecases/sport/session/session.usecase.dto';
import type { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';

export class ListSessionsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListSessionsUsecaseDto): Promise<{
    items: SessionUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === Role.ADMIN) {
        const res = await this.inversify.bddService.session.list(payload);
        return {
          items: res.items.map(mapSessionToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === Role.COACH) {
        const { createdBy, ...rest } = payload;

        if (createdBy) {
          if (createdBy !== session.userId) {
            throw new Error(ERRORS.LIST_SESSIONS_FORBIDDEN);
          }
          const res = await this.inversify.bddService.session.list({
            ...rest,
            createdBy,
          });
          return {
            items: res.items.map(mapSessionToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        const res = await this.inversify.bddService.session.list({
          ...rest,
          createdByIn: [session.userId],
          includePublicVisibility: true,
        });
        return {
          items: res.items.map(mapSessionToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      throw new Error(ERRORS.LIST_SESSIONS_FORBIDDEN);
    } catch (e: any) {
      if (e?.message === ERRORS.LIST_SESSIONS_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`ListSessionsUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.LIST_SESSIONS_USECASE);
    }
  }
}
