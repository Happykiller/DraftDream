// src/graphql/context/buildContext.ts
import { ERRORS } from '@src/common/ERROR';
import { AccessTokenClaims, AuthContext } from '@graphql/auth/auth.types';

export function buildContextFactory(inversify: any) {
  return async function buildContext({ req }): Promise<AuthContext> {
    const authz: string | undefined =
      req?.headers?.authorization ?? req?.headers?.Authorization;
    let user: AuthContext['user'] = null;
    let tokenPayload: AccessTokenClaims | null = null;

    if (authz?.startsWith('Bearer ')) {
      const token = authz.slice('Bearer '.length).trim();
      try {
        const res = await inversify.jwtService.verify(token);

        if (res.valid) {
          const payload = res.payload as AccessTokenClaims;
          // Exiger un access-token
          if (payload?.type !== 'access') {
            inversify.loggerService.warn('Refus: token.type != access');
            throw new Error(ERRORS.ACCESS_TOKEN_REQUIRED);
          }
          // Hydrate le user minimal pour le contexte
          user = { id: String(payload.id), role: payload.role, email: payload.email };
          tokenPayload = payload;
        } else {
          inversify.loggerService.warn(`JWT invalid: ${res.reason}`);
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        inversify.loggerService.warn(`JWT verify failed: ${reason}`);
      }
    }

    return { inversify, user, tokenPayload };
  };
}
