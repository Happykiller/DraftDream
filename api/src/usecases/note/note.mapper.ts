// src/usecases/note/note.mapper.ts
import { Note } from '@services/db/models/note.model';

import { NoteUsecaseModel } from './note.usecase.model';

/**
 * Maps persistence models into use case models.
 */
export const mapNoteToUsecase = (note: Note): NoteUsecaseModel => ({
  id: note.id,
  label: note.label,
  description: note.description,
  athleteId: note.athleteId ?? null,
  createdBy: note.createdBy,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
  deletedAt: note.deletedAt,
});
