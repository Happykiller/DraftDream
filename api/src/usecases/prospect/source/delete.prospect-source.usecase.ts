// src/usecases/prospect/source/delete.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetProspectSourceDto } from '@services/db/dtos/prospect/source.dto';

export class DeleteProspectSourceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectSourceDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospectSource.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectSourceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_PROSPECT_SOURCE_USECASE);
    }
  }
}
