import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { DeleteSessionUsecase } from '@usecases/session/delete.session.usecase';
import { DeleteSessionUsecaseDto } from '@usecases/session/session.usecase.dto';
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
  createdBy: 'coach-1',
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

describe('DeleteSessionUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let sessionRepositoryMock: BddServiceSessionMongo;
  let loggerMock: LoggerMock;
  let usecase: DeleteSessionUsecase;

  const buildDto = (role: Role, userId: string): DeleteSessionUsecaseDto => ({
    id: 'session-1',
    session: { role, userId },
  });

  beforeEach(() => {
    sessionRepositoryMock = {
      get: createMockFn(),
      delete: createMockFn(),
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

    usecase = new DeleteSessionUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return false when the session does not exist', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    asMock(sessionRepositoryMock.get).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
    expect(asMock(sessionRepositoryMock.delete).mock.calls.length).toBe(0);
  });

  it('should allow administrators to delete sessions', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);
    asMock(sessionRepositoryMock.delete).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(result).toBe(true);
    expect(asMock(sessionRepositoryMock.delete).mock.calls[0]).toEqual(['session-1']);
  });

  it('should allow the creator to delete their session', async () => {
    const dto = buildDto(Role.COACH, 'coach-1');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);
    asMock(sessionRepositoryMock.delete).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(result).toBe(true);
  });

  it('should reject unauthorized deletions', async () => {
    const dto = buildDto(Role.COACH, 'coach-2');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_SESSION_FORBIDDEN);
    expect(asMock(sessionRepositoryMock.delete).mock.calls.length).toBe(0);
    expect(asMock(loggerMock.error).mock.calls.length).toBe(0);
  });

  it('should log and throw when deletion fails', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    const failure = new Error('db failure');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);
    asMock(sessionRepositoryMock.delete).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_SESSION_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `DeleteSessionUsecase#execute => ${failure.message}`,
    ]);
  });

  it('should log and throw when loading the session fails', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    const failure = new Error('db failure');
    asMock(sessionRepositoryMock.get).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_SESSION_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `DeleteSessionUsecase#execute => ${failure.message}`,
    ]);
  });
});

