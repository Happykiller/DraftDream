// src/commons/enums.ts

export const ExerciseLevel = {
  Beginner: 'BEGINNER',
  Intermediate: 'INTERMEDIATE',
  Advanced: 'ADVANCED',
} as const;

export type ExerciseLevel = (typeof ExerciseLevel)[keyof typeof ExerciseLevel];

export const UserType = {
  Admin: 'admin',
  Coach: 'coach',
  Athlete: 'athlete',
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];
