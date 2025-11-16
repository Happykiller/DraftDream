// src/graphql/client/level/client-level.mapper.ts
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';

import { ClientLevelGql, ClientLevelVisibility } from './client-level.gql.types';

export function mapClientLevelUsecaseToGql(model: ClientLevelUsecaseModel): ClientLevelGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ClientLevelVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
