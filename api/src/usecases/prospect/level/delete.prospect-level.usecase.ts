// src/usecases/prospect/level/delete.prospect-level.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetProspectLevelDto } from '@services/db/dtos/prospect/level.dto';

export class DeleteProspectLevelUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectLevelDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.prospectLevel.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteProspectLevelUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_PROSPECT_LEVEL_USECASE);
    }
  }
}
