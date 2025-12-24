// src/services/db/dtos/athlete-info.dto.ts

export interface CreateAthleteInfoDto {
  userId: string;
  levelId?: string;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  createdBy: string;
}

export type UpdateAthleteInfoDto = Partial<CreateAthleteInfoDto>;

export interface GetAthleteInfoDto { id: string }

export interface ListAthleteInfosDto {
  userId?: string;
  userIds?: string[];
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
