// src/usecases/muscle/get.muscle.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';

import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';
export class GetMuscleUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetMuscleUsecaseDto): Promise<MuscleUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.muscle.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetMuscleUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_MUSCLE_USECASE);
    }
  }
}
