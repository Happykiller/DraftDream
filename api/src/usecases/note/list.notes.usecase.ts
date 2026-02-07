// src/usecases/note/list.notes.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { ListNotesUsecaseDto } from '@usecases/note/note.usecase.dto';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { mapNoteToUsecase } from '@usecases/note/note.mapper';

export interface ListNotesUsecaseResult {
  items: NoteUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Use case responsible for listing notes.
 */
export class ListNotesUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListNotesUsecaseDto): Promise<ListNotesUsecaseResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;
      const createdBy = isAdmin ? filters.createdBy : session.userId;

      const res = await this.inversify.bddService.note.listNotes({
        athleteId: filters.athleteId,
        createdBy,
        limit: filters.limit,
        page: filters.page,
      });

      return {
        items: res.items.map(mapNoteToUsecase),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListNotesUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.LIST_NOTES_USECASE);
    }
  }
}
