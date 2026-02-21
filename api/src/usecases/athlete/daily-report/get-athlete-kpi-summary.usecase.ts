import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

interface UsecaseSession {
  userId: string;
  role: Role;
}

interface GetAthleteKpiSummaryUsecaseDto {
  athleteId: string;
  session: UsecaseSession;
}

interface MentalKpiSummary {
  score: number;
  sampleSize: number;
}

export interface AthleteKpiSummaryUsecaseModel {
  mental: MentalKpiSummary;
}

/**
 * Builds an athlete KPI summary from the latest daily reports.
 */
export class GetAthleteKpiSummaryUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetAthleteKpiSummaryUsecaseDto): Promise<AthleteKpiSummaryUsecaseModel> {
    try {
      await this.ensureAccess(dto.session, dto.athleteId);

      const reports = await this.inversify.bddService.dailyReport.list({
        athleteId: dto.athleteId,
        limit: 10,
        page: 1,
        sort: { reportDate: -1, updatedAt: -1 },
      });

      const scores = reports.items.map((report) => {
        const base = (report.energyLevel + report.motivationLevel + (10 - report.stressLevel)) / 3;
        let score = base * 10;

        if (report.moodLevel >= 7) {
          score += 5;
        } else if (report.moodLevel <= 3) {
          score -= 5;
        }

        if (report.disruptiveFactor) {
          score -= 5;
        }

        return this.clamp(score, 0, 100);
      });

      const average = scores.length
        ? scores.reduce((acc, score) => acc + score, 0) / scores.length
        : 0;

      return {
        mental: {
          score: Math.round(average),
          sampleSize: scores.length,
        },
      };
    } catch (error: any) {
      if (error?.message === ERRORS.FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`GetAthleteKpiSummaryUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_DAILY_REPORTS_USECASE);
    }
  }

  private async ensureAccess(session: UsecaseSession, athleteId: string): Promise<void> {
    if (session.role === Role.ADMIN) {
      return;
    }

    if (session.role !== Role.COACH) {
      throw new Error(ERRORS.FORBIDDEN);
    }

    const hasAccess = await this.inversify.resolveCoachAthleteVisibilityUsecase.execute({
      coachId: session.userId,
      athleteId,
    });

    if (!hasAccess) {
      throw new Error(ERRORS.FORBIDDEN);
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
