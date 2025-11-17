// src/types/coachAthletes.ts

export interface CoachAthleteUserSummary {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface CoachAthleteLink {
  id: string;
  coachId: string;
  athleteId: string;
  startDate: string;
  endDate?: string | null;
  is_active: boolean;
  note?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  coach?: CoachAthleteUserSummary | null;
  athlete?: CoachAthleteUserSummary | null;
}

export interface CoachAthleteListResult {
  items: CoachAthleteLink[];
  total: number;
  page: number;
  limit: number;
}
