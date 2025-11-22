// src/graphql/prospect/level/prospect-level.mapper.ts
import { ProspectLevel } from '@services/db/models/prospect/level.model';

import { ProspectLevelGql, ProspectLevelVisibility } from './prospect-level.gql.types';

export function mapProspectLevelUsecaseToGql(model: ProspectLevel): ProspectLevelGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ProspectLevelVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
