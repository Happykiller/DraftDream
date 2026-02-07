// src/usecases/note/hard-delete.note.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { HardDeleteNoteUsecaseDto } from '@usecases/note/note.usecase.dto';

/**
 * Use case responsible for hard-deleting notes.
 */
export class HardDeleteNoteUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: HardDeleteNoteUsecaseDto): Promise<boolean> {
    try {
      if (dto.session.role !== Role.ADMIN) {
        throw new Error(ERRORS.HARD_DELETE_NOTE_FORBIDDEN);
      }

      return await this.inversify.bddService.note.hardDelete(dto.id);
    } catch (e: any) {
      if (e?.message === ERRORS.HARD_DELETE_NOTE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`HardDeleteNoteUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.HARD_DELETE_NOTE_USECASE);
    }
  }
}
