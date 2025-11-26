// src\\usecases\\program\\list.programs.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { ListProgramsUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { mapProgramToUsecase } from '@src/usecases/sport/program/program.mapper';
import type { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export class ListProgramsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListProgramsUsecaseDto): Promise<{
    items: ProgramUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === Role.ADMIN) {
        const res = await this.inversify.bddService.program.list(payload);
        return {
          items: res.items.map(mapProgramToUsecase),
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
            throw new Error(ERRORS.LIST_PROGRAMS_FORBIDDEN);
          }
          const res = await this.inversify.bddService.program.list({
            ...rest,
            createdBy,
          });
          return {
            items: res.items.map(mapProgramToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        const res = await this.inversify.bddService.program.list({
          ...rest,
          createdByIn: Array.from(allowedCreatorIds),
        });
        return {
          items: res.items.map(mapProgramToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === Role.ATHLETE) {
        // Athletes may only browse programs assigned directly to them.
        const { createdBy, createdByIn, userId, ...rest } = payload;

        if (createdBy || (Array.isArray(createdByIn) && createdByIn.length > 0)) {
          throw new Error(ERRORS.LIST_PROGRAMS_FORBIDDEN);
        }

        if (userId && userId !== session.userId) {
          throw new Error(ERRORS.LIST_PROGRAMS_FORBIDDEN);
        }

        const res = await this.inversify.bddService.program.list({
          ...rest,
          userId: session.userId,
        });

        return {
          items: res.items.map(mapProgramToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      throw new Error(ERRORS.LIST_PROGRAMS_FORBIDDEN);
    } catch (e: any) {
      if (e?.message === ERRORS.LIST_PROGRAMS_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`ListProgramsUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.LIST_PROGRAMS_USECASE);
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
