// src/graphql/types/auth.types.ts
import { Role } from '../common/ROLE';

export interface AccessTokenClaims {
  id: string;
  role: Role;
  email: string;
  type: 'access';      // on exige un access-token
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  sub?: string;
}

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

export interface AuthContext {
  user?: AuthUser | null;
  // expose aussi le raw payload si besoin fin/debug
  tokenPayload?: AccessTokenClaims | null;
  inversify: import('@src/inversify/investify').Inversify;
  // … tout ce que tu mets déjà dans le context
}
