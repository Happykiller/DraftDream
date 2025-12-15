// src/usecases/athlete/athlete-info/athlete-info.usecase.model.ts

export interface AthleteInfoUsecaseModel {
  id: string;
  userId: string;
  levelId?: string;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  schemaVersion: number;
}
