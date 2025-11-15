// src/commons/enums.ts

export const UserType = {
  Admin: 'admin',
  Coach: 'coach',
  Athlete: 'athlete',
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];
