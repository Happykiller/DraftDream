// src/services/db/models/client/client.model.ts
import { ProspectStatus } from '@src/common/prospect-status.enum';

export interface ProspectWorkflowEntry {
  status: ProspectStatus | 'create';
  date: Date;
}

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatus;
  levelId?: string;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  sourceId?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: Date;
  workflowHistory: ProspectWorkflowEntry[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
