// src/pages/clients/clientFormMappers.ts
import type { ClientFormValues } from '@components/clients/clientFormValues';

import type { ClientCreateInput, ClientUpdateInput } from '@services/graphql/clients.service';

function sanitize(values: ClientFormValues): Omit<ClientCreateInput, 'firstName' | 'lastName' | 'email'> {
  return {
    phone: values.phone.trim() || undefined,
    statusId: values.statusId || undefined,
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

export function buildClientCreateInput(values: ClientFormValues): ClientCreateInput {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    ...sanitize(values),
  } satisfies ClientCreateInput;
}

export function buildClientUpdateInput(id: string, values: ClientFormValues): ClientUpdateInput {
  return {
    id,
    ...buildClientCreateInput(values),
  } satisfies ClientUpdateInput;
}
