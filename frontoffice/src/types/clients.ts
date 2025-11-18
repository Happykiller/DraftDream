// src/types/clients.ts

export interface ClientRelation {
  id: string;
  label: string;
  slug?: string | null;
}

export interface ClientObjectiveRelation {
  id: string;
  label: string;
}

export interface ClientActivityPreferenceRelation {
  id: string;
  label: string;
}

export interface ClientCreatorSummary {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  statusId?: string | null;
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: ClientCreatorSummary | null;
  status?: ClientRelation | null;
  level?: ClientRelation | null;
  source?: ClientRelation | null;
  objectives?: ClientObjectiveRelation[];
  activityPreferences?: ClientActivityPreferenceRelation[];
}

export interface ClientListResult {
  items: Client[];
  total: number;
  page: number;
  limit: number;
}
