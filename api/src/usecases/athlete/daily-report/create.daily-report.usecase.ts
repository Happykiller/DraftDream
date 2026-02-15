import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { mapDailyReportToUsecase } from './daily-report.mapper';
import { CreateDailyReportUsecaseDto } from './daily-report.usecase.dto';
import { DailyReportUsecaseModel } from './daily-report.usecase.model';

export class CreateDailyReportUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateDailyReportUsecaseDto): Promise<DailyReportUsecaseModel | null> {
    try {
      const athleteId = dto.session.role === Role.ATHLETE ? dto.session.userId : dto.athleteId;
      if (!athleteId) {
        throw new Error(ERRORS.CREATE_DAILY_REPORT_FORBIDDEN);
      }

      const created = await this.inversify.bddService.dailyReport.create({
        reportDate: dto.reportDate,
        trainingDone: dto.trainingDone,
        nutritionPlanCompliance: dto.nutritionPlanCompliance,
        nutritionDeviations: dto.nutritionDeviations,
        mealCount: dto.mealCount,
        hydrationLiters: dto.hydrationLiters,
        cravingsSnacking: dto.cravingsSnacking,
        digestiveDiscomfort: dto.digestiveDiscomfort,
        transitOk: dto.transitOk,
        menstruation: dto.menstruation,
        sleepHours: dto.sleepHours,
        sleepQuality: dto.sleepQuality,
        wakeRested: dto.wakeRested,
        muscleSoreness: dto.muscleSoreness,
        waterRetention: dto.waterRetention,
        energyLevel: dto.energyLevel,
        motivationLevel: dto.motivationLevel,
        stressLevel: dto.stressLevel,
        moodLevel: dto.moodLevel,
        disruptiveFactor: dto.disruptiveFactor,
        painZoneTagIds: dto.painZoneTagIds,
        notes: dto.notes,
        athleteId,
        createdBy: dto.session.userId,
      });

      return created ? mapDailyReportToUsecase(created) : null;
    } catch (error: any) {
      if (error?.message === ERRORS.CREATE_DAILY_REPORT_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`CreateDailyReportUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_DAILY_REPORT_USECASE);
    }
  }
}
