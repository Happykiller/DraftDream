import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { GetSessionUsecase } from '@src/usecases/sport/session/get.session.usecase';
import { GetSessionUsecaseDto } from '@src/usecases/sport/session/session.usecase.dto';
import { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';
import type { User } from '@services/db/models/user.model';

interface LoggerMock {
  error: (message: string) => void;
  warn: (message: string) => void;
}

const now = new Date('2024-01-01T00:00:00.000Z');
const sessionEntity = {
  id: 'session-1',
  slug: 'upper-body',
  locale: 'en-us',
  label: 'Upper Body',
  durationMin: 60,
  visibility: 'public' as const,
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: 'coach-1',
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

const mapped: SessionUsecaseModel = {
  id: 'session-1',
  slug: 'upper-body',
  locale: 'en-us',
  label: 'Upper Body',
  durationMin: 60,
  visibility: 'public',
  description: 'Full body workout',
  exerciseIds: ['ex-1', 'ex-2'],
  createdBy: 'coach-1',
  deletedAt: undefined,
  createdAt: now,
  updatedAt: now,
};

describe('GetSessionUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let sessionRepositoryMock: BddServiceSessionMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: GetSessionUsecase;

  const buildDto = (role: Role, userId: string): GetSessionUsecaseDto => ({
    id: 'session-1',
    session: { role, userId },
  });

  beforeEach(() => {
    sessionRepositoryMock = {
      get: createMockFn(),
    } as unknown as BddServiceSessionMongo;

    userRepositoryMock = {
      getUser: createMockFn(),
    } as unknown as BddServiceUserMongo;

    bddServiceMock = {
      session: sessionRepositoryMock,
      user: userRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
      warn: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new GetSessionUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return a mapped session for administrators', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);

    const result = await usecase.execute(dto);

    expect(asMock(sessionRepositoryMock.get).mock.calls[0]).toEqual([
      { id: dto.id },
    ]);
    expect(result).toEqual(mapped);
  });

  it('should return null when the session is not found', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    asMock(sessionRepositoryMock.get).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should allow the creator to access the session', async () => {
    const dto = buildDto(Role.COACH, 'coach-1');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);
    asMock(userRepositoryMock.getUser).mockResolvedValue(buildUser('coach-1', 'coach'));

    const result = await usecase.execute(dto);

    expect(result).toEqual(mapped);
  });

  it('should allow a coach to access an admin-authored session', async () => {
    const dto = buildDto(Role.COACH, 'coach-2');
    asMock(sessionRepositoryMock.get).mockResolvedValue({
      ...sessionEntity,
      createdBy: 'admin-1',
    });
    asMock(userRepositoryMock.getUser).mockResolvedValue(buildUser('admin-1', 'admin'));

    const result = await usecase.execute(dto);

    expect(result).toEqual({ ...mapped, createdBy: 'admin-1' });
  });

  it('should reject unauthorized access attempts', async () => {
    const dto = buildDto(Role.COACH, 'coach-2');
    asMock(sessionRepositoryMock.get).mockResolvedValue(sessionEntity);
    asMock(userRepositoryMock.getUser).mockResolvedValue(buildUser('coach-1', 'coach'));

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_SESSION_FORBIDDEN);
    expect(asMock(loggerMock.error).mock.calls.length).toBe(0);
  });

  it('should rethrow repository errors as domain errors', async () => {
    const dto = buildDto(Role.ADMIN, 'admin-1');
    const failure = new Error('db down');
    asMock(sessionRepositoryMock.get).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_SESSION_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `GetSessionUsecase#execute => ${failure.message}`,
    ]);
  });

  it('should warn when checking public templates fails and forbid the access', async () => {
    const dto = buildDto(Role.COACH, 'coach-2');
    const failure = new Error('user service down');
    asMock(sessionRepositoryMock.get).mockResolvedValue({
      ...sessionEntity,
      createdBy: 'admin-1',
    });
    asMock(userRepositoryMock.getUser).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_SESSION_FORBIDDEN);
    expect(asMock(loggerMock.warn).mock.calls[0]).toEqual([
      `GetSessionUsecase#isPublicTemplate => ${failure.message}`,
    ]);
    expect(asMock(loggerMock.error).mock.calls.length).toBe(0);
  });
});

const buildUser = (id: string, type: User['type']): User => ({
  id,
  type,
  first_name: `Test ${id}`,
  last_name: 'User',
  email: `${id}@example.com`,
  is_active: true,
  createdBy: 'system',
});
