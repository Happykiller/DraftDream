// src\usecases\session\get.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { GetSessionUsecaseDto } from '@src/usecases/sport/session/session.usecase.dto';
import { mapSessionToUsecase } from '@src/usecases/sport/session/session.mapper';
import type { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';
import { enumEquals } from '@src/common/enum.util';

export class GetSessionUsecase {
  constructor(private readonly inversify: Inversify) { }

  /** Returns a session or null (invalid id or not found). */
  async execute(dto: GetSessionUsecaseDto): Promise<SessionUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const s = await this.inversify.bddService.session.get(payload);
      if (!s) {
        return null;
      }

      const creatorId = typeof s.createdBy === 'string' ? s.createdBy : s.createdBy?.id;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;
      const isCoach = session.role === Role.COACH;
      const isPublic = isCoach ? (enumEquals(s.visibility, 'PUBLIC') || await this.isPublicTemplate(creatorId)) : false;

      if (!isAdmin && !isCreator && !(isCoach && isPublic)) {
        throw new Error(ERRORS.GET_SESSION_FORBIDDEN);
      }

      return mapSessionToUsecase(s);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_SESSION_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetSessionUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_SESSION_USECASE);
    }
  }

  private async isPublicTemplate(creatorId?: string | null): Promise<boolean> {
    if (!creatorId) {
      return false;
    }

    try {
      const user = await this.inversify.bddService.user.getUser({ id: creatorId });
      return user?.type === 'admin';
    } catch (error) {
      this.inversify.loggerService.warn?.(
        `GetSessionUsecase#isPublicTemplate => ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
