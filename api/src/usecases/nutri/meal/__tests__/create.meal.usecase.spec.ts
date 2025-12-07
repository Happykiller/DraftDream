import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { CreateMealUsecase } from '@src/usecases/nutri/meal/create.meal.usecase';
import { CreateMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';
import { MealUsecaseModel } from '@src/usecases/nutri/meal/meal.usecase.model';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    // Simple slugify for testing purposes
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateMealUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealRepositoryMock: MockProxy<BddServiceMealMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateMealUsecase;

  const dto: CreateMealUsecaseDto = {
    locale: 'en-US',
    label: 'Balanced Meal',
    typeId: 'type-1',
    foods: 'Chicken, Rice, Broccoli',
    calories: 650,
    proteinGrams: 45,
    carbGrams: 60,
    fatGrams: 20,
    visibility: 'PUBLIC',
    createdBy: 'coach-1',
  };

  const now = new Date('2024-05-01T00:00:00.000Z');
  const meal: MealUsecaseModel = {
    id: 'meal-1',
    slug: 'balanced-meal',
    locale: 'en-us',
    label: 'Balanced Meal',
    typeId: 'type-1',
    foods: 'Chicken, Rice, Broccoli',
    calories: 650,
    proteinGrams: 45,
    carbGrams: 60,
    fatGrams: 20,
    visibility: 'PUBLIC',
    createdBy: 'coach-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealRepositoryMock = mock<BddServiceMealMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { meal: BddServiceMealMongo }).meal = mealRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateMealUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a meal through the repository', async () => {
    mealRepositoryMock.create.mockResolvedValue(meal);

    const result = await usecase.execute(dto);

    expect(mealRepositoryMock.create).toHaveBeenCalledWith({
      slug: 'balanced-meal',
      locale: dto.locale,
      label: dto.label,
      typeId: dto.typeId,
      foods: dto.foods,
      calories: dto.calories,
      proteinGrams: dto.proteinGrams,
      carbGrams: dto.carbGrams,
      fatGrams: dto.fatGrams,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(meal);
    expect(result).not.toBe(meal);
  });

  it('should return null when the repository returns null', async () => {
    mealRepositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    mealRepositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_MEAL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateMealUsecase#execute => ${failure.message}`,
    );
  });
});
