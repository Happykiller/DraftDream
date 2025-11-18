// src/components/clients/clientFormValues.ts
import * as React from 'react';

import type { Client } from '@app-types/clients';

export interface ClientFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  statusId: string | null;
  levelId: string | null;
  sourceId: string | null;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions: string;
  allergies: string;
  notes: string;
  budget: string;
  dealDescription: string;
  desiredStartDate: string;
}

export const DEFAULT_CLIENT_FORM_VALUES: ClientFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  statusId: null,
  levelId: null,
  sourceId: null,
  objectiveIds: [],
  activityPreferenceIds: [],
  medicalConditions: '',
  allergies: '',
  notes: '',
  budget: '',
  dealDescription: '',
  desiredStartDate: '',
};

function normalizeClient(client?: Client | null): ClientFormValues {
  if (!client) {
    return DEFAULT_CLIENT_FORM_VALUES;
  }

  return {
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone ?? '',
    statusId: client.statusId ?? null,
    levelId: client.levelId ?? null,
    sourceId: client.sourceId ?? null,
    objectiveIds: client.objectiveIds ?? [],
    activityPreferenceIds: client.activityPreferenceIds ?? [],
    medicalConditions: client.medicalConditions ?? '',
    allergies: client.allergies ?? '',
    notes: client.notes ?? '',
    budget: client.budget != null ? String(client.budget) : '',
    dealDescription: client.dealDescription ?? '',
    desiredStartDate: client.desiredStartDate ? client.desiredStartDate.slice(0, 10) : '',
  } satisfies ClientFormValues;
}

export function useClientFormValues(client?: Client | null): ClientFormValues {
  return React.useMemo(() => normalizeClient(client), [client]);
}
