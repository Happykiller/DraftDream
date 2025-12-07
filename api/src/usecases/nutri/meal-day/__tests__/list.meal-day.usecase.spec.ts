import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { MealDay } from '@services/db/models/meal-day.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealDayMongo } from '@services/db/mongo/repositories/meal-day.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { ListMealDaysUsecase } from '@src/usecases/nutri/meal-day/list.meal-days.usecase';
import { ListMealDaysUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListMealDaysUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealDayRepositoryMock: MockProxy<BddServiceMealDayMongo>;
  let userRepositoryMock: MockProxy<BddServiceUserMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListMealDaysUsecase;

  const now = new Date('2024-03-03T00:00:00.000Z');
  const mealDays: MealDay[] = [
    {
      id: 'meal-day-1',
      slug: 'strength-day',
      locale: 'en-us',
      label: 'Strength Day',
      description: 'High intensity focus',
      mealIds: ['meal-1', 'meal-2'],
      visibility: 'PUBLIC',
      createdBy: 'coach-123',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'meal-day-2',
      slug: 'recovery-day',
      locale: 'en-us',
      label: 'Recovery Day',
      description: 'Restorative meals',
      mealIds: ['meal-3', 'meal-4'],
      visibility: 'PRIVATE',
      createdBy: 'coach-456',
      createdAt: now,
      updatedAt: now,
    },
  ];

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealDayRepositoryMock = mock<BddServiceMealDayMongo>();
    userRepositoryMock = mock<BddServiceUserMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { mealDay: BddServiceMealDayMongo }).mealDay = mealDayRepositoryMock;
    (bddServiceMock as unknown as { user: BddServiceUserMongo }).user = userRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    userRepositoryMock.listUsers.mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

    usecase = new ListMealDaysUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list meal days for an admin session', async () => {
    mealDayRepositoryMock.list.mockResolvedValue({
      items: mealDays,
      total: mealDays.length,
      page: 2,
      limit: 5,
    });
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
      page: 2,
      limit: 5,
      locale: 'en-US',
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.list).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      locale: 'en-US',
    });
    expect(result).toEqual({
      items: mealDays.map(mapMealDayToUsecase),
      total: mealDays.length,
      page: 2,
      limit: 5,
    });
    expect(result.items[0]).not.toBe(mealDays[0]);
  });

  it('should list only owned meal days for a coach when createdBy matches the session user', async () => {
    mealDayRepositoryMock.list.mockResolvedValue({
      items: [mealDays[0]],
      total: 1,
      page: 1,
      limit: 20,
    });
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'coach-123', role: Role.COACH },
      createdBy: 'coach-123',
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.list).toHaveBeenCalledWith({ createdBy: 'coach-123' });
    expect(result).toEqual({
      items: [mapMealDayToUsecase(mealDays[0])],
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it('should allow a coach to list public meal days of allowed creators', async () => {
    userRepositoryMock.listUsers.mockResolvedValue({
      items: [{ id: 'admin-9' } as any],
      total: 1,
      page: 1,
      limit: 50,
    });
    mealDayRepositoryMock.list.mockResolvedValue({
      items: [mealDays[0]],
      total: 1,
      page: 1,
      limit: 20,
    });
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'coach-123', role: Role.COACH },
      createdBy: 'admin-9',
      page: 1,
      limit: 20,
    };

    const result = await usecase.execute(dto);

    expect(userRepositoryMock.listUsers).toHaveBeenCalledWith({
      type: 'admin',
      limit: 50,
      page: 1,
    });
    expect(mealDayRepositoryMock.list).toHaveBeenCalledWith({
      createdBy: 'admin-9',
      visibility: 'PUBLIC',
      page: 1,
      limit: 20,
    });
    expect(result).toEqual({
      items: [mapMealDayToUsecase(mealDays[0])],
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it('should list accessible meal days for a coach when no creator filter is provided', async () => {
    userRepositoryMock.listUsers.mockResolvedValue({
      items: [{ id: 'admin-9' } as any],
      total: 1,
      page: 1,
      limit: 50,
    });
    mealDayRepositoryMock.list.mockResolvedValue({
      items: mealDays,
      total: mealDays.length,
      page: 1,
      limit: 20,
    });
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'coach-123', role: Role.COACH },
      page: 1,
      limit: 20,
    };

    const result = await usecase.execute(dto);

    expect(mealDayRepositoryMock.list).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      accessibleFor: { ownerId: 'coach-123', includeCreatorIds: ['admin-9'] },
    });
    expect(result.items).toHaveLength(mealDays.length);
    expect(result.items[0]).toEqual(mapMealDayToUsecase(mealDays[0]));
  });

  it('should reject when a coach requests unauthorized creator data', async () => {
    userRepositoryMock.listUsers.mockResolvedValue({
      items: [{ id: 'admin-1' } as any],
      total: 1,
      page: 1,
      limit: 50,
    });
    mealDayRepositoryMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'coach-123', role: Role.COACH },
      createdBy: 'athlete-77',
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEAL_DAYS_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(mealDayRepositoryMock.list).not.toHaveBeenCalled();
  });

  it('should reject when a coach provides the createdByIn filter', async () => {
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'coach-123', role: Role.COACH },
      createdByIn: ['coach-1'],
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEAL_DAYS_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(mealDayRepositoryMock.list).not.toHaveBeenCalled();
  });

  it('should reject when the session role is neither admin nor coach', async () => {
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEAL_DAYS_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('listing failed');
    mealDayRepositoryMock.list.mockRejectedValue(failure);
    const dto: ListMealDaysUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEAL_DAYS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `ListMealDaysUsecase#execute => ${failure.message}`,
    );
  });
});
