// src\\usecases\\program\\update.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { UpdateProgramUsecaseDto } from '@usecases/program/program.usecase.dto';
import { mapProgramToUsecase } from '@usecases/program/program.mapper';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export class UpdateProgramUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(id: string, dto: UpdateProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.program.update(id, dto);
      return updated ? mapProgramToUsecase(updated) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateProgramUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_PROGRAM_USECASE);
    }
  }
}
