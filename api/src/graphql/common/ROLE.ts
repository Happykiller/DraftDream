// src/common/ROLE.ts
import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  ATHLETE = 'ATHLETE',
}

registerEnumType(Role, { name: 'Role' }); // <-- pour GraphQL code-first
