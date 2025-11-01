import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { GetMealUsecase } from '@usecases/meal/get.meal.usecase';
import { GetMealUsecaseDto } from '@usecases/meal/meal.usecase.dto';
import { MealUsecaseModel } from '@usecases/meal/meal.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetMealUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealRepositoryMock: MockProxy<BddServiceMealMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetMealUsecase;

  const dto: GetMealUsecaseDto = {
    id: 'meal-42',
  };

  const meal: MealUsecaseModel = {
    id: 'meal-42',
    slug: 'post-workout',
    locale: 'en-US',
    label: 'Post Workout',
    typeId: 'type-2',
    foods: 'Smoothie, Banana',
    calories: 500,
    proteinGrams: 35,
    carbGrams: 55,
    fatGrams: 12,
    visibility: 'private',
    createdBy: 'athlete-1',
    createdAt: new Date('2024-05-02T00:00:00.000Z'),
    updatedAt: new Date('2024-05-03T00:00:00.000Z'),
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealRepositoryMock = mock<BddServiceMealMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { meal: BddServiceMealMongo }).meal = mealRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetMealUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the meal retrieved from the repository', async () => {
    mealRepositoryMock.get.mockResolvedValue(meal);

    const result = await usecase.execute(dto);

    expect(mealRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(meal);
    expect(result).not.toBe(meal);
  });

  it('should return null when the meal is not found', async () => {
    mealRepositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('repository failure');
    mealRepositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_MEAL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `GetMealUsecase#execute => ${failure.message}`,
    );
  });
});
