import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { GetUserUsecase } from '@usecases/user/get.user.usecase';
import { GetUserUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetUserUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: GetUserUsecase;

  const dto: GetUserUsecaseDto = {
    id: 'user-99',
  };

  const now = new Date('2024-03-15T08:30:00.000Z');

  const persistedUser: User = {
    id: 'user-99',
    type: 'athlete',
    first_name: 'Nora',
    last_name: 'Lane',
    email: 'nora.lane@example.com',
    phone: '+1555123456',
    address: {
      name: 'Home',
      city: 'Lyon',
      code: '69000',
      country: 'FR',
    },
    company: {
      name: 'Fitdesk',
    },
    is_active: true,
    createdBy: 'coach-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    userRepositoryMock = {
      getUser: createMockFn(),
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

    usecase = new GetUserUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should retrieve the user and map it to the usecase model', async () => {
    asMock(userRepositoryMock.getUser).mockResolvedValue(persistedUser);

    const result = await usecase.execute(dto);

    expect(asMock(userRepositoryMock.getUser).mock.calls[0]).toEqual([
      { id: dto.id },
    ]);
    const expected: UserUsecaseModel = {
      id: persistedUser.id,
      type: persistedUser.type,
      first_name: persistedUser.first_name,
      last_name: persistedUser.last_name,
      email: persistedUser.email,
      phone: persistedUser.phone,
      address: persistedUser.address,
      company: persistedUser.company,
      is_active: persistedUser.is_active,
      createdBy: persistedUser.createdBy,
      createdAt: persistedUser.createdAt,
      updatedAt: persistedUser.updatedAt,
    };
    expect(result).toEqual(expected);
  });

  it('should log and throw when the user is not found', async () => {
    asMock(userRepositoryMock.getUser).mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.USER_NOT_FOUND);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `GetUserUsecase#execute=>${ERRORS.USER_NOT_FOUND}`,
    ]);
  });

  it('should log and throw when the repository fails', async () => {
    const failure = new Error('connection lost');
    asMock(userRepositoryMock.getUser).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_USER_USECASE);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `GetUserUsecase#execute=>${failure.message}`,
    ]);
  });
});
