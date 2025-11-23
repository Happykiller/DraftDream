// src/usecases/prospect/level/get.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ProspectLevel } from '@services/db/models/prospect/level.model';
import { GetProspectLevelUsecaseDto } from './prospect-level.usecase.dto';

export class GetProspectLevelUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectLevelUsecaseDto): Promise<ProspectLevel | null> {
    try {
      const found = await this.inversify.bddService.prospectLevel.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectLevelUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_PROSPECT_LEVEL_USECASE);
    }
  }
}
