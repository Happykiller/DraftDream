// src/usecases/note/get.note.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { GetNoteUsecaseDto } from '@usecases/note/note.usecase.dto';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { mapNoteToUsecase } from '@usecases/note/note.mapper';

/**
 * Use case responsible for retrieving notes by id.
 */
export class GetNoteUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetNoteUsecaseDto): Promise<NoteUsecaseModel | null> {
    try {
      const note = await this.inversify.bddService.note.get({ id: dto.id });
      if (!note) {
        return null;
      }

      const isAdmin = dto.session.role === Role.ADMIN;
      const isCreator = note.createdBy === dto.session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.GET_NOTE_FORBIDDEN);
      }

      return mapNoteToUsecase(note);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_NOTE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetNoteUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_NOTE_USECASE);
    }
  }
}
