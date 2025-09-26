// src/usecases/tag/list.tags.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { ListTagsUsecaseDto } from '@usecases/tag/tag.usecase.dto';

export interface ListTagsUsecaseResult {
  items: TagUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListTagsUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListTagsUsecaseDto = {}): Promise<ListTagsUsecaseResult> {
    try {
      const res = await this.inversify.bddService.listTags(dto);
      return {
        items: res.items.map(i => ({ ...i })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListTagsUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_TAGS_USECASE);
    }
  }
}
