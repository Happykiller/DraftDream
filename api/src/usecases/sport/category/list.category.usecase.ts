// src/usecases/category/list.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';
import { ListCategoriesUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';

export interface ListCategoriesUsecaseResult {
  items: CategoryUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListCategoriesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListCategoriesUsecaseDto = {}): Promise<ListCategoriesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.category.list(dto);
      return {
        items: res.items.map(i => ({ ...i })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListCategoriesUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_CATEGORIES_USECASE);
    }
  }
}
