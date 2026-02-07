import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceNoteMongo } from '@services/db/mongo/repositories/note.repository';
import { DeleteNoteUsecase } from '@usecases/note/delete.note.usecase';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteNoteUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let noteRepositoryMock: BddServiceNoteMongo;
  let loggerMock: LoggerMock;
  let usecase: DeleteNoteUsecase;

  const now = new Date('2024-03-01T00:00:00.000Z');
  const note: NoteUsecaseModel = {
    id: 'note-1',
    label: 'Clean plan',
    description: 'Cleanup note',
    athleteId: 'athlete-2',
    createdBy: 'coach-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    noteRepositoryMock = {
      get: createMockFn(),
      delete: createMockFn(),
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

    usecase = new DeleteNoteUsecase(inversifyMock);
  });

  it('should soft delete when user is admin', async () => {
    asMock(noteRepositoryMock.get).mockResolvedValue(note);
    asMock(noteRepositoryMock.delete).mockResolvedValue(true);

    const result = await usecase.execute({
      id: note.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result).toBe(true);
  });

  it('should throw when user is not authorized', async () => {
    asMock(noteRepositoryMock.get).mockResolvedValue(note);

    await expect(usecase.execute({
      id: note.id,
      session: { userId: 'other-user', role: Role.COACH },
    })).rejects.toThrow(ERRORS.DELETE_NOTE_FORBIDDEN);
  });
});
