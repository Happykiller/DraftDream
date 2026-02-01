import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceNoteMongo } from '@services/db/mongo/repositories/note.repository';
import { HardDeleteNoteUsecase } from '@usecases/note/hard-delete.note.usecase';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('HardDeleteNoteUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let noteRepositoryMock: BddServiceNoteMongo;
  let loggerMock: LoggerMock;
  let usecase: HardDeleteNoteUsecase;

  beforeEach(() => {
    noteRepositoryMock = {
      hardDelete: createMockFn(),
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

    usecase = new HardDeleteNoteUsecase(inversifyMock);
  });

  it('should hard delete note when user is admin', async () => {
    asMock(noteRepositoryMock.hardDelete).mockResolvedValue(true);

    const result = await usecase.execute({
      id: 'note-1',
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result).toBe(true);
  });

  it('should throw when user is not admin', async () => {
    await expect(usecase.execute({
      id: 'note-1',
      session: { userId: 'coach-1', role: Role.COACH },
    })).rejects.toThrow(ERRORS.HARD_DELETE_NOTE_FORBIDDEN);
  });
});
