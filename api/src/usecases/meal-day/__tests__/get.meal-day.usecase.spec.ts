import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { MealDay } from '@services/db/models/meal-day.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { GetMealDayUsecase } from '@usecases/meal-day/get.meal-day.usecase';
import { GetMealDayUsecaseDto } from '@usecases/meal-day/meal-day.usecase.dto';
import { mapMealDayToUsecase } from '@usecases/meal-day/meal-day.mapper';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetMealDayUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealDayRepositoryMock: MockProxy<BddServiceMealDayMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetMealDayUsecase;

  const now = new Date('2024-02-02T00:00:00.000Z');
  const mealDay: MealDay = {
    id: 'meal-day-1',
    slug: 'strength-day',
    locale: 'en-us',
    label: 'Strength Day',
    description: 'High intensity focus',
    mealIds: ['meal-1', 'meal-2'],
    visibility: 'public',
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

    usecase = new GetMealDayUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the meal day for an admin session', async () => {
    mealDayRepositoryMock.get.mockResolvedValue(mealDay);
    const dto: GetMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.get).toHaveBeenCalledWith({ id: mealDay.id });
    expect(result).toEqual(mapMealDayToUsecase(mealDay));
    expect(result?.mealIds).not.toBe(mealDay.mealIds);
  });

  it('should return the meal day for its creator regardless of role', async () => {
    mealDayRepositoryMock.get.mockResolvedValue({ ...mealDay, createdBy: 'athlete-7', visibility: 'private' });
    const dto: GetMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'athlete-7', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toEqual(mapMealDayToUsecase({ ...mealDay, createdBy: 'athlete-7', visibility: 'private' }));
  });

  it('should allow coaches to access public meal days they do not own', async () => {
    mealDayRepositoryMock.get.mockResolvedValue({ ...mealDay, createdBy: 'coach-999', visibility: 'public' });
    const dto: GetMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'coach-123', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(result).toEqual(mapMealDayToUsecase({ ...mealDay, createdBy: 'coach-999', visibility: 'public' }));
  });

  it('should return null when the repository returns null', async () => {
    mealDayRepositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute({ id: 'missing', session: { userId: 'coach-1', role: Role.COACH } });

    expect(result).toBeNull();
  });

  it('should reject when the session is not allowed to access the meal day', async () => {
    mealDayRepositoryMock.get.mockResolvedValue({ ...mealDay, visibility: 'private', createdBy: 'coach-999' });
    const dto: GetMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_MEAL_DAY_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('lookup failed');
    mealDayRepositoryMock.get.mockRejectedValue(failure);
    const dto: GetMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_MEAL_DAY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `GetMealDayUsecase#execute => ${failure.message}`,
    );
  });
});
