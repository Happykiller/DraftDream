// src/usecases/athlete/athlete-info/update.athlete-info.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { AthleteInfoUsecaseModel } from './athlete-info.usecase.model';
import { UpdateAthleteInfoUsecaseDto } from './athlete-info.usecase.dto';

export class UpdateAthleteInfoUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateAthleteInfoUsecaseDto): Promise<AthleteInfoUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const existing = await this.inversify.bddService.athleteInfo.get({ id: payload.id });
      if (!existing) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      if (!isAdmin && existing.createdBy !== session.userId) {
        return null;
      }

      if (payload.userId && payload.userId !== existing.userId) {
        await this.ensureAthlete(payload.userId);
      }

      const updated = await this.inversify.bddService.athleteInfo.update(payload.id, {
        userId: payload.userId,
        levelId: payload.levelId ?? undefined,
        objectiveIds: payload.objectiveIds?.filter(Boolean),
        activityPreferenceIds: payload.activityPreferenceIds?.filter(Boolean),
        medicalConditions: payload.medicalConditions ?? undefined,
        allergies: payload.allergies ?? undefined,
        notes: payload.notes ?? undefined,
      });

      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateAthleteInfoUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_ATHLETE_INFO_USECASE);
    }
  }

  private async ensureAthlete(userId: string): Promise<void> {
    const user = await this.inversify.bddService.user.getUser({ id: userId });
    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND);
    }
    if (user.type !== 'athlete') {
      throw new Error('TARGET_NOT_ATHLETE');
    }
  }
}
