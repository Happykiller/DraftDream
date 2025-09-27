// src/usecases/category/create.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CategoryUsecaseModel } from '@usecases/category/category.usecase.model';
import { CreateCategoryUsecaseDto } from '@usecases/category/category.usecase.dto';

export class CreateCategoryUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateCategoryUsecaseDto): Promise<CategoryUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.category.create({
        slug: dto.slug,
        locale: dto.locale,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateCategoryUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_CATEGORY_USECASE);
    }
  }
}
