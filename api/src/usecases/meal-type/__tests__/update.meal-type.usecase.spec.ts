import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { UpdateMealTypeUsecase } from '@usecases/meal-type/update.meal-type.usecase';
import { UpdateMealTypeUsecaseDto } from '@usecases/meal-type/meal-type.usecase.dto';
import { MealTypeUsecaseModel } from '@usecases/meal-type/meal-type.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateMealTypeUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealTypeRepositoryMock: MockProxy<BddServiceMealTypeMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateMealTypeUsecase;

  const dto: UpdateMealTypeUsecaseDto = {
    id: 'meal-type-12',
    slug: 'post-workout',
    locale: 'en-US',
    label: 'Post workout',
    icon: 'shaker',
    visibility: 'public',
  };

  const updatedMealType: MealTypeUsecaseModel = {
    id: 'meal-type-12',
    slug: 'post-workout',
    locale: 'en-us',
    label: 'Post workout',
    icon: 'shaker',
    visibility: 'public',
    createdBy: 'coach-11',
    createdAt: new Date('2024-02-01T10:00:00.000Z'),
    updatedAt: new Date('2024-04-01T10:00:00.000Z'),
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

    usecase = new UpdateMealTypeUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the meal type through the repository', async () => {
    mealTypeRepositoryMock.update.mockResolvedValue(updatedMealType);

    const result = await usecase.execute(dto);

    expect(mealTypeRepositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
      icon: dto.icon,
      visibility: dto.visibility,
    });
    expect(result).toEqual(updatedMealType);
    expect(result).not.toBe(updatedMealType);
  });

  it('should return null when the repository returns null', async () => {
    mealTypeRepositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('update failure');
    mealTypeRepositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_MEAL_TYPE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `UpdateMealTypeUsecase#execute => ${failure.message}`,
    );
  });
});
