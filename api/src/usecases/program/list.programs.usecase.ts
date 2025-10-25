// src\\usecases\\program\\list.programs.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ListProgramsUsecaseDto } from '@usecases/program/program.usecase.dto';
import { mapProgramToUsecase } from '@usecases/program/program.mapper';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export class ListProgramsUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListProgramsUsecaseDto): Promise<{
    items: ProgramUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === 'ADMIN') {
        const res = await this.inversify.bddService.program.list(payload);
        return {
          items: res.items.map(mapProgramToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === 'COACH') {
        const res = await this.inversify.bddService.program.list({
          ...payload,
          createdBy: session.userId,
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
      throw new Error(ERRORS.LIST_PROGRAMS_USECASE);
    }
  }
}
