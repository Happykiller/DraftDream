import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CryptService } from '@services/crypt/crypt.service';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { JwtService } from '@services/jwt/jwt.service';
import { AuthUsecase } from '@usecases/auth/auth.usecase';
import { AuthUsecaseDto } from '@usecases/auth/dtos/auth.usecase.dto';
import { SessionUsecaseModel } from '@usecases/auth/models/session.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('AuthUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let userRepositoryMock: MockProxy<BddServiceUserMongo>;
  let cryptServiceMock: MockProxy<CryptService>;
  let jwtServiceMock: MockProxy<JwtService>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: AuthUsecase;

  const dto: AuthUsecaseDto = {
    email: 'coach@example.com',
    password: 'P@ssw0rd',
  };

  const persistedUser = {
    id: 'user-123',
    type: 'coach' as const,
    email: 'coach@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    createdBy: 'system',
    is_active: true,
    password: 'hashed-password',
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    userRepositoryMock = mock<BddServiceUserMongo>();
    cryptServiceMock = mock<CryptService>();
    jwtServiceMock = mock<JwtService>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { user: BddServiceUserMongo }).user = userRepositoryMock;

    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.cryptService = cryptServiceMock as unknown as CryptService;
    inversifyMock.jwtService = jwtServiceMock as unknown as JwtService;
    inversifyMock.loggerService = loggerMock;

    usecase = new AuthUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should authenticate the user and return an access token', async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue({ ...persistedUser });
    cryptServiceMock.verify.mockResolvedValue(true);
    jwtServiceMock.sign.mockResolvedValue('jwt-token');

    const result = await usecase.execute(dto);

    expect(userRepositoryMock.getUserByEmail).toHaveBeenCalledWith(dto.email, { includePassword: true });
    expect(cryptServiceMock.verify).toHaveBeenCalledWith({ message: dto.password, hash: persistedUser.password });
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      id: persistedUser.id,
      role: persistedUser.type.toUpperCase(),
      email: persistedUser.email,
      type: 'access',
    });
    expect(result).toEqual<SessionUsecaseModel>({ access_token: 'jwt-token' });
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  it('should reject when the user is unknown', async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.INVALID_CREDENTIALS);

    expect(loggerMock.error).toHaveBeenCalledWith(`AuthUsecase#execute=>${ERRORS.INVALID_CREDENTIALS}`);
    expect(cryptServiceMock.verify).not.toHaveBeenCalled();
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should reject when the stored password is missing', async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue({ ...persistedUser, password: undefined });

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.INVALID_CREDENTIALS);

    expect(loggerMock.error).toHaveBeenCalledWith(`AuthUsecase#execute=>${ERRORS.INVALID_CREDENTIALS}`);
    expect(cryptServiceMock.verify).not.toHaveBeenCalled();
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should reject when the password verification fails', async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue({ ...persistedUser });
    cryptServiceMock.verify.mockResolvedValue(false);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.INVALID_CREDENTIALS);

    expect(loggerMock.error).toHaveBeenCalledWith(`AuthUsecase#execute=>${ERRORS.INVALID_CREDENTIALS}`);
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should wrap unexpected errors as AUTH_USECASE_FAIL', async () => {
    userRepositoryMock.getUserByEmail.mockResolvedValue({ ...persistedUser });
    cryptServiceMock.verify.mockResolvedValue(true);

    const failure = new Error('signing failed');
    jwtServiceMock.sign.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.AUTH_USECASE_FAIL);

    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      id: persistedUser.id,
      role: persistedUser.type.toUpperCase(),
      email: persistedUser.email,
      type: 'access',
    });
    expect(loggerMock.error).toHaveBeenCalledWith(`AuthUsecase#execute=>${failure.message}`);
  });
});
