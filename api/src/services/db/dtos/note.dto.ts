// src/services/db/dto/note.dto.ts
export interface CreateNoteDto {
  label: string;
  description: string;
  athleteId?: string | null;
  createdBy: string;
}

export type UpdateNoteDto = Partial<Pick<CreateNoteDto, 'label' | 'description' | 'athleteId'>>;

export interface GetNoteDto { id: string }

export interface ListNotesDto {
  athleteId?: string | null;
  createdBy?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
