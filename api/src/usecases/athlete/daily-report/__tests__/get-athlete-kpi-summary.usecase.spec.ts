import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceDailyReportMongo } from '@services/db/mongo/repositories/daily-report.repository';
import { ResolveCoachAthleteVisibilityUsecase } from '@usecases/athlete/coach-athlete/resolve-coach-athlete-visibility.usecase';
import { GetAthleteKpiSummaryUsecase } from '@usecases/athlete/daily-report/get-athlete-kpi-summary.usecase';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetAthleteKpiSummaryUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let dailyReportRepositoryMock: MockProxy<BddServiceDailyReportMongo>;
  let resolveCoachAthleteVisibilityUsecaseMock: MockProxy<ResolveCoachAthleteVisibilityUsecase>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetAthleteKpiSummaryUsecase;

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    dailyReportRepositoryMock = mock<BddServiceDailyReportMongo>();
    resolveCoachAthleteVisibilityUsecaseMock = mock<ResolveCoachAthleteVisibilityUsecase>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { dailyReport: BddServiceDailyReportMongo }).dailyReport = dailyReportRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.resolveCoachAthleteVisibilityUsecase = resolveCoachAthleteVisibilityUsecaseMock as unknown as ResolveCoachAthleteVisibilityUsecase;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetAthleteKpiSummaryUsecase(inversifyMock);
  });

  it('computes rounded mental score average from last reports', async () => {
    (resolveCoachAthleteVisibilityUsecaseMock.execute as any).mockResolvedValue(true);
    (dailyReportRepositoryMock.list as any).mockResolvedValue({
      items: [
        { energyLevel: 8, motivationLevel: 8, stressLevel: 3, moodLevel: 8, disruptiveFactor: false },
        { energyLevel: 6, motivationLevel: 6, stressLevel: 8, moodLevel: 2, disruptiveFactor: true },
      ],
      total: 2,
      page: 1,
      limit: 10,
    });

    const result = await usecase.execute({
      athleteId: 'athlete-1',
      session: { userId: 'coach-1', role: Role.COACH },
    });

    expect(result).toEqual({
      mental: {
        score: 63,
        sampleSize: 2,
      },
    });
  });

  it('forbids coach without active link', async () => {
    (resolveCoachAthleteVisibilityUsecaseMock.execute as any).mockResolvedValue(false);

    await expect(usecase.execute({
      athleteId: 'athlete-1',
      session: { userId: 'coach-1', role: Role.COACH },
    })).rejects.toThrow(ERRORS.FORBIDDEN);
  });

  it('allows admins without coach visibility checks', async () => {
    (dailyReportRepositoryMock.list as any).mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });

    await usecase.execute({
      athleteId: 'athlete-1',
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(resolveCoachAthleteVisibilityUsecaseMock.execute).not.toHaveBeenCalled();
  });
});
