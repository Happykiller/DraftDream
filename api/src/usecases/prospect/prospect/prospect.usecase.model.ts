// src/usecases/client/client/client.usecase.model.ts
import { ProspectStatus } from '@src/common/prospect-status.enum';

export interface ProspectUsecaseModel {
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
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
