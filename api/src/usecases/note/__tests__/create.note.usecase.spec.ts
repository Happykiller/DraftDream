import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceNoteMongo } from '@services/db/mongo/repositories/note.repository';
import { CreateNoteUsecase } from '@usecases/note/create.note.usecase';
import { CreateNoteUsecaseDto } from '@usecases/note/note.usecase.dto';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateNoteUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let noteRepositoryMock: BddServiceNoteMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateNoteUsecase;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const dto: CreateNoteUsecaseDto = {
    label: 'Weekly review',
    description: 'Discuss training load updates.',
    athleteId: 'athlete-42',
    session: { userId: 'coach-123', role: Role.COACH },
  };

  const note: NoteUsecaseModel = {
    id: 'note-1',
    label: dto.label,
    description: dto.description,
    athleteId: dto.athleteId,
    createdBy: dto.session.userId,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    noteRepositoryMock = {
      create: createMockFn(),
    } as unknown as BddServiceNoteMongo;

    bddServiceMock = {
      note: noteRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateNoteUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a note through the repository', async () => {
    asMock(noteRepositoryMock.create).mockResolvedValue(note);

    const result = await usecase.execute(dto);

    expect(asMock(noteRepositoryMock.create).mock.calls[0]).toEqual([
      {
        label: dto.label,
        description: dto.description,
        athleteId: dto.athleteId,
        createdBy: dto.session.userId,
      },
    ]);
    expect(result).toEqual(note);
  });

  it('should return null when the repository returns null', async () => {
    asMock(noteRepositoryMock.create).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    asMock(noteRepositoryMock.create).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_NOTE_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateNoteUsecase#execute => ${failure.message}`,
    ]);
  });
});
