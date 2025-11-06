import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { Exercise } from '@services/db/models/exercise.model';
import { ListExercisesUsecase } from '@usecases/exercise/list.exercises.usecase';
import { ListExercisesUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListExercisesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let exerciseRepositoryMock: MockProxy<BddServiceExerciseMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListExercisesUsecase;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const exercise: Exercise = {
    id: 'exercise-1',
    slug: 'push-up',
    locale: 'en-us',
    label: 'Push-up',
    description: 'A classic upper body exercise.',
    instructions: 'Keep your body straight.',
    level: 'beginner',
    series: '3',
    repetitions: '12',
    charge: 'bodyweight',
    rest: 60,
    videoUrl: 'https://cdn.local/push-up.mp4',
    visibility: 'public',
    categories: [
      {
        id: 'category-1',
        slug: 'cat',
        locale: 'en-us',
        label: 'Category',
        visibility: 'public',
        createdBy: 'user-123',
        createdAt: now,
        updatedAt: now,
      },
    ],
    muscles: [
      {
        id: 'muscle-1',
        slug: 'muscle',
        locale: 'en-us',
        label: 'Muscle',
        visibility: 'public',
        createdBy: 'user-123',
        createdAt: now,
        updatedAt: now,
      },
    ],
    equipment: [
      {
        id: 'equipment-1',
        slug: 'equipment',
        locale: 'en-us',
        label: 'Equipment',
        visibility: 'public',
        createdBy: 'user-123',
        createdAt: now,
        updatedAt: now,
      },
    ],
    tags: [
      {
        id: 'tag-1',
        slug: 'tag',
        locale: 'en-us',
        label: 'Tag',
        visibility: 'public',
        createdBy: 'user-123',
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdBy: 'user-456',
    createdAt: now,
    updatedAt: now,
  };

  const mappedExercise: ExerciseUsecaseModel = {
    id: 'exercise-1',
    slug: 'push-up',
    locale: 'en-us',
    label: 'Push-up',
    description: 'A classic upper body exercise.',
    instructions: 'Keep your body straight.',
    level: 'beginner',
    series: '3',
    repetitions: '12',
    charge: 'bodyweight',
    rest: 60,
    videoUrl: 'https://cdn.local/push-up.mp4',
    visibility: 'public',
    categoryIds: ['category-1'],
    muscleIds: ['muscle-1'],
    equipmentIds: ['equipment-1'],
    tagIds: ['tag-1'],
    createdBy: 'user-456',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    exerciseRepositoryMock = mock<BddServiceExerciseMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { exercise: BddServiceExerciseMongo }).exercise = exerciseRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListExercisesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list exercises for an admin without altering the payload', async () => {
    exerciseRepositoryMock.list.mockResolvedValue({ items: [exercise], total: 1, page: 2, limit: 5 });

    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
      page: 2,
      limit: 5,
      q: 'push',
      locale: 'en-US',
    };

    const result = await usecase.execute(dto);

    expect(exerciseRepositoryMock.list).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      q: 'push',
      locale: 'en-US',
    });
    expect(result).toEqual({ items: [mappedExercise], total: 1, page: 2, limit: 5 });
  });

  it('should allow a coach to list only exercises they created when specifying createdBy', async () => {
    exerciseRepositoryMock.list.mockResolvedValue({ items: [exercise], total: 1, page: 1, limit: 10 });

    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      createdBy: 'coach-1',
      visibility: 'private',
      page: 1,
      limit: 10,
    };

    const result = await usecase.execute(dto);

    expect(exerciseRepositoryMock.list).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      createdBy: 'coach-1',
      visibility: 'private',
    });
    expect(result.items).toEqual([mappedExercise]);
  });

  it('should throw when a coach attempts to list exercises created by another user', async () => {
    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      createdBy: 'coach-2',
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_EXERCISES_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(exerciseRepositoryMock.list).not.toHaveBeenCalled();
  });

  it('should allow a coach to list public exercises explicitly', async () => {
    exerciseRepositoryMock.list.mockResolvedValue({ items: [exercise], total: 1, page: 3, limit: 15 });

    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      visibility: 'public',
      page: 3,
      limit: 15,
    };

    await usecase.execute(dto);

    expect(exerciseRepositoryMock.list).toHaveBeenCalledWith({
      page: 3,
      limit: 15,
      visibility: 'public',
    });
  });

  it('should allow a coach to list their private and public exercises by default', async () => {
    exerciseRepositoryMock.list.mockResolvedValue({ items: [exercise], total: 1, page: 1, limit: 20 });

    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      page: 1,
      limit: 20,
      level: 'beginner',
    };

    await usecase.execute(dto);

    expect(exerciseRepositoryMock.list).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      level: 'beginner',
      createdByIn: ['coach-1'],
      includePublicVisibility: true,
    });
  });

  it('should allow a coach to list only private exercises when requesting private visibility', async () => {
    exerciseRepositoryMock.list.mockResolvedValue({ items: [exercise], total: 1, page: 1, limit: 10 });

    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      visibility: 'private',
      page: 1,
      limit: 10,
    };

    await usecase.execute(dto);

    expect(exerciseRepositoryMock.list).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      visibility: 'private',
      createdByIn: ['coach-1'],
      includePublicVisibility: false,
    });
  });

  it('should throw a forbidden error for unsupported roles', async () => {
    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_EXERCISES_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('database failure');
    exerciseRepositoryMock.list.mockRejectedValue(failure);

    const dto: ListExercisesUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_EXERCISES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `ListExercisesUsecase#execute => ${failure.message}`,
    );
  });
});
