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

        if (createdBy) {
          if (createdBy !== session.userId) {
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

        const adminIds: string[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const admins = await this.inversify.bddService.user.listUsers({
            type: 'admin',
            limit: 50,
            page,
          });
          adminIds.push(...admins.items.map((u) => u.id));
          hasMore = admins.items.length === 50; // Assuming if full page, maybe more
          if (admins.items.length < 50) hasMore = false;
          page++;
        }

        const res = await this.inversify.bddService.program.list({
          ...rest,
          createdByIn: [session.userId, ...adminIds],
          includePublicVisibility: true,
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
}
