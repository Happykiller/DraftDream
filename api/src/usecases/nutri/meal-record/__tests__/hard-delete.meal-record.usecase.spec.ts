import { beforeEach, describe, expect, it } from '@jest/globals';

import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealRecordMongo } from '@services/db/mongo/repositories/meal-record.repository';
import { MealRecord } from '@services/db/models/meal-record.model';
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { HardDeleteMealRecordUsecase } from '@src/usecases/nutri/meal-record/hard-delete.meal-record.usecase';
import { DeleteMealRecordUsecaseDto } from '@src/usecases/nutri/meal-record/meal-record.usecase.dto';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('HardDeleteMealRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let mealRecordRepositoryMock: BddServiceMealRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: HardDeleteMealRecordUsecase;

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

  beforeEach(() => {
    mealRecordRepositoryMock = {
      get: createMockFn(),
      hardDelete: createMockFn(),
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

    usecase = new HardDeleteMealRecordUsecase(inversifyMock);
  });

  it('should hard delete a meal record for the creator', async () => {
    asMock(mealRecordRepositoryMock.get).mockResolvedValue(record);
    asMock(mealRecordRepositoryMock.hardDelete).mockResolvedValue(true);

    const dto: DeleteMealRecordUsecaseDto = {
      id: 'record-1',
      session: { userId: 'coach-1', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(result).toBe(true);
    expect(asMock(mealRecordRepositoryMock.hardDelete).mock.calls[0][0]).toBe('record-1');
  });

  it('should return false for non creators', async () => {
    asMock(mealRecordRepositoryMock.get).mockResolvedValue(record);

    const dto: DeleteMealRecordUsecaseDto = {
      id: 'record-1',
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });
});
