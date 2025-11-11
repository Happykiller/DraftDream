import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceSessionMongo } from '@services/db/mongo/repositories/session.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { ListSessionsUsecase } from '@usecases/session/list.sessions.usecase';
import { ListSessionsUsecaseDto } from '@usecases/session/session.usecase.dto';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';
import type { User } from '@services/db/models/user.model';

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

const listResponse = {
  items: [sessionEntity],
  total: 1,
  page: 1,
  limit: 10,
};

const buildAdmin = (id: string): User => ({
  id,
  type: 'admin',
  first_name: `Admin ${id}`,
  last_name: 'User',
  email: `${id}@example.com`,
  is_active: true,
  createdBy: 'system',
});

describe('ListSessionsUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let sessionRepositoryMock: BddServiceSessionMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: ListSessionsUsecase;

  const buildDto = (overrides: Partial<ListSessionsUsecaseDto>): ListSessionsUsecaseDto => ({
    page: 1,
    limit: 10,
    session: { role: Role.ADMIN, userId: 'admin-1' },
    ...overrides,
  });

  beforeEach(() => {
    sessionRepositoryMock = {
      list: createMockFn(),
    } as unknown as BddServiceSessionMongo;

    userRepositoryMock = {
      listUsers: createMockFn(),
    } as unknown as BddServiceUserMongo;

    bddServiceMock = {
      session: sessionRepositoryMock,
      user: userRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new ListSessionsUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list sessions for administrators', async () => {
    const dto = buildDto({ session: { role: Role.ADMIN, userId: 'admin-1' } });
    asMock(sessionRepositoryMock.list).mockResolvedValue(listResponse);

    const result = await usecase.execute(dto);

    expect(asMock(sessionRepositoryMock.list).mock.calls[0]).toEqual([
      { page: dto.page, limit: dto.limit },
    ]);
    expect(result).toEqual({
      items: [
        {
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
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('should list sessions for coaches filtering by allowed creator', async () => {
    const dto = buildDto({
      session: { role: Role.COACH, userId: 'coach-1' },
      createdBy: 'coach-1',
    });
    asMock(sessionRepositoryMock.list).mockResolvedValue(listResponse);
    asMock(userRepositoryMock.listUsers).mockResolvedValue({
      items: [] as User[],
      total: 0,
      page: 1,
      limit: 50,
    });

    const result = await usecase.execute(dto);

    expect(asMock(sessionRepositoryMock.list).mock.calls[0]).toEqual([
      { page: dto.page, limit: dto.limit, createdBy: 'coach-1' },
    ]);
    expect(result.items[0].createdBy).toBe('coach-1');
  });

  it('should throw when a coach filters by an unauthorized creator', async () => {
    const dto = buildDto({
      session: { role: Role.COACH, userId: 'coach-2' },
      createdBy: 'coach-1',
    });
    asMock(sessionRepositoryMock.list).mockResolvedValue(listResponse);
    asMock(userRepositoryMock.listUsers).mockResolvedValue({
      items: [] as User[],
      total: 0,
      page: 1,
      limit: 50,
    });

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_SESSIONS_FORBIDDEN);
  });

  it('should list sessions for coaches across allowed creators', async () => {
    const dto = buildDto({ session: { role: Role.COACH, userId: 'coach-1' } });
    asMock(sessionRepositoryMock.list).mockResolvedValue(listResponse);
    asMock(userRepositoryMock.listUsers).mockResolvedValue({
      items: [buildAdmin('admin-1'), buildAdmin('admin-2')],
      total: 2,
      page: 1,
      limit: 50,
    });

    const result = await usecase.execute(dto);

    const callArgs = asMock(sessionRepositoryMock.list).mock.calls[0][0] ?? {};
    const createdByIn = callArgs.createdByIn ?? [];
    expect(createdByIn.sort()).toEqual(['admin-1', 'admin-2', 'coach-1']);
    expect(result.items).toHaveLength(1);
    expect(asMock(userRepositoryMock.listUsers).mock.calls[0]).toEqual([
      { type: 'admin', limit: 50, page: 1 },
    ]);
  });

  it('should forbid listing sessions for unsupported roles', async () => {
    const dto = buildDto({ session: { role: Role.ATHLETE, userId: 'athlete-1' } });

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_SESSIONS_FORBIDDEN);
  });

  it('should log and rethrow domain errors when listing fails', async () => {
    const dto = buildDto({ session: { role: Role.ADMIN, userId: 'admin-1' } });
    const failure = new Error('db failure');
    asMock(sessionRepositoryMock.list).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_SESSIONS_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `ListSessionsUsecase#execute => ${failure.message}`,
    ]);
  });
});

