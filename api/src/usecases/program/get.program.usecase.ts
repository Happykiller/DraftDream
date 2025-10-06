// src\\usecases\\program\\get.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetProgramUsecaseDto } from '@usecases/program/program.usecase.dto';
import { mapProgramToUsecase } from '@usecases/program/program.mapper';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export class GetProgramUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const program = await this.inversify.bddService.program.get(dto);
      return program ? mapProgramToUsecase(program) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetProgramUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_PROGRAM_USECASE);
    }
  }
}
