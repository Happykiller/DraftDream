import { beforeEach, describe, expect, it } from '@jest/globals';

import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceNoteMongo } from '@services/db/mongo/repositories/note.repository';
import { ListNotesUsecase } from '@usecases/note/list.notes.usecase';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

describe('ListNotesUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let noteRepositoryMock: BddServiceNoteMongo;
  let usecase: ListNotesUsecase;

  const now = new Date('2024-01-10T00:00:00.000Z');
  const items: NoteUsecaseModel[] = [
    {
      id: 'note-1',
      label: 'Review plan',
      description: 'Follow-up on weekly plan.',
      athleteId: 'athlete-1',
      createdBy: 'coach-1',
      createdAt: now,
      updatedAt: now,
    },
  ];

  beforeEach(() => {
    noteRepositoryMock = {
      listNotes: createMockFn(),
    } as unknown as BddServiceNoteMongo;

    bddServiceMock = {
      note: noteRepositoryMock,
    } as unknown as BddServiceMongo;

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: { error: createMockFn() },
    } as unknown as Inversify;

    usecase = new ListNotesUsecase(inversifyMock);
  });

  it('should list notes scoped to the user for non-admin roles', async () => {
    asMock(noteRepositoryMock.listNotes).mockResolvedValue({
      items,
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await usecase.execute({
      athleteId: 'athlete-1',
      createdBy: 'someone-else',
      session: { userId: 'coach-1', role: Role.COACH },
    });

    expect(asMock(noteRepositoryMock.listNotes).mock.calls[0][0]).toEqual(
      expect.objectContaining({ createdBy: 'coach-1', athleteId: 'athlete-1' }),
    );
    expect(result.items).toHaveLength(1);
  });

  it('should allow admins to filter by creator', async () => {
    asMock(noteRepositoryMock.listNotes).mockResolvedValue({
      items,
      total: 1,
      page: 1,
      limit: 20,
    });

    await usecase.execute({
      createdBy: 'coach-1',
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(asMock(noteRepositoryMock.listNotes).mock.calls[0][0]).toEqual(
      expect.objectContaining({ createdBy: 'coach-1' }),
    );
  });
});
