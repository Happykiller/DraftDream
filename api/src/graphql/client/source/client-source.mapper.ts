// src/graphql/client/source/client-source.mapper.ts
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';

import { ClientSourceGql, ClientSourceVisibility } from './client-source.gql.types';

export function mapClientSourceUsecaseToGql(model: ClientSourceUsecaseModel): ClientSourceGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ClientSourceVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
