// src/types/dailyReport.ts

export interface DailyReport {
    id: string;
    reportDate: string;
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
    athleteId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDailyReportInput {
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
}
export interface ListDailyReportsInput {
    athleteId?: string;
    createdBy?: string;
    reportDate?: string;
    limit?: number;
    page?: number;
}

export interface DailyReportList {
    items: DailyReport[];
    total: number;
    page: number;
    limit: number;
}
