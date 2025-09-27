// src/usecases/tag/update.tag.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { UpdateTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';

export class UpdateTagUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateTagUsecaseDto): Promise<TagUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.tag.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        visibility: dto.visibility
      });
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateTagUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_TAG_USECASE);
    }
  }
}
