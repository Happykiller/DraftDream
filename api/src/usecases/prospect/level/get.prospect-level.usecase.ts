// src/usecases/prospect/level/get.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ProspectLevel } from '@services/db/models/prospect/level.model';
import { GetProspectLevelDto } from '@services/db/dtos/prospect/level.dto';

export class GetProspectLevelUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectLevelDto): Promise<ProspectLevel | null> {
    try {
      const found = await this.inversify.bddService.prospectLevel.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_PROSPECT_LEVEL_USECASE);
    }
  }
}
