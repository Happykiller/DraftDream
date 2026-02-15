import { Role } from '@src/common/role.enum';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

export interface CreateDailyReportUsecaseDto {
  reportDate?: string;
  trainingDone: boolean;
  nutritionPlanCompliance: number;
  nutritionDeviations: boolean;
  mealCount: number;
  hydrationLiters: number;
  cravingsSnacking: boolean;
  digestiveDiscomfort: boolean;
  transitOk: boolean;
  menstruation: boolean;
  sleepHours: number;
  sleepQuality: number;
  wakeRested: boolean;
  muscleSoreness: boolean;
  waterRetention: boolean;
  energyLevel: number;
  motivationLevel: number;
  stressLevel: number;
  moodLevel: number;
  disruptiveFactor: boolean;
  painZones: string[];
  notes?: string;
  athleteId?: string;
  session: UsecaseSession;
}

export interface GetDailyReportUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListDailyReportsUsecaseDto {
  athleteId?: string;
  createdBy?: string;
  reportDate?: string;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface UpdateDailyReportUsecaseDto {
  id: string;
  reportDate?: string;
  trainingDone?: boolean;
  nutritionPlanCompliance?: number;
  nutritionDeviations?: boolean;
  mealCount?: number;
  hydrationLiters?: number;
  cravingsSnacking?: boolean;
  digestiveDiscomfort?: boolean;
  transitOk?: boolean;
  menstruation?: boolean;
  sleepHours?: number;
  sleepQuality?: number;
  wakeRested?: boolean;
  muscleSoreness?: boolean;
  waterRetention?: boolean;
  energyLevel?: number;
  motivationLevel?: number;
  stressLevel?: number;
  moodLevel?: number;
  disruptiveFactor?: boolean;
  painZones?: string[];
  notes?: string;
  session: UsecaseSession;
}

export interface DeleteDailyReportUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface HardDeleteDailyReportUsecaseDto {
  id: string;
  session: UsecaseSession;
}
