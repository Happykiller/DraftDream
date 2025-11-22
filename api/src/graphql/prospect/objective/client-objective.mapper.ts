// src/graphql/client/objective/client-objective.mapper.ts
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';

import { ClientObjectiveGql, ClientObjectiveVisibility } from './client-objective.gql.types';

export function mapClientObjectiveUsecaseToGql(model: ClientObjectiveUsecaseModel): ClientObjectiveGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ClientObjectiveVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
