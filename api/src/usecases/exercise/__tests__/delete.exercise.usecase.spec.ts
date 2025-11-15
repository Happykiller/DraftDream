import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { Exercise } from '@services/db/models/exercise.model';
import { DeleteExerciseUsecase } from '@usecases/exercise/delete.exercise.usecase';
import { DeleteExerciseUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteExerciseUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let exerciseRepositoryMock: MockProxy<BddServiceExerciseMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteExerciseUsecase;

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
    createdBy: 'owner-1',
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

    usecase = new DeleteExerciseUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return false when the exercise does not exist', async () => {
    exerciseRepositoryMock.get.mockResolvedValue(null);

    const dto: DeleteExerciseUsecaseDto = {
      id: 'exercise-unknown',
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
    expect(exerciseRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it('should delete the exercise when requested by an admin', async () => {
    exerciseRepositoryMock.get.mockResolvedValue(exercise);
    exerciseRepositoryMock.delete.mockResolvedValue(true);

    const dto: DeleteExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(exerciseRepositoryMock.delete).toHaveBeenCalledWith(exercise.id);
    expect(result).toBe(true);
  });

  it('should delete the exercise when requested by its creator', async () => {
    exerciseRepositoryMock.get.mockResolvedValue({ ...exercise, createdBy: 'creator-1' });
    exerciseRepositoryMock.delete.mockResolvedValue(true);

    const dto: DeleteExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'creator-1', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(exerciseRepositoryMock.delete).toHaveBeenCalledWith(exercise.id);
    expect(result).toBe(true);
  });

  it('should throw a forbidden error when the user is neither admin nor creator', async () => {
    exerciseRepositoryMock.get.mockResolvedValue(exercise);

    const dto: DeleteExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'coach-2', role: Role.COACH },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_EXERCISE_FORBIDDEN);
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(exerciseRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it('should log and throw a domain error when deletion fails', async () => {
    const failure = new Error('database failure');
    exerciseRepositoryMock.get.mockRejectedValue(failure);

    const dto: DeleteExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_EXERCISE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteExerciseUsecase#execute => ${failure.message}`,
    );
  });
});
