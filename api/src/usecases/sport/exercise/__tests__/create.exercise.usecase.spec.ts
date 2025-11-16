import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { Exercise } from '@services/db/models/exercise.model';
import { CreateExerciseUsecase } from '@src/usecases/sport/exercise/create.exercise.usecase';
import { CreateExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateExerciseUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let exerciseRepositoryMock: MockProxy<BddServiceExerciseMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateExerciseUsecase;

  const dto: CreateExerciseUsecaseDto = {
    slug: 'push-up',
    locale: 'en-US',
    label: 'Push-up',
    description: 'A classic upper body exercise.',
    instructions: 'Keep your body straight.',
    series: '3',
    repetitions: '12',
    rest: 60,
    visibility: 'public',
    categoryIds: ['category-1'],
    muscleIds: ['muscle-1'],
    equipmentIds: ['equipment-1'],
    tagIds: ['tag-1'],
    createdBy: 'user-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const exercise: Exercise = {
    id: 'exercise-1',
    slug: 'push-up',
    locale: 'en-us',
    label: 'Push-up',
    description: 'A classic upper body exercise.',
    instructions: 'Keep your body straight.',
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
    createdBy: 'user-123',
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
    createdBy: 'user-123',
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

    usecase = new CreateExerciseUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create an exercise and map the response', async () => {
    exerciseRepositoryMock.create.mockResolvedValue(exercise);

    const result = await usecase.execute(dto);

    expect(exerciseRepositoryMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mappedExercise);
  });

  it('should return null when the repository returns null', async () => {
    exerciseRepositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    exerciseRepositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_EXERCISE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateExerciseUsecase#execute => ${failure.message}`,
    );
  });
});
