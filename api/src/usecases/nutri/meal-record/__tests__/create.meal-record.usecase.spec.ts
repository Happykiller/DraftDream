import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealRecordMongo } from '@services/db/mongo/repositories/meal-record.repository';
import { MealRecord } from '@services/db/models/meal-record.model';
import { CreateMealRecordUsecase } from '@src/usecases/nutri/meal-record/create.meal-record.usecase';
import { CreateMealRecordUsecaseDto } from '@src/usecases/nutri/meal-record/meal-record.usecase.dto';
import { MealRecordUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';
import { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateMealRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let mealRecordRepositoryMock: BddServiceMealRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateMealRecordUsecase;

  const session = { userId: 'athlete-1', role: Role.ATHLETE };
  const dto: CreateMealRecordUsecaseDto = {
    mealPlanId: 'plan-1',
    mealDayId: 'day-1',
    mealId: 'meal-1',
    session,
  };

  const mealPlan: MealPlanUsecaseModel = {
    id: 'plan-1',
    slug: 'meal-plan',
    locale: 'en-us',
    label: 'Meal plan',
    visibility: 'PRIVATE',
    calories: 1200,
    proteinGrams: 90,
    carbGrams: 150,
    fatGrams: 40,
    days: [
      {
        id: 'day-1',
        label: 'Day 1',
        meals: [
          {
            id: 'meal-1',
            label: 'Breakfast',
            foods: 'Eggs',
            calories: 300,
            proteinGrams: 20,
            carbGrams: 10,
            fatGrams: 15,
            type: { label: 'Breakfast' },
          },
        ],
      },
    ],
    userId: 'athlete-1',
    createdBy: 'coach-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

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
      create: createMockFn(),
    } as unknown as BddServiceMealRecordMongo;

    bddServiceMock = {
      mealRecord: mealRecordRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      getMealPlanUsecase: { execute: createMockFn() },
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateMealRecordUsecase(inversifyMock);
  });

  it('should create a meal record for an athlete', async () => {
    asMock(inversifyMock.getMealPlanUsecase.execute).mockResolvedValue(mealPlan);
    asMock(mealRecordRepositoryMock.create).mockResolvedValue(record);

    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
    expect(asMock(mealRecordRepositoryMock.create).mock.calls[0][0]).toEqual({
      userId: 'athlete-1',
      mealPlanId: 'plan-1',
      mealDayId: 'day-1',
      mealId: 'meal-1',
      state: MealRecordState.CREATE,
      createdBy: 'athlete-1',
    });
  });

  it('should return null when meal is not in the plan day', async () => {
    asMock(inversifyMock.getMealPlanUsecase.execute).mockResolvedValue({
      ...mealPlan,
      days: [
        {
          id: 'day-1',
          label: 'Day 1',
          meals: [],
        },
      ],
    });

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should forbid athletes creating records for other users', async () => {
    await expect(
      usecase.execute({
        mealPlanId: 'plan-1',
        mealDayId: 'day-1',
        mealId: 'meal-1',
        userId: 'athlete-2',
        session,
      }),
    ).rejects.toThrow(ERRORS.FORBIDDEN);
  });
});
