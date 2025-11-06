import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CryptService } from '@services/crypt/crypt.service';
import { User } from '@services/db/models/user.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { CreateUserUsecase } from '@usecases/user/create.user.usecase';
import { CreateUserUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateUserUsecase', () => {
  let inversifyMock: Inversify;
  let cryptServiceMock: CryptService;
  let bddServiceMock: BddServiceMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateUserUsecase;

  const dto: CreateUserUsecaseDto = {
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
    password: 'Secret!123',
    confirm_password: 'Secret!123',
    company: {
      name: 'Fitdesk',
    },
    is_active: true,
    createdBy: 'admin-1',
  };

  const now = new Date('2024-02-01T10:00:00.000Z');

  const persistedUser: User = {
    id: 'user-42',
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
    company: {
      name: 'Fitdesk',
    },
    is_active: true,
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    userRepositoryMock = {
      createUser: createMockFn(),
    } as unknown as BddServiceUserMongo;

    cryptServiceMock = {
      hash: createMockFn(),
      verify: createMockFn(),
    } as unknown as CryptService;

    bddServiceMock = {
      user: userRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      cryptService: cryptServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateUserUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should hash the password and create a user through the repository', async () => {
    const hashedPassword = 'hashed-value';

    asMock(cryptServiceMock.hash).mockResolvedValue(hashedPassword);
    asMock(userRepositoryMock.createUser).mockResolvedValue(persistedUser);

    const result = await usecase.execute(dto);

    expect(asMock(cryptServiceMock.hash).mock.calls[0]).toEqual([
      { message: dto.password },
    ]);
    expect(asMock(userRepositoryMock.createUser).mock.calls[0]).toEqual([
      {
        ...dto,
        password: hashedPassword,
      },
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

  it('should log and throw a domain error when hashing fails', async () => {
    const failure = new Error('hash failed');
    asMock(cryptServiceMock.hash).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_USER_USECASE);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateUserUsecase#execute=>${failure.message}`,
    ]);
    expect(asMock(userRepositoryMock.createUser).mock.calls).toHaveLength(0);
  });

  it('should log and throw a domain error when repository creation fails', async () => {
    const failure = new Error('database offline');

    asMock(cryptServiceMock.hash).mockResolvedValue('hashed');
    asMock(userRepositoryMock.createUser).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_USER_USECASE);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateUserUsecase#execute=>${failure.message}`,
    ]);
  });
});
