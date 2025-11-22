// src/graphql/prospect/source/prospect-source.mapper.ts
import { ProspectSource } from '@services/db/models/prospect/source.model';

import { ProspectSourceGql, ProspectSourceVisibility } from './prospect-source.gql.types';

export function mapProspectSourceUsecaseToGql(model: ProspectSource): ProspectSourceGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ProspectSourceVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
