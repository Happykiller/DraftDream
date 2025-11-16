// src/usecases/muscle/delete.muscle.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';

export class DeleteMuscleUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteMuscleUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.muscle.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteMuscleUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_MUSCLE_USECASE);
    }
  }
}
