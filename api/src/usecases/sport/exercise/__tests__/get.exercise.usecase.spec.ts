import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceExerciseMongo } from '@services/db/mongo/repositories/exercise.repository';
import { Exercise } from '@services/db/models/exercise.model';
import { GetExerciseUsecase } from '@src/usecases/sport/exercise/get.exercise.usecase';
import { GetExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import { GetExerciseDto } from '@services/db/dtos/exercise.dto';
import { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetExerciseUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let exerciseRepositoryMock: MockProxy<BddServiceExerciseMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetExerciseUsecase;

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
    visibility: 'PUBLIC',
    categories: [
      {
        id: 'category-1',
        slug: 'cat',
        locale: 'en-us',
        label: 'Category',
        visibility: 'PUBLIC',
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
        visibility: 'PUBLIC',
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
        visibility: 'PUBLIC',
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
        visibility: 'PUBLIC',
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
    series: '3',
    repetitions: '12',
    charge: 'bodyweight',
    rest: 60,
    videoUrl: 'https://cdn.local/push-up.mp4',
    visibility: 'PUBLIC',
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

    usecase = new GetExerciseUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return null when the repository returns null', async () => {
    (exerciseRepositoryMock.get as any).mockResolvedValue(null);

    const dto: GetExerciseUsecaseDto = {
      id: 'exercise-unknown',
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should return the mapped exercise for an admin session', async () => {
    (exerciseRepositoryMock.get as any).mockResolvedValue(exercise);

    const dto: GetExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(exerciseRepositoryMock.get).toHaveBeenCalledWith({ id: exercise.id });
    expect(result).toEqual(mappedExercise);
  });

  it('should return the exercise when requested by its creator', async () => {
    (exerciseRepositoryMock.get as any).mockResolvedValue({ ...exercise, createdBy: 'creator-1' });

    const dto: GetExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'creator-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result?.createdBy).toEqual('creator-1');
  });

  it('should return the exercise to a coach when visibility is public', async () => {
    (exerciseRepositoryMock.get as any).mockResolvedValue({ ...exercise, createdBy: 'owner-1', visibility: 'PUBLIC' });

    const dto: GetExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'coach-1', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(result?.createdBy).toEqual('owner-1');
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('database failure');
    (exerciseRepositoryMock.get as any).mockRejectedValue(failure);

    const dto: GetExerciseUsecaseDto = {
      id: exercise.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_EXERCISE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `GetExerciseUsecase#execute (exerciseId: ${exercise.id}) => ${failure.message}`,
    );
  });
});
