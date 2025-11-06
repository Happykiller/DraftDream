import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { CreateSessionUsecase } from '@usecases/session/create.session.usecase';
import { CreateSessionUsecaseDto } from '@usecases/session/session.usecase.dto';
import { SessionUsecaseModel } from '@usecases/session/session.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

const now = new Date('2024-01-01T00:00:00.000Z');
const sessionEntity = {
  id: 'session-1',
  slug: 'upper-body',
  locale: 'en-us',
  label: 'Upper Body',
  durationMin: 60,
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: { id: 'coach-1' },
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

const sessionUsecaseModel: SessionUsecaseModel = {
  id: 'session-1',
  slug: 'upper-body',
  locale: 'en-us',
  label: 'Upper Body',
  durationMin: 60,
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: 'coach-1',
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

const dto: CreateSessionUsecaseDto = {
  slug: 'upper-body',
  locale: 'en-US',
  label: 'Upper Body',
  durationMin: 60,
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: 'coach-1',
};

describe('CreateSessionUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let sessionRepositoryMock: BddServiceSessionMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateSessionUsecase;

  beforeEach(() => {
    sessionRepositoryMock = {
      create: createMockFn(),
    } as unknown as BddServiceSessionMongo;

    bddServiceMock = {
      session: sessionRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateSessionUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a session through the repository', async () => {
    asMock(sessionRepositoryMock.create).mockResolvedValue(sessionEntity);

    const result = await usecase.execute(dto);

    expect(asMock(sessionRepositoryMock.create).mock.calls[0]).toEqual([
      {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        durationMin: dto.durationMin,
        description: dto.description,
        exerciseIds: dto.exerciseIds,
        createdBy: dto.createdBy,
      },
    ]);
    expect(result).toEqual(sessionUsecaseModel);
  });

  it('should return null when the repository returns null', async () => {
    asMock(sessionRepositoryMock.create).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    asMock(sessionRepositoryMock.create).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_SESSION_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateSessionUsecase#execute => ${failure.message}`,
    ]);
  });
});
