// src/usecases/client/client/create.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { CreateProspectUsecaseDto } from './prospect.usecase.dto';

export class CreateProspectUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateProspectUsecaseDto): Promise<ProspectUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.prospect.create({
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
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProspectUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_PROSPECT_USECASE);
    }
  }
}
