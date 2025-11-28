// src/usecases/client/client/create.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { CreateProspectUsecaseDto } from './prospect.usecase.dto';

export class CreateProspectUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateProspectUsecaseDto): Promise<ProspectUsecaseModel | null> {
    try {
      const createdAt = new Date();
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
        workflowHistory: dto.workflowHistory ?? [{ status: 'create', date: createdAt }],
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProspectUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_PROSPECT_USECASE);
    }
  }
}
