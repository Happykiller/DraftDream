import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceNoteMongo } from '@services/db/mongo/repositories/note.repository';
import { UpdateNoteUsecase } from '@usecases/note/update.note.usecase';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateNoteUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let noteRepositoryMock: BddServiceNoteMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateNoteUsecase;

  const now = new Date('2024-01-15T00:00:00.000Z');
  const note: NoteUsecaseModel = {
    id: 'note-1',
    label: 'Review plan',
    description: 'Initial draft',
    athleteId: 'athlete-1',
    createdBy: 'coach-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    noteRepositoryMock = {
      get: createMockFn(),
      update: createMockFn(),
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

    usecase = new UpdateNoteUsecase(inversifyMock);
  });

  it('should update a note when the user is the creator', async () => {
    const updated: NoteUsecaseModel = {
      ...note,
      label: 'Updated',
      description: 'Updated description',
      athleteId: null,
    };

    asMock(noteRepositoryMock.get).mockResolvedValue(note);
    asMock(noteRepositoryMock.update).mockResolvedValue(updated);

    const result = await usecase.execute({
      id: note.id,
      label: 'Updated',
      description: 'Updated description',
      athleteId: null,
      session: { userId: 'coach-1', role: Role.COACH },
    });

    expect(asMock(noteRepositoryMock.update).mock.calls[0]).toEqual([
      note.id,
      {
        label: 'Updated',
        description: 'Updated description',
        athleteId: null,
      },
    ]);
    expect(result).toEqual(updated);
  });

  it('should throw a domain error when user is not authorized', async () => {
    asMock(noteRepositoryMock.get).mockResolvedValue(note);

    await expect(usecase.execute({
      id: note.id,
      label: 'Updated',
      session: { userId: 'other-user', role: Role.COACH },
    })).rejects.toThrow(ERRORS.UPDATE_NOTE_FORBIDDEN);
    expect(asMock(loggerMock.error).mock.calls[0][0]).toContain('UpdateNoteUsecase#execute');
  });

});
