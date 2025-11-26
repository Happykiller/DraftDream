// src/usecases/tag/delete.tag.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';

export class DeleteTagUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteTagUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.tag.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteTagUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.DELETE_TAG_USECASE);
    }
  }
}
