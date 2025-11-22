// src/usecases/prospect/source/get.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ProspectSource } from '@services/db/models/prospect/source.model';
import { GetProspectSourceDto } from '@services/db/dtos/prospect/source.dto';

export class GetProspectSourceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectSourceDto): Promise<ProspectSource | null> {
    try {
      const found = await this.inversify.bddService.prospectSource.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectSourceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_PROSPECT_SOURCE_USECASE);
    }
  }
}
