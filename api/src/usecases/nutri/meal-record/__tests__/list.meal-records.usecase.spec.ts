import { beforeEach, describe, expect, it } from '@jest/globals';

import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealRecordMongo } from '@services/db/mongo/repositories/meal-record.repository';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { MealRecord } from '@services/db/models/meal-record.model';
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { ListMealRecordsUsecase } from '@src/usecases/nutri/meal-record/list.meal-records.usecase';
import { ListMealRecordsUsecaseDto } from '@src/usecases/nutri/meal-record/meal-record.usecase.dto';
import { MealRecordUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListMealRecordsUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let mealRecordRepositoryMock: BddServiceMealRecordMongo;
  let mealPlanRepositoryMock: BddServiceMealPlanMongo;
  let loggerMock: LoggerMock;
  let usecase: ListMealRecordsUsecase;

  const record: MealRecord = {
    id: 'record-1',
    userId: 'athlete-1',
    mealPlanId: 'plan-1',
    mealDayId: 'day-1',
    mealId: 'meal-1',
    state: MealRecordState.CREATE,
    createdBy: 'athlete-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const expected: MealRecordUsecaseModel = {
    ...record,
  };

  beforeEach(() => {
    mealRecordRepositoryMock = {
      list: createMockFn(),
    } as unknown as BddServiceMealRecordMongo;

    mealPlanRepositoryMock = {
      get: createMockFn(),
    } as unknown as BddServiceMealPlanMongo;

    bddServiceMock = {
      mealRecord: mealRecordRepositoryMock,
      mealPlan: mealPlanRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new ListMealRecordsUsecase(inversifyMock);
  });

  it('should list meal records for admin', async () => {
    asMock(mealRecordRepositoryMock.list).mockResolvedValue({
      items: [record],
      total: 1,
      page: 1,
      limit: 20,
    });
    asMock(mealPlanRepositoryMock.get).mockResolvedValue({
      id: 'plan-1',
      label: 'Meal Plan 1',
      userId: 'athlete-1',
      createdBy: 'coach-1',
    } as any);

    const dto: ListMealRecordsUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
      userId: 'athlete-1',
    };
    const result = await usecase.execute(dto);

    expect(result.items).toEqual([{
      ...expected,
      mealPlanSnapshot: { id: 'plan-1', label: 'Meal Plan 1' },
    }]);
    expect(asMock(mealRecordRepositoryMock.list).mock.calls[0][0]).toEqual({
      userId: 'athlete-1',
      mealPlanId: undefined,
      mealDayId: undefined,
      mealId: undefined,
      state: undefined,
      includeArchived: undefined,
      limit: undefined,
      page: undefined,
    });
  });

  it('should scope meal records to the athlete', async () => {
    asMock(mealRecordRepositoryMock.list).mockResolvedValue({
      items: [record],
      total: 1,
      page: 1,
      limit: 20,
    });
    asMock(mealPlanRepositoryMock.get).mockResolvedValue({
      id: 'plan-1',
      label: 'Meal Plan 1',
      userId: 'athlete-1',
      createdBy: 'coach-1',
    } as any);

    const dto: ListMealRecordsUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
      userId: 'athlete-2',
    };
    const result = await usecase.execute(dto);

    expect(result.items).toEqual([{
      ...expected,
      mealPlanSnapshot: { id: 'plan-1', label: 'Meal Plan 1' },
    }]);
    expect(asMock(mealRecordRepositoryMock.list).mock.calls[0][0]).toEqual({
      userId: 'athlete-1',
      mealPlanId: undefined,
      mealDayId: undefined,
      mealId: undefined,
      state: undefined,
      includeArchived: false,
      limit: undefined,
      page: undefined,
    });
  });
});
