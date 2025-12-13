// src/graphql/client/client/client.mapper.ts
import { ProspectUsecaseModel } from '@usecases/prospect/prospect/prospect.usecase.model';

import { ProspectGql } from './prospect.gql.types';

export const mapProspectUsecaseToGql = (model: ProspectUsecaseModel): ProspectGql => {
  return {
    id: model.id,
    firstName: model.firstName,
    lastName: model.lastName,
    email: model.email,
    phone: model.phone,
    status: model.status,
    levelId: model.levelId,
    objectiveIds: model.objectiveIds,
    activityPreferenceIds: model.activityPreferenceIds,
    medicalConditions: model.medicalConditions,
    allergies: model.allergies,
    notes: model.notes,
    sourceId: model.sourceId,
    budget: model.budget,
    dealDescription: model.dealDescription,
    desiredStartDate: model.desiredStartDate,
    workflowHistory: model.workflowHistory ?? [],
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    matchedAthleteId: model.matchedAthleteId,
    coachAthleteLinkId: model.coachAthleteLinkId,
  };
};
