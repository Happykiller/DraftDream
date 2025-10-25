// src/common/role.enum.ts
// Role enum centralizing shared authorization roles across layers.
export enum Role {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  ATHLETE = 'ATHLETE',
}

export type RoleValues = `${Role}`;
