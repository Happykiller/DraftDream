import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramRecordMongo } from '@services/db/mongo/repositories/program-record.repository';
import { ProgramRecord } from '@services/db/models/program-record.model';
import { UpdateProgramRecordUsecase } from '@src/usecases/sport/program-record/update.program-record.usecase';
import { UpdateProgramRecordUsecaseDto } from '@src/usecases/sport/program-record/program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateProgramRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRecordRepositoryMock: BddServiceProgramRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateProgramRecordUsecase;

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

  const updatedRecord: ProgramRecord = {
    ...record,
    state: ProgramRecordState.DRAFT,
    updatedAt: new Date('2024-01-03T00:00:00.000Z'),
  };

  const expected: ProgramRecordUsecaseModel = {
    ...updatedRecord,
  };

  beforeEach(() => {
    programRecordRepositoryMock = {
      get: createMockFn(),
      update: createMockFn(),
    } as unknown as BddServiceProgramRecordMongo;

    bddServiceMock = {
      programRecord: programRecordRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new UpdateProgramRecordUsecase(inversifyMock);
  });

  it('should update the record state for the owner', async () => {
    asMock(programRecordRepositoryMock.get).mockResolvedValue(record);
    asMock(programRecordRepositoryMock.update).mockResolvedValue(updatedRecord);

    const dto: UpdateProgramRecordUsecaseDto = {
      id: 'record-1',
      state: ProgramRecordState.DRAFT,
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
    expect(asMock(programRecordRepositoryMock.update).mock.calls[0][0]).toBe('record-1');
    expect(asMock(programRecordRepositoryMock.update).mock.calls[0][1]).toEqual({
      state: ProgramRecordState.DRAFT,
    });
  });

  it('should return null when the record is missing', async () => {
    asMock(programRecordRepositoryMock.get).mockResolvedValue(null);

    const dto: UpdateProgramRecordUsecaseDto = {
      id: 'record-1',
      state: ProgramRecordState.DRAFT,
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
    expect(asMock(programRecordRepositoryMock.update).mock.calls.length).toBe(0);
  });
});
