// src\\usecases\\program\\create.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CreateProgramUsecaseDto } from '@usecases/program/program.usecase.dto';
import { mapProgramToUsecase } from '@usecases/program/program.mapper';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export class CreateProgramUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Creates a new program; returns null on duplicate slug/locale (active docs). */
  async execute(dto: CreateProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.program.create(dto);
      return created ? mapProgramToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateProgramUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_PROGRAM_USECASE);
    }
  }
}
