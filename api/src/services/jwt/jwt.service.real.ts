// src/services/jwt/jwt.service.real.ts
import { SignJWT, jwtVerify, decodeJwt, decodeProtectedHeader } from 'jose';

import { JwtService } from '@services/jwt/jwt.service';

type Cfg = {
  jwt: {
    secret: string;              // config.jwt.secret
    expire: number;              // seconds (ex: 900)
    issuer?: string;
    audience?: string;
    clockToleranceSec?: number;  // défaut 5
  }
};

export class JwtServiceReal implements JwtService {
  private readonly key: Uint8Array;
  private readonly expire: number;
  private readonly issuer?: string;
  private readonly audience?: string;
  private readonly clockTolerance: number;

  constructor(cfg: Cfg) {
    if (!cfg?.jwt?.secret) throw new Error('JWT_SECRET_MISSING');
    this.key = new TextEncoder().encode(cfg.jwt.secret);
    this.expire = cfg.jwt.expire ?? 900;
    this.issuer = cfg.jwt.issuer;
    this.audience = cfg.jwt.audience;
    this.clockTolerance = cfg.jwt.clockToleranceSec ?? 5;
  }

  async sign(claims: Record<string, any>, opts?: { expiresInSec?: number; subject?: string }): Promise<string> {
    const nowSec = Math.floor(Date.now() / 1000);
    let builder = new SignJWT({ ...claims })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(nowSec)
      .setExpirationTime(nowSec + (opts?.expiresInSec ?? this.expire));

    if (this.issuer) builder = builder.setIssuer(this.issuer);
    if (this.audience) builder = builder.setAudience(this.audience);
    if (opts?.subject ?? claims?.sub) builder = builder.setSubject(String(opts?.subject ?? claims.sub));

    return builder.sign(this.key);
  }

  async verify(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.key, {
        algorithms: ['HS256'],
        audience: this.audience,
        issuer: this.issuer,
        clockTolerance: this.clockTolerance,
      });
      return { valid: true as const, payload };
    } catch (e: any) {
      const msg = String(e?.message ?? '').toLowerCase();
      if (msg.includes('exp')) return { valid: false as const, reason: 'expired' as const };
      if (msg.includes('not') && msg.includes('before')) return { valid: false as const, reason: 'nbf' as const };
      return { valid: false as const, reason: 'invalid' as const };
    }
  }

  decode(token: string) {
    try {
      const header = decodeProtectedHeader(token);
      const payload = decodeJwt(token);
      return { header, payload };
    } catch {
      return null;
    }
  }
}
