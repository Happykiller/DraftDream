import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { CreateMealTypeUsecase } from '@src/usecases/nutri/meal-type/create.meal-type.usecase';
import { CreateMealTypeUsecaseDto } from '@src/usecases/nutri/meal-type/meal-type.usecase.dto';
import { MealTypeUsecaseModel } from '@src/usecases/nutri/meal-type/meal-type.usecase.model';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateMealTypeUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealTypeRepositoryMock: MockProxy<BddServiceMealTypeMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateMealTypeUsecase;

  const dto: CreateMealTypeUsecaseDto = {
    locale: 'en-US',
    label: 'Breakfast',
    icon: 'coffee',
    visibility: 'PUBLIC',
    createdBy: 'coach-42',
  };

  const timestamp = new Date('2024-05-01T10:00:00.000Z');
  const mealType: MealTypeUsecaseModel = {
    id: 'meal-type-1',
    slug: 'breakfast',
    locale: 'en-us',
    label: 'Breakfast',
    visibility: 'PUBLIC',
    icon: 'coffee',
    createdBy: 'coach-42',
    createdAt: timestamp,
    updatedAt: timestamp,
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

    usecase = new CreateMealTypeUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a meal type through the repository', async () => {
    (mealTypeRepositoryMock.create as any).mockResolvedValue(mealType);

    const result = await usecase.execute(dto);

    expect(mealTypeRepositoryMock.create).toHaveBeenCalledWith({
      slug: 'breakfast',
      locale: dto.locale,
      label: dto.label,
      icon: dto.icon,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(mealType);
  });

  it('should return null when the repository returns null', async () => {
    (mealTypeRepositoryMock.create as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('persistence failure');
    (mealTypeRepositoryMock.create as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_MEAL_TYPE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateMealTypeUsecase#execute => ${failure.message}`,
    );
  });
});
