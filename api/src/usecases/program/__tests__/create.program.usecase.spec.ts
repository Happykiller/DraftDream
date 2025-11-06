import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { Program } from '@services/db/models/program.model';
import { CreateProgramUsecase } from '@usecases/program/create.program.usecase';
import { CreateProgramUsecaseDto } from '@usecases/program/program.usecase.dto';
import { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateProgramUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRepositoryMock: BddServiceProgramMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateProgramUsecase;

  const dto: CreateProgramUsecaseDto = {
    slug: 'strength',
    locale: 'en-US',
    label: 'Strength',
    duration: 6,
    frequency: 3,
    description: 'Program description',
    sessions: [],
    createdBy: 'coach-123',
  } as CreateProgramUsecaseDto;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const program: Program = {
    id: 'program-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    duration: 6,
    frequency: 3,
    description: 'Program description',
    sessions: [
      {
        id: 'session-1',
        templateSessionId: 'template-session-1',
        slug: 'session-1',
        locale: 'en-us',
        label: 'Session 1',
        durationMin: 45,
        description: 'Session description',
        exercises: [
          {
            id: 'exercise-1',
            templateExerciseId: 'template-exercise-1',
            label: 'Push Ups',
            description: 'Exercise description',
            instructions: 'Do it well',
            series: '3',
            repetitions: '12',
            charge: 'Bodyweight',
            restSeconds: 90,
            videoUrl: 'https://example.com/video',
            level: 'beginner',
            categoryIds: ['cat-1'],
            muscleIds: ['muscle-1'],
            equipmentIds: ['equipment-1'],
            tagIds: ['tag-1'],
          },
        ],
      },
    ],
    userId: 'athlete-1',
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  const expectedProgram: ProgramUsecaseModel = {
    id: 'program-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    duration: 6,
    frequency: 3,
    description: 'Program description',
    sessions: [
      {
        id: 'session-1',
        templateSessionId: 'template-session-1',
        slug: 'session-1',
        locale: 'en-us',
        label: 'Session 1',
        durationMin: 45,
        description: 'Session description',
        exercises: [
          {
            id: 'exercise-1',
            templateExerciseId: 'template-exercise-1',
            label: 'Push Ups',
            description: 'Exercise description',
            instructions: 'Do it well',
            series: '3',
            repetitions: '12',
            charge: 'Bodyweight',
            restSeconds: 90,
            videoUrl: 'https://example.com/video',
            level: 'beginner',
            categoryIds: ['cat-1'],
            muscleIds: ['muscle-1'],
            equipmentIds: ['equipment-1'],
            tagIds: ['tag-1'],
          },
        ],
      },
    ],
    userId: 'athlete-1',
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    programRepositoryMock = {
      create: createMockFn(),
    } as unknown as BddServiceProgramMongo;

    bddServiceMock = {
      program: programRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateProgramUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a program and map the result', async () => {
    asMock(programRepositoryMock.create).mockResolvedValue(program);

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.create).mock.calls[0]).toEqual([dto]);
    expect(result).toEqual(expectedProgram);
  });

  it('should return null when creation fails due to conflicts', async () => {
    asMock(programRepositoryMock.create).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository throws', async () => {
    const failure = new Error('database failure');
    asMock(programRepositoryMock.create).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_PROGRAM_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateProgramUsecase#execute => ${failure.message}`,
    ]);
  });
});
