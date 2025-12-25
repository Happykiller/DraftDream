import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramRecordMongo } from '@services/db/mongo/repositories/program-record.repository';
import { ProgramRecord } from '@services/db/models/program-record.model';
import { GetProgramRecordUsecase } from '@src/usecases/sport/program-record/get.program-record.usecase';
import { GetProgramRecordUsecaseDto } from '@src/usecases/sport/program-record/program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetProgramRecordUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRecordRepositoryMock: BddServiceProgramRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: GetProgramRecordUsecase;

  const record: ProgramRecord = {
    id: 'record-1',
    userId: 'athlete-1',
    programId: 'program-1',
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
      get: createMockFn(),
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

    usecase = new GetProgramRecordUsecase(inversifyMock);
  });

  it('should return the record for the owning athlete', async () => {
    asMock(programRecordRepositoryMock.get).mockResolvedValue(record);

    const dto: GetProgramRecordUsecaseDto = {
      id: 'record-1',
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toEqual(expected);
  });

  it('should return null when the requester is not the owner', async () => {
    asMock(programRecordRepositoryMock.get).mockResolvedValue(record);

    const dto: GetProgramRecordUsecaseDto = {
      id: 'record-1',
      session: { userId: 'athlete-2', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });
});
