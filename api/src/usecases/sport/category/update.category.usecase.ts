// src/usecases/category/update.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';
import { UpdateCategoryUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';

export class UpdateCategoryUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateCategoryUsecaseDto): Promise<CategoryUsecaseModel | null> {
    try {
      const toUpdate: any = {
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      };
      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'category', locale: dto.locale });
      }
      const updated = await this.inversify.bddService.category.update(
        dto.id,
        toUpdate,
      );
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(
        `UpdateCategoryUsecase#execute => ${e?.message ?? e}`,
      );
      throw normalizeError(e, ERRORS.UPDATE_CATEGORY_USECASE);
    }
  }
}
