// src/auth/guards/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ERRORS } from '@src/common/ERROR';
import { Role } from '../common/ROLE';
import inversify from '@src/inversify/investify';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const authz = req.headers.authorization ?? req.headers.Authorization;
    if (!authz?.startsWith('Bearer ')) {
      throw new Error(ERRORS.UNAUTHORIZED);
    }

    const token = authz.slice('Bearer '.length).trim();
    const res = await inversify.jwtService.verify(token);
    if (!res.valid) throw new Error(ERRORS.INVALID_TOKEN);

    const payload = res.payload;
    if (payload?.type !== 'access') throw new Error(ERRORS.ACCESS_TOKEN_REQUIRED);

    // on attache l'utilisateur au contexte
    req.user = { id: String(payload.id), role: payload.role as Role, email: payload.email };
    return true;
  }
}
