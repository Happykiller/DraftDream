// src/usecases/tag/update.tag.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { UpdateTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';

export class UpdateTagUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateTagUsecaseDto): Promise<TagUsecaseModel | null> {
    try {
      const toUpdate: any = {
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      };

      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'tag' });
      }
      const updated = await this.inversify.bddService.tag.update(dto.id, toUpdate);
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateTagUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.UPDATE_TAG_USECASE);
    }
  }
}
