// src/usecases/muscle/update.muscle.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';
import { UpdateMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';

export class UpdateMuscleUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateMuscleUsecaseDto): Promise<MuscleUsecaseModel | null> {
    try {
      const toUpdate: any = {
        locale: dto.locale,
        label: dto.label,
      };

      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'muscle' });
      }
      const updated = await this.inversify.bddService.muscle.update(
        dto.id,
        toUpdate,
      );
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(
        `UpdateMuscleUsecase#execute => ${e?.message ?? e}`,
      );
      throw new Error(ERRORS.UPDATE_MUSCLE_USECASE);
    }
  }
}
