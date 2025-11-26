// src/usecases/athlete/coach-athlete/coach-athlete.usecase.dto.ts

export interface CreateCoachAthleteUsecaseDto {
  coachId: string;
  athleteId: string;
  startDate: Date;
  endDate?: Date;
  is_active?: boolean;
  note?: string;
  createdBy: string;
}

export interface GetCoachAthleteUsecaseDto {
  id: string;
}

export interface ListCoachAthletesUsecaseDto {
  coachId?: string;
  athleteId?: string;
  is_active?: boolean;
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateCoachAthleteUsecaseDto {
  id: string;
  coachId?: string;
  athleteId?: string;
  startDate?: Date;
  endDate?: Date | null;
  is_active?: boolean;
  note?: string | null;
}

export interface DeleteCoachAthleteUsecaseDto {
  id: string;
}
