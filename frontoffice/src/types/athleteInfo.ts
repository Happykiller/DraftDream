// src/types/athleteInfo.ts

import type { ProspectActivityPreferenceRelation, ProspectObjectiveRelation } from './prospects';

export interface AthleteInfo {
  id: string;
  userId: string;
  levelId?: string | null;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  objectives?: ProspectObjectiveRelation[];
  activityPreferences?: ProspectActivityPreferenceRelation[];
}
