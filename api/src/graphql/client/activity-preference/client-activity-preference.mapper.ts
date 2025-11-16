// src/graphql/client/activity-preference/client-activity-preference.mapper.ts
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';

import {
  ClientActivityPreferenceGql,
  ClientActivityPreferenceVisibility,
} from './client-activity-preference.gql.types';

export function mapClientActivityPreferenceUsecaseToGql(
  model: ClientActivityPreferenceUsecaseModel,
): ClientActivityPreferenceGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as ClientActivityPreferenceVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
