import { beforeEach, describe, expect, it } from '@jest/globals';

import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealRecordMongo } from '@services/db/mongo/repositories/meal-record.repository';
import { MealRecord } from '@services/db/models/meal-record.model';
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { GetMealRecordUsecase } from '@src/usecases/nutri/meal-record/get.meal-record.usecase';
import { GetMealRecordUsecaseDto } from '@src/usecases/nutri/meal-record/meal-record.usecase.dto';
import { MealRecordUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetMealRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let mealRecordRepositoryMock: BddServiceMealRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: GetMealRecordUsecase;

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
      get: createMockFn(),
    } as unknown as BddServiceMealRecordMongo;

    bddServiceMock = {
      mealRecord: mealRecordRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new GetMealRecordUsecase(inversifyMock);
  });

  it('should return a meal record for the owner', async () => {
    asMock(mealRecordRepositoryMock.get).mockResolvedValue(record);

    const dto: GetMealRecordUsecaseDto = {
      id: 'record-1',
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };
    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
  });

  it('should return null for non owners', async () => {
    asMock(mealRecordRepositoryMock.get).mockResolvedValue(record);

    const dto: GetMealRecordUsecaseDto = {
      id: 'record-1',
      session: { userId: 'athlete-2', role: Role.ATHLETE },
    };
    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });
});
