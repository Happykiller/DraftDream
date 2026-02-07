// src/usecases/note/create.note.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { CreateNoteUsecaseDto } from '@usecases/note/note.usecase.dto';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';
import { mapNoteToUsecase } from '@usecases/note/note.mapper';

/**
 * Use case responsible for creating notes.
 */
export class CreateNoteUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateNoteUsecaseDto): Promise<NoteUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.note.create({
        label: dto.label,
        description: dto.description,
        athleteId: dto.athleteId,
        createdBy: dto.session.userId,
      });
      return created ? mapNoteToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateNoteUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_NOTE_USECASE);
    }
  }
}
