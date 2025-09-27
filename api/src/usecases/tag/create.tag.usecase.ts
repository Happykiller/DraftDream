// src/usecases/tag/create.tag.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { CreateTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';

export class CreateTagUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateTagUsecaseDto): Promise<TagUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.tag.create({
        slug: dto.slug,
        locale: dto.locale,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateTagUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_TAG_USECASE);
    }
  }
}
