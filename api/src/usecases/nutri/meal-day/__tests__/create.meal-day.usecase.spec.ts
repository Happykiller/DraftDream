import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { CreateMealDayUsecase } from '@src/usecases/nutri/meal-day/create.meal-day.usecase';
import { CreateMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateMealDayUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealDayRepositoryMock: MockProxy<BddServiceMealDayMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateMealDayUsecase;

  const dto: CreateMealDayUsecaseDto = {
    locale: 'en-US',
    label: 'Strength Day',
    description: 'High intensity focus',
    mealIds: ['meal-1', 'meal-2'],
    visibility: 'PUBLIC',
    createdBy: 'coach-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const mealDay: MealDayUsecaseModel = {
    id: 'meal-day-1',
    slug: 'strength-day',
    locale: 'en-us',
    label: 'Strength Day',
    description: 'High intensity focus',
    mealIds: ['meal-1', 'meal-2'],
    visibility: 'PUBLIC',
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealDayRepositoryMock = mock<BddServiceMealDayMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { mealDay: BddServiceMealDayMongo }).mealDay = mealDayRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateMealDayUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a meal day through the repository', async () => {
    (mealDayRepositoryMock.create as any).mockResolvedValue(mealDay as any);

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.create).toHaveBeenCalledWith({
      ...dto,
      slug: 'strength-day',
    });
    expect(result).toEqual(mealDay);
  });

  it('should return null when the repository returns null', async () => {
    (mealDayRepositoryMock.create as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    (mealDayRepositoryMock.create as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_MEAL_DAY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateMealDayUsecase#execute => ${failure.message}`,
    );
  });
});
