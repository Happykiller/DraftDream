// src/usecases/muscle/create.muscle.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MuscleUsecaseModel } from '@usecases/muscle/muscle.usecase.model';
import { CreateMuscleUsecaseDto } from '@usecases/muscle/muscle.usecase.dto';

export class CreateMuscleUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateMuscleUsecaseDto): Promise<MuscleUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.muscle.create({
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateMuscleUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_MUSCLE_USECASE);
    }
  }
}
