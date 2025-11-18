import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { MealDay } from '@services/db/models/meal-day.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { DeleteMealDayUsecase } from '@src/usecases/nutri/meal-day/delete.meal-day.usecase';
import { DeleteMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteMealDayUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealDayRepositoryMock: MockProxy<BddServiceMealDayMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteMealDayUsecase;

  const now = new Date('2024-05-05T00:00:00.000Z');
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

    usecase = new DeleteMealDayUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete a meal day when the session belongs to an admin', async () => {
    mealDayRepositoryMock.get.mockResolvedValue(mealDay);
    mealDayRepositoryMock.delete.mockResolvedValue(true);
    const dto: DeleteMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.delete).toHaveBeenCalledWith(mealDay.id);
    expect(result).toBe(true);
  });

  it('should delete a meal day when the session belongs to the creator', async () => {
    mealDayRepositoryMock.get.mockResolvedValue(mealDay);
    mealDayRepositoryMock.delete.mockResolvedValue(true);
    const dto: DeleteMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: mealDay.createdBy, role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.delete).toHaveBeenCalledWith(mealDay.id);
    expect(result).toBe(true);
  });

  it('should return false when the meal day does not exist', async () => {
    mealDayRepositoryMock.get.mockResolvedValue(null);
    const dto: DeleteMealDayUsecaseDto = {
      id: 'missing',
      session: { userId: 'coach-123', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
    expect(mealDayRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it('should reject when the session is not allowed to delete the meal day', async () => {
    mealDayRepositoryMock.get.mockResolvedValue({ ...mealDay, createdBy: 'other-coach' });
    const dto: DeleteMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'coach-123', role: Role.COACH },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_MEAL_DAY_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(mealDayRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it('should log and throw a domain error when deletion fails', async () => {
    mealDayRepositoryMock.get.mockResolvedValue(mealDay);
    const failure = new Error('delete failed');
    mealDayRepositoryMock.delete.mockRejectedValue(failure);
    const dto: DeleteMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_MEAL_DAY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteMealDayUsecase#execute => ${failure.message}`,
    );
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('lookup failed');
    mealDayRepositoryMock.get.mockRejectedValue(failure);
    const dto: DeleteMealDayUsecaseDto = {
      id: mealDay.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_MEAL_DAY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteMealDayUsecase#execute => ${failure.message}`,
    );
  });
});
