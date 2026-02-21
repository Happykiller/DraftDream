import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { ResolveCoachAthleteVisibilityUsecase } from '@usecases/athlete/coach-athlete/resolve-coach-athlete-visibility.usecase';

describe('ResolveCoachAthleteVisibilityUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
  let usecase: ResolveCoachAthleteVisibilityUsecase;

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    coachAthleteRepositoryMock = mock<BddServiceCoachAthleteMongo>();

    (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = coachAthleteRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;

    usecase = new ResolveCoachAthleteVisibilityUsecase(inversifyMock);
  });

  it('returns true when an active dated link exists', async () => {
    (coachAthleteRepositoryMock.list as any).mockResolvedValue({ items: [{}], total: 1, page: 1, limit: 1 });

    const result = await usecase.execute({ coachId: 'coach-1', athleteId: 'athlete-1' });

    expect(result).toBe(true);
    expect(coachAthleteRepositoryMock.list).toHaveBeenCalledWith(expect.objectContaining({
      coachId: 'coach-1',
      athleteId: 'athlete-1',
      is_active: true,
      includeArchived: false,
      limit: 1,
      page: 1,
    }));
  });

  it('returns false when no active link exists', async () => {
    (coachAthleteRepositoryMock.list as any).mockResolvedValue({ items: [], total: 0, page: 1, limit: 1 });

    const result = await usecase.execute({ coachId: 'coach-1', athleteId: 'athlete-2' });

    expect(result).toBe(false);
  });
});
