import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { Exercise } from '@services/db/models/exercise.model';
import { UpdateExerciseUsecase } from '@usecases/exercise/update.exercise.usecase';
import { UpdateExerciseUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateExerciseUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let exerciseRepositoryMock: MockProxy<BddServiceExerciseMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateExerciseUsecase;

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

    usecase = new UpdateExerciseUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the exercise and map the response', async () => {
    exerciseRepositoryMock.update.mockResolvedValue(exercise);

    const patch: UpdateExerciseUsecaseDto = {
      label: 'Push-up Advanced',
      visibility: 'private',
    };

    const result = await usecase.execute(exercise.id, patch);

    expect(exerciseRepositoryMock.update).toHaveBeenCalledWith(exercise.id, patch);
    expect(result).toEqual(mappedExercise);
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('database failure');
    exerciseRepositoryMock.update.mockRejectedValue(failure);

    const patch: UpdateExerciseUsecaseDto = {
      label: 'Push-up Advanced',
    };

    await expect(usecase.execute(exercise.id, patch)).rejects.toThrow(ERRORS.UPDATE_EXERCISE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `UpdateExerciseUsecase#execute => ${failure.message}`,
    );
  });
});
