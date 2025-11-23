// src/usecases/prospect/source/get.prospect-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectSource } from '@services/db/models/prospect/source.model';
import { GetProspectSourceUsecaseDto } from './prospect-source.usecase.dto';

export class GetProspectSourceUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectSourceUsecaseDto): Promise<ProspectSource | null> {
    try {
      const found = await this.inversify.bddService.prospectSource.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectSourceUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_PROSPECT_SOURCE_USECASE);
    }
  }
}
