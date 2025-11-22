// src/usecases/client/client/get.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { GetProspectUsecaseDto } from './prospect.usecase.dto';

export class GetProspectUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProspectUsecaseDto): Promise<ProspectUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.prospect.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetProspectUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_PROSPECT_USECASE);
    }
  }
}
