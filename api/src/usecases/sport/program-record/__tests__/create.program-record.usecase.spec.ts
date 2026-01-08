import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramRecordMongo } from '@services/db/mongo/repositories/program-record.repository';
import { ProgramRecord } from '@services/db/models/program-record.model';
import { CreateProgramRecordUsecase } from '@src/usecases/sport/program-record/create.program-record.usecase';
import { CreateProgramRecordUsecaseDto } from '@src/usecases/sport/program-record/program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';
import { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateProgramRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRecordRepositoryMock: BddServiceProgramRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateProgramRecordUsecase;

  const session = { userId: 'athlete-1', role: Role.ATHLETE };
  const dto: CreateProgramRecordUsecaseDto = {
    programId: 'program-1',
    sessionId: 'session-1',
    session,
  };


  const program: ProgramUsecaseModel = {
    id: 'program-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    visibility: 'PRIVATE',
    duration: 6,
    frequency: 3,
    sessions: [
      {
        id: 'session-1',
        title: 'Session 1',
        description: 'First session',
        exercises: [],
      } as any,
    ],
    userId: 'athlete-1',
    createdBy: 'coach-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const record: ProgramRecord = {
    id: 'record-1',
    userId: 'athlete-1',
    programId: 'program-1',
    sessionId: 'session-1',
    state: ProgramRecordState.CREATE,

    createdBy: 'athlete-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const expected: ProgramRecordUsecaseModel = {
    ...record,
  };

  beforeEach(() => {
    programRecordRepositoryMock = {
      create: createMockFn(),
      getByUserProgram: createMockFn(),
    } as unknown as BddServiceProgramRecordMongo;

    bddServiceMock = {
      programRecord: programRecordRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      getProgramUsecase: { execute: createMockFn() },
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateProgramRecordUsecase(inversifyMock);
  });

  it('should create a program record for an athlete', async () => {
    asMock(inversifyMock.getProgramUsecase.execute).mockResolvedValue(program);
    asMock(programRecordRepositoryMock.getByUserProgram).mockResolvedValue(null);
    asMock(programRecordRepositoryMock.create).mockResolvedValue(record);

    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
    expect(asMock(programRecordRepositoryMock.create).mock.calls[0][0]).toEqual({
      userId: 'athlete-1',
      programId: 'program-1',
      sessionId: 'session-1',
      sessionSnapshot: {
        id: 'session-1',
        title: 'Session 1',
        description: 'First session',
        exercises: [],
      },
      state: ProgramRecordState.CREATE,
      createdBy: 'athlete-1',
    });

  });

  it('should create a new record even if one already exists', async () => {
    asMock(inversifyMock.getProgramUsecase.execute).mockResolvedValue(program);
    // even if repository conceptually has a record, we expect create to be called
    asMock(programRecordRepositoryMock.create).mockResolvedValue(record);

    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
    expect(asMock(programRecordRepositoryMock.create).mock.calls.length).toBe(1);
  });

  it('should forbid athletes creating records for other users', async () => {
    await expect(
      usecase.execute({
        programId: 'program-1',
        sessionId: 'session-1',
        userId: 'athlete-2',
        session,
      }),

    ).rejects.toThrow(ERRORS.FORBIDDEN);
  });
});
