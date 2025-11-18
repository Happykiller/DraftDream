// src/graphql/client/status/client-status.mapper.ts
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';

import { ClientStatusGql, ClientStatusVisibility } from './client-status.gql.types';

export function mapClientStatusUsecaseToGql(model: ClientStatusUsecaseModel): ClientStatusGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ClientStatusVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
