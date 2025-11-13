import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { ListMealTypesUsecase } from '@usecases/meal-type/list.meal-type.usecase';
import { ListMealTypesUsecaseDto } from '@usecases/meal-type/meal-type.usecase.dto';
import { MealTypeUsecaseModel } from '@usecases/meal-type/meal-type.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListMealTypesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealTypeRepositoryMock: MockProxy<BddServiceMealTypeMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListMealTypesUsecase;

  const dto: ListMealTypesUsecaseDto = {
    page: 3,
    limit: 5,
    locale: 'fr-FR',
  };

  const mealTypes: MealTypeUsecaseModel[] = [
    {
      id: 'meal-type-1',
      slug: 'snack-matin',
      locale: 'fr-fr',
      label: 'Snack matin',
      icon: 'coffee',
      visibility: 'public',
      createdBy: 'coach-1',
      createdAt: new Date('2024-01-05T08:00:00.000Z'),
      updatedAt: new Date('2024-01-06T08:00:00.000Z'),
    },
    {
      id: 'meal-type-2',
      slug: 'diner',
      locale: 'fr-fr',
      label: 'Dîner',
      icon: 'dinner',
      visibility: 'private',
      createdBy: 'coach-2',
      createdAt: new Date('2024-02-05T18:00:00.000Z'),
      updatedAt: new Date('2024-02-06T18:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealTypeRepositoryMock = mock<BddServiceMealTypeMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { mealType: BddServiceMealTypeMongo }).mealType =
      mealTypeRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListMealTypesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list meal types through the repository', async () => {
    mealTypeRepositoryMock.list.mockResolvedValue({
      items: mealTypes,
      total: mealTypes.length,
      page: dto.page!,
      limit: dto.limit!,
    });

    const result = await usecase.execute(dto);

    expect(mealTypeRepositoryMock.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      items: mealTypes,
      total: mealTypes.length,
      page: dto.page,
      limit: dto.limit,
    });
    expect(result.items[0]).not.toBe(mealTypes[0]);
    expect(result.items[1]).not.toBe(mealTypes[1]);
  });

  it('should call the repository with default parameters when none are provided', async () => {
    mealTypeRepositoryMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await usecase.execute();

    expect(mealTypeRepositoryMock.list).toHaveBeenCalledWith({});
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('list failure');
    mealTypeRepositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEAL_TYPES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `ListMealTypesUsecase#execute => ${failure.message}`,
    );
  });
});
