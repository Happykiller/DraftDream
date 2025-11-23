// src/pages/prospects/prospectFormMappers.ts
import type { ProspectFormValues } from '@components/prospects/prospectFormValues';

import type { ProspectCreateInput, ProspectUpdateInput } from '@services/graphql/prospects.service';

function sanitize(
  values: ProspectFormValues,
): Omit<ProspectCreateInput, 'firstName' | 'lastName' | 'email'> {
  return {
    phone: values.phone.trim() || undefined,
    levelId: values.levelId || undefined,
    sourceId: values.sourceId || undefined,
    objectiveIds: values.objectiveIds.length ? values.objectiveIds : undefined,
    activityPreferenceIds: values.activityPreferenceIds.length
      ? values.activityPreferenceIds
      : undefined,
    medicalConditions: values.medicalConditions.trim() || undefined,
    allergies: values.allergies.trim() || undefined,
    notes: values.notes.trim() || undefined,
    budget: values.budget ? Number(values.budget) : undefined,
    dealDescription: values.dealDescription.trim() || undefined,
    desiredStartDate: values.desiredStartDate || undefined,
  };
}

export function buildProspectCreateInput(values: ProspectFormValues): ProspectCreateInput {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    ...sanitize(values),
  } satisfies ProspectCreateInput;
}

export function buildProspectUpdateInput(id: string, values: ProspectFormValues): ProspectUpdateInput {
  return {
    id,
    ...buildProspectCreateInput(values),
  } satisfies ProspectUpdateInput;
}
