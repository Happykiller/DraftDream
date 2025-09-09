// src/services/jwt/jwt.service.ts
export interface JwtService {
  /** Signe un JWT avec l’expiration par défaut (config.jwt.expire) sauf override */
  sign(claims: Record<string, any>, opts?: { expiresInSec?: number; subject?: string }): Promise<string>;
  /** Vérifie un JWT ; renvoie { valid, payload } ou { valid:false, reason } */
  verify(token: string): Promise<{ valid: true; payload: any } | { valid: false; reason: 'expired'|'invalid'|'nbf' }>;
  /** Décode sans vérification (utile pour debug) */
  decode(token: string): { header: any; payload: any } | null;
}
