// src/usecases/category/get.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetCategoryUsecaseDto } from '@usecases/category/category.usecase.dto';
import { CategoryUsecaseModel } from '@usecases/category/category.usecase.model';

export class GetCategoryUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetCategoryUsecaseDto): Promise<CategoryUsecaseModel | null> {
    try {
      const cat = await this.inversify.bddService.category.get({
        id: dto.id
      });
      return cat ? { ...cat } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetCategoryUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_CATEGORY_USECASE);
    }
  }
}
