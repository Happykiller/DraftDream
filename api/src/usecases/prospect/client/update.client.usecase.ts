// src/usecases/client/client/update.client.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { ClientUsecaseModel } from './client.usecase.model';
import { UpdateClientUsecaseDto } from './client.usecase.dto';

export class UpdateClientUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientUsecaseDto): Promise<ClientUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.client.update(dto.id, {
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
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_USECASE);
    }
  }
}
