// src/services/db/dtos/coach-athlete.dto.ts

export interface CreateCoachAthleteLinkDto {
  coachId: string;
  athleteId: string;
  startDate: Date;
  endDate?: Date;
  is_active?: boolean;
  note?: string;
  createdBy: string;
}

export interface UpdateCoachAthleteLinkDto {
  coachId?: string;
  athleteId?: string;
  startDate?: Date;
  endDate?: Date | null;
  is_active?: boolean;
  note?: string | null;
}

export interface GetCoachAthleteLinkDto {
  id: string;
}

export interface ListCoachAthleteLinksDto {
  coachId?: string;
  athleteId?: string;
  is_active?: boolean;
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
