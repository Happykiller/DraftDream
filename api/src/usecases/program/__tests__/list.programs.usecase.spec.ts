import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { Program } from '@services/db/models/program.model';
import { ListProgramsUsecase } from '@usecases/program/list.programs.usecase';
import { ListProgramsUsecaseDto } from '@usecases/program/program.usecase.dto';
import { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListProgramsUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRepositoryMock: BddServiceProgramMongo;
  let userRepositoryMock: BddServiceUserMongo;
  let loggerMock: LoggerMock;
  let usecase: ListProgramsUsecase;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const program: Program = {
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
      list: createMockFn(),
    } as unknown as BddServiceProgramMongo;

    userRepositoryMock = {
      listUsers: createMockFn(),
    } as unknown as BddServiceUserMongo;

    bddServiceMock = {
      program: programRepositoryMock,
      user: userRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new ListProgramsUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list programs for admins', async () => {
    asMock(programRepositoryMock.list).mockResolvedValue({
      items: [program],
      total: 1,
      page: 1,
      limit: 20,
    });

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
      page: 1,
      limit: 20,
    } as ListProgramsUsecaseDto;

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.list).mock.calls[0]).toEqual([{ page: 1, limit: 20 }]);
    expect(result).toEqual({
      items: [expectedProgram],
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it('should list programs for coaches within accessible creators', async () => {
    asMock(programRepositoryMock.list).mockResolvedValue({
      items: [program],
      total: 1,
      page: 1,
      limit: 10,
    });
    asMock(userRepositoryMock.listUsers).mockResolvedValue({
      items: [
        { id: 'admin-1' },
      ] as any,
      total: 1,
      page: 1,
      limit: 50,
    });

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      page: 1,
      limit: 10,
    } as ListProgramsUsecaseDto;

    const result = await usecase.execute(dto);

    expect(asMock(userRepositoryMock.listUsers).mock.calls[0]).toEqual([
      {
        type: 'admin',
        limit: 50,
        page: 1,
      },
    ]);
    expect(asMock(programRepositoryMock.list).mock.calls[0]).toEqual([
      {
        page: 1,
        limit: 10,
        createdByIn: expect.arrayContaining(['coach-1', 'admin-1']),
      },
    ]);
    expect(result).toEqual({
      items: [expectedProgram],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('should aggregate all admin ids across paginated responses for coaches', async () => {
    asMock(programRepositoryMock.list).mockResolvedValue({
      items: [program],
      total: 1,
      page: 1,
      limit: 15,
    });
    const firstPage = Array.from({ length: 50 }, (_, index) => ({ id: `admin-${index + 1}` })) as any;
    const adminResponses = [
      {
        items: firstPage,
        total: 51,
        page: 1,
        limit: 50,
      },
      {
        items: [{ id: 'admin-51' }] as any,
        total: 51,
        page: 2,
        limit: 50,
      },
    ];
    let callIndex = 0;
    asMock(userRepositoryMock.listUsers).mockImplementation(() => {
      const response = adminResponses[callIndex] ?? adminResponses[adminResponses.length - 1];
      callIndex += 1;
      return Promise.resolve(response);
    });

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      page: 1,
      limit: 15,
    } as ListProgramsUsecaseDto;

    const result = await usecase.execute(dto);

    expect(asMock(userRepositoryMock.listUsers).mock.calls).toEqual([
      [{ type: 'admin', limit: 50, page: 1 }],
      [{ type: 'admin', limit: 50, page: 2 }],
    ]);
    expect(asMock(programRepositoryMock.list).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 15,
        createdByIn: expect.arrayContaining([
          'coach-1',
          'admin-1',
          'admin-2',
          'admin-3',
          'admin-51',
        ]),
      }),
    );
    const listCallArgs = asMock(programRepositoryMock.list).mock.calls[0][0];
    const createdByIn = listCallArgs?.createdByIn ?? [];
    expect(createdByIn).toHaveLength(52);
    expect(result).toEqual({
      items: [expectedProgram],
      total: 1,
      page: 1,
      limit: 15,
    });
  });

  it('should list programs for coaches when filtering their own id', async () => {
    const filteredProgram = { ...program, createdBy: 'coach-1' };
    asMock(programRepositoryMock.list).mockResolvedValue({
      items: [filteredProgram],
      total: 1,
      page: 1,
      limit: 5,
    });
    asMock(userRepositoryMock.listUsers).mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      page: 1,
      limit: 5,
      createdBy: 'coach-1',
    } as ListProgramsUsecaseDto;

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.list).mock.calls[0]).toEqual([
      {
        page: 1,
        limit: 5,
        createdBy: 'coach-1',
      },
    ]);
    expect(result).toEqual({
      items: [{ ...expectedProgram, createdBy: 'coach-1' }],
      total: 1,
      page: 1,
      limit: 5,
    });
  });

  it('should forbid coach access when filtering an unauthorized creator', async () => {
    asMock(programRepositoryMock.list).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 5,
    });
    asMock(userRepositoryMock.listUsers).mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'coach-1', role: Role.COACH },
      createdBy: 'coach-2',
    } as ListProgramsUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROGRAMS_FORBIDDEN);
    expect(asMock(programRepositoryMock.list).mock.calls.length).toBe(0);
  });

  it('should list programs for athletes restricted to their assignment', async () => {
    asMock(programRepositoryMock.list).mockResolvedValue({
      items: [program],
      total: 1,
      page: 2,
      limit: 10,
    });

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
      page: 2,
      limit: 10,
    } as ListProgramsUsecaseDto;

    const result = await usecase.execute(dto);

    expect(asMock(programRepositoryMock.list).mock.calls[0]).toEqual([
      {
        page: 2,
        limit: 10,
        userId: 'athlete-1',
      },
    ]);
    expect(result).toEqual({
      items: [expectedProgram],
      total: 1,
      page: 2,
      limit: 10,
    });
  });

  it('should forbid athletes from filtering on creator', async () => {
    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
      createdBy: 'coach-1',
    } as ListProgramsUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROGRAMS_FORBIDDEN);
    expect(asMock(programRepositoryMock.list).mock.calls.length).toBe(0);
  });

  it('should forbid athletes from filtering on creator lists', async () => {
    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
      createdByIn: ['coach-1', 'coach-2'],
    } as ListProgramsUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROGRAMS_FORBIDDEN);
    expect(asMock(programRepositoryMock.list).mock.calls.length).toBe(0);
  });

  it('should forbid athletes from requesting other user ids', async () => {
    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'athlete-1', role: Role.ATHLETE },
      userId: 'athlete-2',
    } as ListProgramsUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROGRAMS_FORBIDDEN);
    expect(asMock(programRepositoryMock.list).mock.calls.length).toBe(0);
  });

  it('should forbid unknown roles', async () => {
    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'someone', role: 'UNKNOWN' as Role },
    } as ListProgramsUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROGRAMS_FORBIDDEN);
  });

  it('should log and throw a domain error when repository throws', async () => {
    const failure = new Error('list failure');
    asMock(programRepositoryMock.list).mockRejectedValue(failure);

    const dto: ListProgramsUsecaseDto = {
      session: { userId: 'admin-1', role: Role.ADMIN },
    } as ListProgramsUsecaseDto;

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROGRAMS_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `ListProgramsUsecase#execute => ${failure.message}`,
    ]);
  });
});
