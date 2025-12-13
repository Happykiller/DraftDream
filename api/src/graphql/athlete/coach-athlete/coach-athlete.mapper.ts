// src/graphql/athlete/coach-athlete/coach-athlete.mapper.ts
import { CoachAthleteUsecaseModel } from '@usecases/athlete/coach-athlete/coach-athlete.usecase.model';

import { CoachAthleteGql } from './coach-athlete.gql.types';

export const mapCoachAthleteUsecaseToGql = (link: CoachAthleteUsecaseModel): CoachAthleteGql => ({
  id: link.id,
  coachId: link.coachId,
  athleteId: link.athleteId,
  startDate: link.startDate,
  endDate: link.endDate,
  is_active: link.is_active,
  active: link.is_active,
  note: link.note,
  createdBy: link.createdBy,
  createdAt: link.createdAt,
  updatedAt: link.updatedAt,
  deletedAt: link.deletedAt,
});
