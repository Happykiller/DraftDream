// src/services/db/models/client/client.model.ts

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  statusId?: string;
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
