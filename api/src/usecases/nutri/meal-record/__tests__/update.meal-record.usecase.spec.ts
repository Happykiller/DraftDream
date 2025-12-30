import { beforeEach, describe, expect, it } from '@jest/globals';

import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealRecordMongo } from '@services/db/mongo/repositories/meal-record.repository';
import { MealRecord } from '@services/db/models/meal-record.model';
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { UpdateMealRecordUsecase } from '@src/usecases/nutri/meal-record/update.meal-record.usecase';
import { UpdateMealRecordUsecaseDto } from '@src/usecases/nutri/meal-record/meal-record.usecase.dto';
import { MealRecordUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateMealRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let mealRecordRepositoryMock: BddServiceMealRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateMealRecordUsecase;

  const record: MealRecord = {
    id: 'record-1',
    userId: 'athlete-1',
    mealPlanId: 'plan-1',
    mealDayId: 'day-1',
    mealId: 'meal-1',
    state: MealRecordState.CREATE,
    createdBy: 'coach-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const updatedRecord: MealRecord = {
    ...record,
    state: MealRecordState.DRAFT,
  };

  const expected: MealRecordUsecaseModel = {
    ...updatedRecord,
  };

  beforeEach(() => {
    mealRecordRepositoryMock = {
      get: createMockFn(),
      update: createMockFn(),
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

    usecase = new UpdateMealRecordUsecase(inversifyMock);
  });

  it('should update a meal record for the creator', async () => {
    asMock(mealRecordRepositoryMock.get).mockResolvedValue(record);
    asMock(mealRecordRepositoryMock.update).mockResolvedValue(updatedRecord);

    const dto: UpdateMealRecordUsecaseDto = {
      id: 'record-1',
      state: MealRecordState.DRAFT,
      session: { userId: 'coach-1', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
    expect(asMock(mealRecordRepositoryMock.update).mock.calls[0][1]).toEqual({
      state: MealRecordState.DRAFT,
    });
  });

  it('should return null if user is not creator or admin', async () => {
    asMock(mealRecordRepositoryMock.get).mockResolvedValue(record);

    const dto: UpdateMealRecordUsecaseDto = {
      id: 'record-1',
      state: MealRecordState.DRAFT,
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });
});
