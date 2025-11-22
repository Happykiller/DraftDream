// src/graphql/prospect/objective/prospect-objective.mapper.ts
import { ProspectObjective } from '@services/db/models/prospect/objective.model';

import { ProspectObjectiveGql, ProspectObjectiveVisibility } from './prospect-objective.gql.types';

export function mapProspectObjectiveUsecaseToGql(model: ProspectObjective): ProspectObjectiveGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ProspectObjectiveVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
