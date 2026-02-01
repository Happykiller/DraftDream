// src/usecases/note/update.note.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { UpdateNoteUsecaseDto } from '@usecases/note/note.usecase.dto';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { mapNoteToUsecase } from '@usecases/note/note.mapper';

/**
 * Use case responsible for updating notes.
 */
export class UpdateNoteUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateNoteUsecaseDto): Promise<NoteUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const existing = await this.inversify.bddService.note.get({ id: payload.id });
      if (!existing) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isCreator = existing.createdBy === session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.UPDATE_NOTE_FORBIDDEN);
      }

      const updated = await this.inversify.bddService.note.update(payload.id, {
        label: payload.label,
        description: payload.description,
        athleteId: payload.athleteId,
      });
      return updated ? mapNoteToUsecase(updated) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateNoteUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.UPDATE_NOTE_USECASE);
    }
  }
}
