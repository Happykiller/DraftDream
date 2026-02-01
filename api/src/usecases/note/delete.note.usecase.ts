// src/usecases/note/delete.note.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteNoteUsecaseDto } from '@usecases/note/note.usecase.dto';

/**
 * Use case responsible for soft-deleting notes.
 */
export class DeleteNoteUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteNoteUsecaseDto): Promise<boolean> {
    try {
      const note = await this.inversify.bddService.note.get({ id: dto.id });
      if (!note) {
        return false;
      }

      const isAdmin = dto.session.role === Role.ADMIN;
      const isCreator = note.createdBy === dto.session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_NOTE_FORBIDDEN);
      }

      return await this.inversify.bddService.note.delete(dto.id);
    } catch (e: any) {
      if (e?.message === ERRORS.DELETE_NOTE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`DeleteNoteUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.DELETE_NOTE_USECASE);
    }
  }
}
