// src/common/meal-record-state.enum.ts
// Centralized meal record states to keep transitions consistent.
export enum MealRecordState {
  CREATE = 'CREATE',
  DRAFT = 'DRAFT',
  FINISH = 'FINISH',
}

export type MealRecordStateValue = `${MealRecordState}`;
