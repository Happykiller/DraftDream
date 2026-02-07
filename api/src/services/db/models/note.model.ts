// src/services/db/models/note.model.ts
export interface Note {
  id: string;
  label: string;
  description: string;
  athleteId?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
