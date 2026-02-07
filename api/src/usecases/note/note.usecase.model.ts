// src/usecases/note/note.usecase.model.ts
export interface NoteUsecaseModel {
  id: string;
  label: string;
  description: string;
  athleteId?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
