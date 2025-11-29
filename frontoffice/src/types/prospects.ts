// src/types/prospects.ts

import type { ProspectStatusEnum } from '@src/commons/prospects/status';

export interface ProspectRelation {
  id: string;
  label: string;
  slug?: string | null;
}

export interface ProspectObjectiveRelation {
  id: string;
  label: string;
}

export interface ProspectActivityPreferenceRelation {
  id: string;
  label: string;
}

export interface ProspectCreatorSummary {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface ProspectWorkflowEntry {
  status: string;
  date: string;
}

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status?: ProspectStatusEnum | null;
  levelId?: string | null;
  sourceId?: string | null;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string | null;
  allergies?: string | null;
  notes?: string | null;
  budget?: number | null;
  dealDescription?: string | null;
  desiredStartDate?: string | null;
  workflowHistory: ProspectWorkflowEntry[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: ProspectCreatorSummary | null;
  level?: ProspectRelation | null;
  source?: ProspectRelation | null;
  objectives?: ProspectObjectiveRelation[];
  activityPreferences?: ProspectActivityPreferenceRelation[];
}

export interface ProspectListResult {
  items: Prospect[];
  total: number;
  page: number;
  limit: number;
}
