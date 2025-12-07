import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealDay } from '@services/db/models/meal-day.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { UpdateMealDayUsecase } from '@src/usecases/nutri/meal-day/update.meal-day.usecase';
import { UpdateMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';

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

describe('UpdateMealDayUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealDayRepositoryMock: MockProxy<BddServiceMealDayMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateMealDayUsecase;

  const now = new Date('2024-04-04T00:00:00.000Z');
  const mealDay: MealDay = {
    id: 'meal-day-1',
    slug: 'updated-day',
    locale: 'en-us',
    label: 'Updated Day',
    description: 'New focus',
    mealIds: ['meal-3'],
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

    usecase = new UpdateMealDayUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update a meal day through the repository', async () => {
    mealDayRepositoryMock.update.mockResolvedValue(mealDay);
    const dto: UpdateMealDayUsecaseDto = {
      id: mealDay.id,
      label: 'Updated Day',
      description: 'New focus',
      mealIds: ['meal-3'],
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.update).toHaveBeenCalledWith(mealDay.id, {
      ...dto,
      slug: 'updated-day',
    });
    expect(result).toEqual(mapMealDayToUsecase(mealDay));
    expect(result?.mealIds).not.toBe(mealDay.mealIds);
  });

  it('should return null when the repository returns null', async () => {
    mealDayRepositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute({ id: 'missing' });

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('update failure');
    mealDayRepositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute({ id: mealDay.id })).rejects.toThrow(ERRORS.UPDATE_MEAL_DAY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `UpdateMealDayUsecase#execute => ${failure.message}`,
    );
  });
});
