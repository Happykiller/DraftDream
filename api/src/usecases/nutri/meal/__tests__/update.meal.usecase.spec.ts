import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { UpdateMealUsecase } from '@src/usecases/nutri/meal/update.meal.usecase';
import { UpdateMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';
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

describe('UpdateMealUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealRepositoryMock: MockProxy<BddServiceMealMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateMealUsecase;

  const dto: UpdateMealUsecaseDto = {
    id: 'meal-9',
    locale: 'en-US',
    label: 'Evening Refuel',
    typeId: 'type-5',
    foods: 'Tofu Stir Fry',
    calories: 550,
    proteinGrams: 35,
    carbGrams: 45,
    fatGrams: 18,
    visibility: 'private',
  };

  const updatedMeal: MealUsecaseModel = {
    id: 'meal-9',
    slug: 'evening-refuel',
    locale: 'en-US',
    label: 'Evening Refuel',
    typeId: 'type-5',
    foods: 'Tofu Stir Fry',
    calories: 550,
    proteinGrams: 35,
    carbGrams: 45,
    fatGrams: 18,
    visibility: 'private',
    createdBy: 'coach-4',
    createdAt: new Date('2024-05-08T00:00:00.000Z'),
    updatedAt: new Date('2024-05-09T00:00:00.000Z'),
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealRepositoryMock = mock<BddServiceMealMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { meal: BddServiceMealMongo }).meal = mealRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new UpdateMealUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the meal through the repository', async () => {
    mealRepositoryMock.update.mockResolvedValue(updatedMeal);

    const result = await usecase.execute(dto);

    expect(mealRepositoryMock.update).toHaveBeenCalledWith(dto.id, {
      ...dto,
      slug: 'evening-refuel',
    });
    expect(result).toEqual(updatedMeal);
    expect(result).not.toBe(updatedMeal);
  });

  it('should return null when the repository returns null', async () => {
    mealRepositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('update failure');
    mealRepositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_MEAL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `UpdateMealUsecase#execute => ${failure.message}`,
    );
  });
});
