// src/usecases/athlete/athlete-info/create.athlete-info.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { AthleteInfoUsecaseModel } from './athlete-info.usecase.model';
import { CreateAthleteInfoUsecaseDto } from './athlete-info.usecase.dto';

export class CreateAthleteInfoUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateAthleteInfoUsecaseDto): Promise<AthleteInfoUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      this.assertCreationRights(session, payload.userId);
      await this.ensureAthlete(payload.userId);

      const created = await this.inversify.bddService.athleteInfo.create({
        userId: payload.userId,
        levelId: payload.levelId ?? undefined,
        objectiveIds: payload.objectiveIds?.filter(Boolean),
        activityPreferenceIds: payload.activityPreferenceIds?.filter(Boolean),
        medicalConditions: payload.medicalConditions ?? undefined,
        allergies: payload.allergies ?? undefined,
        notes: payload.notes ?? undefined,
        createdBy: session.userId,
      });

      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateAthleteInfoUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_ATHLETE_INFO_USECASE);
    }
  }

  private assertCreationRights(session: { userId: string; role: Role }, targetUserId: string): void {
    const isAdmin = session.role === Role.ADMIN;
    const isSelf = session.userId === targetUserId;
    if (!isAdmin && session.role === Role.ATHLETE && !isSelf) {
      throw new Error(ERRORS.FORBIDDEN);
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
