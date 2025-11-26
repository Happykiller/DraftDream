// src/usecases/client/client/update.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { UpdateProspectUsecaseDto } from './prospect.usecase.dto';

export class UpdateProspectUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateProspectUsecaseDto): Promise<ProspectUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.prospect.update(dto.id, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
        levelId: dto.levelId,
        objectiveIds: dto.objectiveIds,
        activityPreferenceIds: dto.activityPreferenceIds,
        medicalConditions: dto.medicalConditions,
        allergies: dto.allergies,
        notes: dto.notes,
        sourceId: dto.sourceId,
        budget: dto.budget,
        dealDescription: dto.dealDescription,
        desiredStartDate: dto.desiredStartDate,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateProspectUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_PROSPECT_USECASE);
    }
  }
}
