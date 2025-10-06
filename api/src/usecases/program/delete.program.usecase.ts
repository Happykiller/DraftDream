// src\\usecases\\program\\delete.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteProgramUsecaseDto } from '@usecases/program/program.usecase.dto';

export class DeleteProgramUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteProgramUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.program.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteProgramUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_PROGRAM_USECASE);
    }
  }
}
