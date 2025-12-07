// src/usecases/category/create.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';
import { CreateCategoryUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';

export class CreateCategoryUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateCategoryUsecaseDto): Promise<CategoryUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'category', locale: dto.locale });
      const created = await this.inversify.bddService.category.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateCategoryUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_CATEGORY_USECASE);
    }
  }
}
