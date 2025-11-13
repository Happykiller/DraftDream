import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { GetMealTypeUsecase } from '@usecases/meal-type/get.meal-type.usecase';
import { GetMealTypeUsecaseDto } from '@usecases/meal-type/meal-type.usecase.dto';
import { MealTypeUsecaseModel } from '@usecases/meal-type/meal-type.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetMealTypeUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealTypeRepositoryMock: MockProxy<BddServiceMealTypeMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetMealTypeUsecase;

  const dto: GetMealTypeUsecaseDto = {
    id: 'meal-type-24',
  };

  const mealType: MealTypeUsecaseModel = {
    id: 'meal-type-24',
    slug: 'lunch',
    locale: 'en-US',
    label: 'Lunch',
    icon: 'lunch',
    visibility: 'private',
    createdBy: 'coach-7',
    createdAt: new Date('2024-03-01T12:00:00.000Z'),
    updatedAt: new Date('2024-03-15T12:00:00.000Z'),
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealTypeRepositoryMock = mock<BddServiceMealTypeMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { mealType: BddServiceMealTypeMongo }).mealType =
      mealTypeRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetMealTypeUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the meal type retrieved from the repository', async () => {
    mealTypeRepositoryMock.get.mockResolvedValue(mealType);

    const result = await usecase.execute(dto);

    expect(mealTypeRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(mealType);
    expect(result).not.toBe(mealType);
  });

  it('should return null when the meal type is not found', async () => {
    mealTypeRepositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('repository failure');
    mealTypeRepositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_MEAL_TYPE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `GetMealTypeUsecase#execute => ${failure.message}`,
    );
  });
});
