// src/usecases/muscle/create.muscle.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';
import { CreateMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';

export class CreateMuscleUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateMuscleUsecaseDto): Promise<MuscleUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'muscle', locale: dto.locale });
      const created = await this.inversify.bddService.muscle.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateMuscleUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_MUSCLE_USECASE);
    }
  }
}
