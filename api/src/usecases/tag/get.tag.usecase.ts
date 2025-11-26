// src/usecases/tag/get.tag.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { GetTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';

export class GetTagUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetTagUsecaseDto): Promise<TagUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.tag.get({
        id: dto.id
      });
      return found ? { ...found } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetTagUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_TAG_USECASE);
    }
  }
}
