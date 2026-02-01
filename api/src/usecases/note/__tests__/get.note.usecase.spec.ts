import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceNoteMongo } from '@services/db/mongo/repositories/note.repository';
import { GetNoteUsecase } from '@usecases/note/get.note.usecase';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetNoteUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let noteRepositoryMock: BddServiceNoteMongo;
  let loggerMock: LoggerMock;
  let usecase: GetNoteUsecase;

  const now = new Date('2024-02-01T00:00:00.000Z');
  const note: NoteUsecaseModel = {
    id: 'note-1',
    label: 'Follow-up',
    description: 'Check adjustments for next week.',
    athleteId: 'athlete-123',
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    noteRepositoryMock = {
      get: createMockFn(),
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

    usecase = new GetNoteUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return note when user is admin', async () => {
    asMock(noteRepositoryMock.get).mockResolvedValue(note);

    const result = await usecase.execute({
      id: note.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result).toEqual(note);
  });

  it('should return null when note does not exist', async () => {
    asMock(noteRepositoryMock.get).mockResolvedValue(null);

    const result = await usecase.execute({
      id: 'missing',
      session: { userId: 'coach-123', role: Role.COACH },
    });

    expect(result).toBeNull();
  });

  it('should throw when user is not allowed to access the note', async () => {
    asMock(noteRepositoryMock.get).mockResolvedValue(note);

    await expect(usecase.execute({
      id: note.id,
      session: { userId: 'other-user', role: Role.COACH },
    })).rejects.toThrow(ERRORS.GET_NOTE_FORBIDDEN);
  });
});
