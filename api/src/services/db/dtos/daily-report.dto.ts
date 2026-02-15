export interface CreateDailyReportDto {
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
  painZoneTagIds: string[];
  notes?: string;
  athleteId: string;
  createdBy: string;
}

export type UpdateDailyReportDto = Partial<Omit<CreateDailyReportDto, 'createdBy'>>;

export interface GetDailyReportDto {
  id: string;
}

export interface ListDailyReportsDto {
  athleteId?: string;
  athleteIds?: string[];
  createdBy?: string;
  reportDate?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
