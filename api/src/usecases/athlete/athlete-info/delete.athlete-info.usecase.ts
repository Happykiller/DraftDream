// src/usecases/athlete/athlete-info/delete.athlete-info.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { DeleteAthleteInfoUsecaseDto } from './athlete-info.usecase.dto';

export class DeleteAthleteInfoUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteAthleteInfoUsecaseDto): Promise<boolean> {
    try {
      const { session, ...payload } = dto;
      const existing = await this.inversify.bddService.athleteInfo.get({ id: payload.id });
      if (!existing) {
        return false;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isAthlete = session.role === Role.ATHLETE;
      const isCoach = session.role === Role.COACH;

      if (isAdmin) {
        return await this.inversify.bddService.athleteInfo.delete(payload.id);
      }

      if (isAthlete && existing.userId !== session.userId) {
        return false;
      }

      if (isCoach) {
        const hasLink = await this.hasCoachAthleteLink(session.userId, existing.userId);
        if (!hasLink) {
          return false;
        }
      }

      if (!isCoach && !isAthlete && existing.createdBy !== session.userId) {
        return false;
      }

      return await this.inversify.bddService.athleteInfo.delete(payload.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteAthleteInfoUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_ATHLETE_INFO_USECASE);
    }
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
}
