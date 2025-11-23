// src/usecases/prospect/source/delete.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteProspectSourceUsecaseDto } from './prospect-source.usecase.dto';

export class DeleteProspectSourceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProspectSourceUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospectSource.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectSourceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_PROSPECT_SOURCE_USECASE);
    }
  }
}
