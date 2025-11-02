import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { ListUsersUsecase } from '@usecases/user/list.users.usecase';
import { ListUserUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListUsersUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: ListUsersUsecase;

  const dto: ListUserUsecaseDto = {
    q: 'sam',
    type: 'coach',
    companyName: 'Fitdesk',
    is_active: true,
    createdBy: 'admin-1',
    limit: 5,
    page: 2,
    sort: { createdAt: -1 },
  };

  const now = new Date('2024-04-10T12:00:00.000Z');

  const repoUsers: User[] = [
    {
      id: 'user-1',
      type: 'coach',
      first_name: 'Sam',
      last_name: 'Stone',
      email: 'sam.stone@example.com',
      phone: '+33102030405',
      address: {
        name: 'HQ',
        city: 'Paris',
        code: '75000',
        country: 'FR',
      },
      company: { name: 'Fitdesk' },
      is_active: true,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'user-2',
      type: 'coach',
      first_name: 'Léa',
      last_name: 'Moreau',
      email: 'lea.moreau@example.com',
      phone: '+33102030406',
      address: {
        name: 'Office',
        city: 'Paris',
        code: '75001',
        country: 'FR',
      },
      company: { name: 'Fitdesk' },
      is_active: false,
      createdBy: 'admin-2',
      createdAt: now,
      updatedAt: now,
    },
  ];

  beforeEach(() => {
    userRepositoryMock = {
      listUsers: createMockFn(),
    } as unknown as BddServiceUserMongo;

    bddServiceMock = {
      user: userRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new ListUsersUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list users through the repository and map the response', async () => {
    asMock(userRepositoryMock.listUsers).mockResolvedValue({
      items: repoUsers,
      total: 12,
      page: 2,
      limit: 5,
    });

    const result = await usecase.execute(dto);

    expect(asMock(userRepositoryMock.listUsers).mock.calls[0]).toEqual([
      {
        q: dto.q,
        type: dto.type,
        companyName: dto.companyName,
        is_active: dto.is_active,
        createdBy: dto.createdBy,
        limit: dto.limit,
        page: dto.page,
        sort: dto.sort,
      },
    ]);
    expect(result).toEqual({
      items: repoUsers.map((user): UserUsecaseModel => ({
        id: user.id,
        type: user.type,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        company: user.company,
        is_active: user.is_active,
        createdBy: user.createdBy,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total: 12,
      page: 2,
      limit: 5,
    });
  });

  it('should log and throw when listing fails', async () => {
    const failure = new Error('timeout');
    asMock(userRepositoryMock.listUsers).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_USERS_USECASE);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `ListUsersUsecase#execute => ${failure.message}`,
    ]);
  });
});
