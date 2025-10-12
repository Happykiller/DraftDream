// src/usecases/category/update.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CategoryUsecaseModel } from '@usecases/category/category.usecase.model';
import { UpdateCategoryUsecaseDto } from '@usecases/category/category.usecase.dto';

export class UpdateCategoryUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateCategoryUsecaseDto): Promise<CategoryUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.category.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
      });
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateCategoryUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_CATEGORY_USECASE);
    }
  }
}
