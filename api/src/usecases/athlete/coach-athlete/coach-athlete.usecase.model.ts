// src/usecases/athlete/coach-athlete/coach-athlete.usecase.model.ts

export interface CoachAthleteUsecaseModel {
  id: string;
  coachId: string;
  athleteId: string;
  startDate: Date;
  endDate?: Date;
  is_active: boolean;
  note?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
