import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { Program } from '@services/db/models/program.model';
import { DeleteProgramUsecase } from '@usecases/program/delete.program.usecase';
import { DeleteProgramUsecaseDto } from '@usecases/program/program.usecase.dto';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteProgramUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRepositoryMock: BddServiceProgramMongo;
  let loggerMock: LoggerMock;
  let usecase: DeleteProgramUsecase;

  const program: Program = {
    id: 'program-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    visibility: 'private',
    duration: 6,
    frequency: 3,
    sessions: [],
    createdBy: 'creator-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  beforeEach(() => {
    programRepositoryMock = {
      get: createMockFn(),
      delete: createMockFn(),
    } as unknown as BddServiceProgramMongo;

    bddServiceMock = {
      program: programRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new DeleteProgramUsecase(inversifyMock);
  });

  it('should delete when the session belongs to an admin', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(program);
    asMock(programRepositoryMock.delete).mockResolvedValue(true);

    const dto: DeleteProgramUsecaseDto = {
      id: program.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.delete).mock.calls[0]).toEqual([program.id]);
    expect(result).toBe(true);
  });

  it('should delete when the session belongs to the creator', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(program);
    asMock(programRepositoryMock.delete).mockResolvedValue(true);

    const dto: DeleteProgramUsecaseDto = {
      id: program.id,
      session: { userId: 'creator-1', role: Role.COACH },
    };

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.delete).mock.calls[0]).toEqual([program.id]);
    expect(result).toBe(true);
  });

  it('should return false when the program does not exist', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(null);

    const dto: DeleteProgramUsecaseDto = {
      id: program.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.delete).mock.calls.length).toBe(0);
    expect(result).toBe(false);
  });

  it('should reject when the session is not allowed to delete', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue(program);

    const dto: DeleteProgramUsecaseDto = {
      id: program.id,
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_PROGRAM_FORBIDDEN);
    expect(asMock(programRepositoryMock.delete).mock.calls.length).toBe(0);
  });

  it('should log and throw a domain error when repository throws', async () => {
    const failure = new Error('delete failure');
    asMock(programRepositoryMock.get).mockResolvedValue(program);
    asMock(programRepositoryMock.delete).mockRejectedValue(failure);

    const dto: DeleteProgramUsecaseDto = {
      id: program.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_PROGRAM_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `DeleteProgramUsecase#execute => ${failure.message}`,
    ]);
  });
});
