// src/graphql/prospect/activity-preference/prospect-activity-preference.mapper.ts
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';

import { ProspectActivityPreferenceGql, ProspectActivityPreferenceVisibility } from './prospect-activity-preference.gql.types';

export function mapProspectActivityPreferenceUsecaseToGql(model: ProspectActivityPreference): ProspectActivityPreferenceGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ProspectActivityPreferenceVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
