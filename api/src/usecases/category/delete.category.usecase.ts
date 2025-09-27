// src/usecases/category/delete.category.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteCategoryUsecaseDto } from '@usecases/category/category.usecase.dto';

export class DeleteCategoryUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteCategoryUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.category.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteCategoryUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_CATEGORY_USECASE);
    }
  }
}
