// src/graphql/note/note.mapper.ts
import { NoteGql } from '@graphql/note/note.gql.types';
import { NoteUsecaseModel } from '@usecases/note/note.usecase.model';

/**
 * Maps use case models into GraphQL types.
 */
export function mapNoteUsecaseToGql(note: NoteUsecaseModel): NoteGql {
  return {
    id: note.id,
    label: note.label,
    description: note.description,
    athleteId: note.athleteId ?? null,
    createdBy: note.createdBy,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}
