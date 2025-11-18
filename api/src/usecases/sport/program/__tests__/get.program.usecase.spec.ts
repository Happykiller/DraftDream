import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { Program } from '@services/db/models/program.model';
import { User } from '@services/db/models/user.model';
import { GetProgramUsecase } from '@src/usecases/sport/program/get.program.usecase';
import { GetProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
  warn: (message: string) => void;
}

describe('GetProgramUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRepositoryMock: BddServiceProgramMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: GetProgramUsecase;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const baseProgram: Program = {
    id: 'program-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    visibility: 'private',
    duration: 6,
    frequency: 3,
    sessions: [],
    userId: 'athlete-1',
    createdBy: 'creator-1',
    createdAt: now,
    updatedAt: now,
  };

  const expectedProgram: ProgramUsecaseModel = {
    id: 'program-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    visibility: 'private',
    duration: 6,
    frequency: 3,
    sessions: [],
    userId: 'athlete-1',
    createdBy: 'creator-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    programRepositoryMock = {
      get: createMockFn(),
    } as unknown as BddServiceProgramMongo;

    userRepositoryMock = {
      getUser: createMockFn(),
    } as unknown as BddServiceUserMongo;

    bddServiceMock = {
      program: programRepositoryMock,
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

    usecase = new GetProgramUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the program for admin sessions', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(baseProgram);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    } as GetProgramUsecaseDto;

    const result = await usecase.execute(dto);

    expect(result).toEqual(expectedProgram);
  });

  it('should return the program when the requester is the creator', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(baseProgram);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'creator-1', role: Role.COACH },
    } as GetProgramUsecaseDto;

    const result = await usecase.execute(dto);

    expect(result).toEqual(expectedProgram);
  });

  it('should allow a coach when the program creator is an admin', async () => {
    const program: Program = {
      ...baseProgram,
      createdBy: 'admin-1',
      visibility: 'public',
    };
    asMock(programRepositoryMock.get).mockResolvedValue(program);
    asMock(userRepositoryMock.getUser).mockResolvedValue({
      id: 'admin-1',
      type: 'admin',
      first_name: 'Admin',
      last_name: 'One',
      email: 'admin@example.com',
      is_active: true,
      createdBy: 'root',
    } as User);

    const dto: GetProgramUsecaseDto = {
      id: program.id,
      session: { userId: 'coach-1', role: Role.COACH },
    } as GetProgramUsecaseDto;

    const result = await usecase.execute(dto);

    expect(asMock(userRepositoryMock.getUser).mock.calls[0]).toEqual([{ id: 'admin-1' }]);
    expect(result).toEqual({ ...expectedProgram, createdBy: 'admin-1', visibility: 'public' });
  });

  it('should allow an athlete assigned to the program', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(baseProgram);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    } as GetProgramUsecaseDto;

    const result = await usecase.execute(dto);

    expect(result).toEqual(expectedProgram);
  });

  it('should return null when the program is not found', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(null);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    } as GetProgramUsecaseDto;

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should forbid access when a coach is not allowed to view the program', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(baseProgram);
    asMock(userRepositoryMock.getUser).mockResolvedValue({
      id: 'creator-1',
      type: 'coach',
      first_name: 'Coach',
      last_name: 'One',
      email: 'coach@example.com',
      is_active: true,
      createdBy: 'admin-1',
    } as User);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'other-coach', role: Role.COACH },
    } as GetProgramUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROGRAM_FORBIDDEN);
  });

  it('should warn when public program resolution fails and deny access', async () => {
    const failure = new Error('user lookup failure');
    asMock(programRepositoryMock.get).mockResolvedValue(baseProgram);
    asMock(userRepositoryMock.getUser).mockRejectedValue(failure);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'coach-1', role: Role.COACH },
    } as GetProgramUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROGRAM_FORBIDDEN);
    expect(asMock(loggerMock.warn).mock.calls[0]).toEqual([
      `GetProgramUsecase#isPublicProgram => ${failure.message}`,
    ]);
  });

  it('should log and throw a domain error when repository throws', async () => {
    const failure = new Error('database failure');
    asMock(programRepositoryMock.get).mockRejectedValue(failure);

    const dto: GetProgramUsecaseDto = {
      id: baseProgram.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    } as GetProgramUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROGRAM_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `GetProgramUsecase#execute => ${failure.message}`,
    ]);
  });
});
