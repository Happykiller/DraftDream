// src/usecases/client/client/create.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ClientUsecaseModel } from './client.usecase.model';
import { CreateClientUsecaseDto } from './client.usecase.dto';

export class CreateClientUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateClientUsecaseDto): Promise<ClientUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.client.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        statusId: dto.statusId,
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
      this.inversify.loggerService.error(`CreateClientUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_CLIENT_USECASE);
    }
  }
}
