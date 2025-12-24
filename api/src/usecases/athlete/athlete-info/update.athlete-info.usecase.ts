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
      const isAthlete = session.role === Role.ATHLETE;
      const isCoach = session.role === Role.COACH;

      if (isAdmin) {
        return await this.applyUpdate(existing, payload);
      }

      if (isAthlete && existing.userId !== session.userId) {
        return null;
      }

      if (isCoach) {
        const hasLink = await this.hasCoachAthleteLink(session.userId, existing.userId);
        if (!hasLink) {
          return null;
        }
      }

      if (!isCoach && !isAthlete && existing.createdBy !== session.userId) {
        return null;
      }

      return await this.applyUpdate(existing, payload);
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateAthleteInfoUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_ATHLETE_INFO_USECASE);
    }
  }

  private async applyUpdate(
    existing: AthleteInfoUsecaseModel,
    payload: Omit<UpdateAthleteInfoUsecaseDto, 'session'>,
  ): Promise<AthleteInfoUsecaseModel | null> {
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
  }

  private async hasCoachAthleteLink(coachId: string, athleteId: string): Promise<boolean> {
    const result = await this.inversify.bddService.coachAthlete.list({
      coachId,
      athleteId,
      is_active: true,
      includeArchived: false,
      limit: 1,
      page: 1,
    });
    return result.total > 0;
  }

  private async ensureAthlete(userId: string): Promise<void> {
    const user = await this.inversify.bddService.user.getUser({ id: userId });
    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND);
    }
    if (user.type !== 'athlete') {
      throw new Error(ERRORS.TARGET_NOT_ATHLETE);
    }
  }
}
