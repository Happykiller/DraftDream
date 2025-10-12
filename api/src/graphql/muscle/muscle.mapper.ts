// src/graphql/muscle/muscle.mapper.ts
import { MuscleUsecaseModel } from '@usecases/muscle/muscle.usecase.model';
import { MuscleGql, MuscleVisibility } from '@graphql/muscle/muscle.gql.types';

export function mapMuscleUsecaseToGql(m: MuscleUsecaseModel): MuscleGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    label: m.label,
    visibility: m.visibility as MuscleVisibility,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
