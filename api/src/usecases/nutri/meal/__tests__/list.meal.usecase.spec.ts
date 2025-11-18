import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { ListMealsUsecase } from '@src/usecases/nutri/meal/list.meal.usecase';
import { ListMealsUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';
import { MealUsecaseModel } from '@src/usecases/nutri/meal/meal.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListMealsUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealRepositoryMock: MockProxy<BddServiceMealMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListMealsUsecase;

  const dto: ListMealsUsecaseDto = {
    page: 3,
    limit: 15,
    locale: 'en-US',
    typeId: 'type-3',
  };

  const meals: MealUsecaseModel[] = [
    {
      id: 'meal-1',
      slug: 'breakfast-boost',
      locale: 'en-US',
      label: 'Breakfast Boost',
      typeId: 'type-3',
      foods: 'Oatmeal, Berries',
      calories: 400,
      proteinGrams: 20,
      carbGrams: 50,
      fatGrams: 12,
      visibility: 'public',
      createdBy: 'coach-2',
      createdAt: new Date('2024-05-04T00:00:00.000Z'),
      updatedAt: new Date('2024-05-05T00:00:00.000Z'),
    },
    {
      id: 'meal-2',
      slug: 'recovery-dinner',
      locale: 'en-US',
      label: 'Recovery Dinner',
      typeId: 'type-4',
      foods: 'Salmon, Quinoa, Spinach',
      calories: 700,
      proteinGrams: 50,
      carbGrams: 55,
      fatGrams: 25,
      visibility: 'private',
      createdBy: 'coach-3',
      createdAt: new Date('2024-05-06T00:00:00.000Z'),
      updatedAt: new Date('2024-05-07T00:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealRepositoryMock = mock<BddServiceMealMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { meal: BddServiceMealMongo }).meal = mealRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListMealsUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list meals through the repository', async () => {
    mealRepositoryMock.list.mockResolvedValue({
      items: meals,
      total: meals.length,
      page: dto.page!,
      limit: dto.limit!,
    });

    const result = await usecase.execute(dto);

    expect(mealRepositoryMock.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      items: meals,
      total: meals.length,
      page: dto.page,
      limit: dto.limit,
    });
    expect(result.items[0]).not.toBe(meals[0]);
    expect(result.items[1]).not.toBe(meals[1]);
  });

  it('should call the repository with default parameters when none are provided', async () => {
    mealRepositoryMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await usecase.execute();

    expect(mealRepositoryMock.list).toHaveBeenCalledWith({});
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('list failure');
    mealRepositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEALS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `ListMealsUsecase#execute => ${failure.message}`,
    );
  });
});
