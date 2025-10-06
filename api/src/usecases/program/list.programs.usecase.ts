// src\\usecases\\program\\list.programs.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ListProgramsUsecaseDto } from '@usecases/program/program.usecase.dto';
import { mapProgramToUsecase } from '@usecases/program/program.mapper';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export class ListProgramsUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListProgramsUsecaseDto = {}): Promise<{
    items: ProgramUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const res = await this.inversify.bddService.program.list(dto);
      return {
        items: res.items.map(mapProgramToUsecase),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListProgramsUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_PROGRAMS_USECASE);
    }
  }
}
