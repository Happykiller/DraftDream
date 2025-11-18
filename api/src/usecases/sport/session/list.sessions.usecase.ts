// src\usecases\session\list.sessions.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapSessionToUsecase } from '@src/usecases/sport/session/session.mapper';
import { ListSessionsUsecaseDto } from '@src/usecases/sport/session/session.usecase.dto';
import type { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';

export class ListSessionsUsecase {
  constructor(private readonly inversify: Inversify) {}

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
        const allowedCreatorIds = await this.resolveAccessibleCreatorIds(session.userId);

        if (createdBy) {
          if (!allowedCreatorIds.has(createdBy)) {
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
          createdByIn: Array.from(allowedCreatorIds),
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
      throw new Error(ERRORS.LIST_SESSIONS_USECASE);
    }
  }

  private async resolveAccessibleCreatorIds(userId: string): Promise<Set<string>> {
    const allowed = new Set<string>([userId]);
    const adminIds = await this.fetchAdminIds();
    for (const id of adminIds) {
      allowed.add(id);
    }
    return allowed;
  }

  private async fetchAdminIds(): Promise<Set<string>> {
    const ids = new Set<string>();
    const pageSize = 50;
    let page = 1;

    while (true) {
      const res = await this.inversify.bddService.user.listUsers({
        type: 'admin',
        limit: pageSize,
        page,
      });

      for (const user of res.items ?? []) {
        if (user?.id) {
          ids.add(String(user.id));
        }
      }

      if ((res.items?.length ?? 0) < pageSize || ids.size >= (res.total ?? ids.size)) {
        break;
      }

      page += 1;
    }

    return ids;
  }
}
