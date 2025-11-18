// src/services/db/models/coach-athlete.model.ts

export interface CoachAthleteLink {
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
  schemaVersion?: number;
}
