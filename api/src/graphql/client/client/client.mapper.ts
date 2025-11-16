// src/graphql/client/client/client.mapper.ts
import { ClientUsecaseModel } from '@usecases/client/client/client.usecase.model';

import { ClientGql } from './client.gql.types';

export const mapClientUsecaseToGql = (client: ClientUsecaseModel): ClientGql => ({
  id: client.id,
  firstName: client.firstName,
  lastName: client.lastName,
  email: client.email,
  phone: client.phone,
  statusId: client.statusId,
  levelId: client.levelId,
  objectiveIds: client.objectiveIds ?? [],
  activityPreferenceIds: client.activityPreferenceIds ?? [],
  medicalConditions: client.medicalConditions,
  allergies: client.allergies,
  notes: client.notes,
  sourceId: client.sourceId,
  budget: client.budget,
  dealDescription: client.dealDescription,
  desiredStartDate: client.desiredStartDate,
  createdBy: client.createdBy,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});
