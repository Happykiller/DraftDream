import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import inversify from '@src/inversify/investify';

interface RequestWithHeaders {
  headers: {
    authorization?: string;
    Authorization?: string;
  };
}

@Controller('coach/athletes')
export class CoachAthleteKpiController {
  @Get(':id/kpi-summary')
  async getKpiSummary(
    @Param('id') athleteId: string,
    @Req() req: RequestWithHeaders,
  ) {
    const session = await this.extractSession(req);

    if (![Role.ADMIN, Role.COACH].includes(session.role)) {
      throw new ForbiddenException(ERRORS.FORBIDDEN);
    }

    try {
      return await inversify.getAthleteKpiSummaryUsecase.execute({
        athleteId,
        session,
      });
    } catch (error: any) {
      if (error?.message === ERRORS.FORBIDDEN) {
        throw new ForbiddenException(ERRORS.FORBIDDEN);
      }
      throw error;
    }
  }

  private async extractSession(req: RequestWithHeaders): Promise<{ userId: string; role: Role }> {
    const authz = req.headers.authorization ?? req.headers.Authorization;

    if (!authz?.startsWith('Bearer ')) {
      throw new UnauthorizedException(ERRORS.UNAUTHORIZED);
    }

    const token = authz.slice('Bearer '.length).trim();
    const result = await inversify.jwtService.verify(token);

    if (!result.valid || result.payload?.type !== 'access') {
      throw new UnauthorizedException(ERRORS.INVALID_TOKEN);
    }

    return {
      userId: String(result.payload.id),
      role: result.payload.role as Role,
    };
  }
}
