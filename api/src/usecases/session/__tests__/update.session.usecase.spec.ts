import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { UpdateSessionUsecase } from '@usecases/session/update.session.usecase';
import { UpdateSessionUsecaseDto } from '@usecases/session/session.usecase.dto';
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
  label: 'Updated Upper Body',
  durationMin: 75,
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: { id: 'coach-1' },
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

const mapped: SessionUsecaseModel = {
  id: 'session-1',
  slug: 'upper-body',
  locale: 'en-us',
  label: 'Updated Upper Body',
  durationMin: 75,
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: 'coach-1',
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

const patch: UpdateSessionUsecaseDto = {
  label: 'Updated Upper Body',
  durationMin: 75,
};

describe('UpdateSessionUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let sessionRepositoryMock: BddServiceSessionMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateSessionUsecase;

  beforeEach(() => {
    sessionRepositoryMock = {
      update: createMockFn(),
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

    usecase = new UpdateSessionUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update a session through the repository', async () => {
    asMock(sessionRepositoryMock.update).mockResolvedValue(sessionEntity);

    const result = await usecase.execute('session-1', patch);

    expect(asMock(sessionRepositoryMock.update).mock.calls[0]).toEqual([
      'session-1',
      patch,
    ]);
    expect(result).toEqual(mapped);
  });

  it('should return null when the repository returns null', async () => {
    asMock(sessionRepositoryMock.update).mockResolvedValue(null);

    const result = await usecase.execute('session-1', patch);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when the update fails', async () => {
    const failure = new Error('db failure');
    asMock(sessionRepositoryMock.update).mockRejectedValue(failure);

    await expect(usecase.execute('session-1', patch)).rejects.toThrow(ERRORS.UPDATE_SESSION_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `UpdateSessionUsecase#execute => ${failure.message}`,
    ]);
  });
});
