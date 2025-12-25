import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramRecordMongo } from '@services/db/mongo/repositories/program-record.repository';
import { ProgramRecord } from '@services/db/models/program-record.model';
import { ListProgramRecordsUsecase } from '@src/usecases/sport/program-record/list.program-records.usecase';
import { ListProgramRecordsUsecaseDto } from '@src/usecases/sport/program-record/program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListProgramRecordsUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRecordRepositoryMock: BddServiceProgramRecordMongo;
  let loggerMock: LoggerMock;
  let usecase: ListProgramRecordsUsecase;

  const record: ProgramRecord = {
    id: 'record-1',
    userId: 'athlete-1',
    programId: 'program-1',
    state: ProgramRecordState.CREATE,
    createdBy: 'coach-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const expected: ProgramRecordUsecaseModel = {
    ...record,
  };

  beforeEach(() => {
    programRecordRepositoryMock = {
      list: createMockFn(),
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

    usecase = new ListProgramRecordsUsecase(inversifyMock);
  });

  it('should force athlete list to their own user id', async () => {
    asMock(programRecordRepositoryMock.list).mockResolvedValue({
      items: [record],
      total: 1,
      page: 1,
      limit: 20,
    });

    const dto: ListProgramRecordsUsecaseDto = {
      userId: 'athlete-2',
      programId: 'program-1',
      session: { userId: 'athlete-1', role: Role.ATHLETE },
    };

    const result = await usecase.execute(dto);

    expect(result.items).toEqual([expected]);
    expect(asMock(programRecordRepositoryMock.list).mock.calls[0][0]).toEqual({
      userId: 'athlete-1',
      programId: 'program-1',
      state: undefined,
      includeArchived: false,
      limit: undefined,
      page: undefined,
    });
  });

  it('should allow admin to filter by any user id', async () => {
    asMock(programRecordRepositoryMock.list).mockResolvedValue({
      items: [record],
      total: 1,
      page: 1,
      limit: 20,
    });

    const dto: ListProgramRecordsUsecaseDto = {
      userId: 'athlete-1',
      state: ProgramRecordState.CREATE,
      includeArchived: true,
      limit: 10,
      page: 2,
      session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const result = await usecase.execute(dto);

    expect(result.items).toEqual([expected]);
    expect(asMock(programRecordRepositoryMock.list).mock.calls[0][0]).toEqual({
      userId: 'athlete-1',
      programId: undefined,
      state: ProgramRecordState.CREATE,
      includeArchived: true,
      limit: 10,
      page: 2,
    });
  });
});
