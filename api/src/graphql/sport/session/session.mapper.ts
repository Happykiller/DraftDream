// src\graphql\session\session.mapper.ts
import { SessionUsecaseModel } from '@usecases/session/session.usecase.model';
import { SessionSportGql } from '@src/graphql/sport/session/session.gql.types';

export function mapSessionUsecaseToGql(m: SessionUsecaseModel): SessionSportGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    label: m.label,
    durationMin: m.durationMin,
    description: m.description,
    exerciseIds: [...m.exerciseIds],
    exercises: [],
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
