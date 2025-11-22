// src/components/prospects/prospectFormValues.ts
import * as React from 'react';

import type { Prospect } from '@app-types/prospects';
import type { ProspectStatusEnum } from '@src/commons/prospects/status';

export interface ProspectFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ProspectStatusEnum | '';
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

export const DEFAULT_PROSPECT_FORM_VALUES: ProspectFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: '',
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

function normalizeProspect(prospect?: Prospect | null): ProspectFormValues {
  if (!prospect) {
    return DEFAULT_PROSPECT_FORM_VALUES;
  }

  return {
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    email: prospect.email,
    phone: prospect.phone ?? '',
    status: prospect.status ?? '',
    levelId: prospect.levelId ?? null,
    sourceId: prospect.sourceId ?? null,
    objectiveIds: prospect.objectiveIds ?? [],
    activityPreferenceIds: prospect.activityPreferenceIds ?? [],
    medicalConditions: prospect.medicalConditions ?? '',
    allergies: prospect.allergies ?? '',
    notes: prospect.notes ?? '',
    budget: prospect.budget != null ? String(prospect.budget) : '',
    dealDescription: prospect.dealDescription ?? '',
    desiredStartDate: prospect.desiredStartDate ? prospect.desiredStartDate.slice(0, 10) : '',
  } satisfies ProspectFormValues;
}

export function useProspectFormValues(prospect?: Prospect | null): ProspectFormValues {
  return React.useMemo(() => normalizeProspect(prospect), [prospect]);
}
