import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { UpdateUserUsecase } from '@usecases/user/update.user.usecase';
import { UpdateUserUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateUserUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateUserUsecase;

  const dto: UpdateUserUsecaseDto = {
    id: 'user-55',
    type: 'coach',
    first_name: 'Alex',
    last_name: 'Perrin',
    email: 'alex.perrin@example.com',
    phone: '+33111111111',
    address: {
      name: 'Office',
      city: 'Marseille',
      code: '13000',
      country: 'FR',
    },
    company: {
      name: 'Fitdesk',
    },
    is_active: false,
  };

  const now = new Date('2024-05-05T09:00:00.000Z');

  const updatedUser: User = {
    id: 'user-55',
    type: 'coach',
    first_name: 'Alex',
    last_name: 'Perrin',
    email: 'alex.perrin@example.com',
    phone: '+33111111111',
    address: {
      name: 'Office',
      city: 'Marseille',
      code: '13000',
      country: 'FR',
    },
    company: {
      name: 'Fitdesk',
    },
    is_active: false,
    createdBy: 'admin-2',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    userRepositoryMock = {
      updateUser: createMockFn(),
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

    usecase = new UpdateUserUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the user through the repository and map the result', async () => {
    asMock(userRepositoryMock.updateUser).mockResolvedValue(updatedUser);

    const result = await usecase.execute(dto);

    expect(asMock(userRepositoryMock.updateUser).mock.calls[0]).toEqual([
      dto.id,
      {
        type: dto.type,
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        company: dto.company,
        is_active: dto.is_active,
      },
    ]);
    const expected: UserUsecaseModel = {
      id: updatedUser.id,
      type: updatedUser.type,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      company: updatedUser.company,
      is_active: updatedUser.is_active,
      createdBy: updatedUser.createdBy,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
    expect(result).toEqual(expected);
  });

  it('should log and throw when the user does not exist', async () => {
    asMock(userRepositoryMock.updateUser).mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_USER_USECASE);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `UpdateUserUsecase#execute => ${ERRORS.USER_NOT_FOUND}`,
    ]);
  });

  it('should log and throw when the repository fails', async () => {
    const failure = new Error('write failed');
    asMock(userRepositoryMock.updateUser).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_USER_USECASE);

    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `UpdateUserUsecase#execute => ${failure.message}`,
    ]);
  });
});
