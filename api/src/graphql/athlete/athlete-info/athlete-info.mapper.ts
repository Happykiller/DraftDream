// src/graphql/athlete/athlete-info/athlete-info.mapper.ts
import { AthleteInfoUsecaseModel } from '@usecases/athlete/athlete-info/athlete-info.usecase.model';

import { AthleteInfoGql } from './athlete-info.gql.types';

export const mapAthleteInfoUsecaseToGql = (info: AthleteInfoUsecaseModel): AthleteInfoGql => ({
  id: info.id,
  userId: info.userId,
  levelId: info.levelId,
  objectiveIds: info.objectiveIds,
  activityPreferenceIds: info.activityPreferenceIds,
  medicalConditions: info.medicalConditions,
  allergies: info.allergies,
  notes: info.notes,
  createdBy: info.createdBy,
  createdAt: info.createdAt,
  updatedAt: info.updatedAt,
  deletedAt: info.deletedAt,
  schemaVersion: info.schemaVersion,
  objectives: [],
  activityPreferences: [],
});
