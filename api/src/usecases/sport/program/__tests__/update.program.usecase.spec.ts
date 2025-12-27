import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramMongo } from '@services/db/mongo/repositories/program.repository';
import { Program } from '@services/db/models/program.model';
import { UpdateProgramUsecase } from '@src/usecases/sport/program/update.program.usecase';
import { UpdateProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateProgramUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let programRepositoryMock: BddServiceProgramMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateProgramUsecase;

  const id = 'program-1';
  const dto: UpdateProgramUsecaseDto = {
    label: 'Updated Program',
    duration: 8,
    sessions: [
      {
        id: 'session-1',
        label: 'Updated Session',
        durationMin: 60,
        exercises: [],
      },
    ],
    session: {
      userId: 'coach-123',
      role: 'COACH' as any,
    },
  } as UpdateProgramUsecaseDto;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const program: Program = {
    id,
    slug: 'updated-program',
    locale: 'en-us',
    label: 'Updated Program',
    visibility: 'PRIVATE',
    duration: 8,
    frequency: 3,
    sessions: [
      {
        id: 'session-1',
        slug: 'updated-session',
        label: 'Updated Session',
        durationMin: 60,
        exercises: [],
      },
    ],
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  const expected: ProgramUsecaseModel = {
    id,
    slug: 'updated-program',
    locale: 'en-us',
    label: 'Updated Program',
    visibility: 'PRIVATE',
    duration: 8,
    frequency: 3,
    sessions: [
      {
        id: 'session-1',
        slug: 'updated-session',
        label: 'Updated Session',
        durationMin: 60,
        exercises: [],
      },
    ],
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    programRepositoryMock = {
      get: createMockFn(),
      update: createMockFn(),
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

    usecase = new UpdateProgramUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update and map the program', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue({ createdBy: dto.session.userId } as Program);
    asMock(programRepositoryMock.update).mockResolvedValue(program);

    const result = await usecase.execute(id, dto);

    const { session: _session, ...payload } = dto;
    expect(asMock(programRepositoryMock.update).mock.calls[0][1]).toEqual({
      ...payload,
      slug: 'updated-program',
      sessions: dto.sessions ? [
        {
          ...dto.sessions[0],
          slug: 'updated-session',
        },
      ] : undefined,
    });
    expect(result).toEqual(expected);
  });

  it('should return null when repository returns null', async () => {
    asMock(programRepositoryMock.get).mockResolvedValue({ createdBy: dto.session.userId } as Program);
    asMock(programRepositoryMock.update).mockResolvedValue(null);

    const result = await usecase.execute(id, dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository throws', async () => {
    const failure = new Error('update failure');
    asMock(programRepositoryMock.get).mockResolvedValue({ createdBy: dto.session.userId } as Program);
    asMock(programRepositoryMock.update).mockRejectedValue(failure);

    await expect(usecase.execute(id, dto)).rejects.toThrow(ERRORS.UPDATE_PROGRAM_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `UpdateProgramUsecase#execute => ${failure.message}`,
    ]);
  });
});
