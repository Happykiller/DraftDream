import { Inversify } from '@src/inversify/investify';

interface ResolveCoachAthleteVisibilityUsecaseDto {
  coachId: string;
  athleteId: string;
  at?: Date;
}

/**
 * Resolves whether a coach can currently access an athlete.
 */
export class ResolveCoachAthleteVisibilityUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ResolveCoachAthleteVisibilityUsecaseDto): Promise<boolean> {
    const result = await this.inversify.bddService.coachAthlete.list({
      coachId: dto.coachId,
      athleteId: dto.athleteId,
      is_active: true,
      includeArchived: false,
      activeAt: dto.at ?? new Date(),
      limit: 1,
      page: 1,
    });

    return result.total > 0;
  }
}

