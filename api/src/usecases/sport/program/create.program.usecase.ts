// src\\usecases\\program\\create.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { CreateProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { mapProgramToUsecase } from '@src/usecases/sport/program/program.mapper';
import type { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export class CreateProgramUsecase {
  constructor(private readonly inversify: Inversify) { }

  /** Creates a new program; returns null on duplicate slug/locale (active docs). */
  async execute(dto: CreateProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;

      // Enforce visibility rules: only admins can create PUBLIC programs
      let visibility = payload.visibility ?? 'PRIVATE';
      if (visibility === 'PUBLIC' && session.role !== Role.ADMIN) {
        visibility = 'PRIVATE'; // Force private for non-admins
      }

      const slug = buildSlug({ label: payload.label, fallback: 'program', locale: payload.locale });
      const sessions = payload.sessions.map((sessionItem) => {
        return {
          ...sessionItem,
          slug: buildSlug({ label: sessionItem.label, fallback: 'session', locale: sessionItem.locale ?? payload.locale }),
        };
      });

      const created = await this.inversify.bddService.program.create({
        ...payload,
        visibility,
        slug,
        sessions,
      });
      return created ? mapProgramToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateProgramUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_PROGRAM_USECASE);
    }
  }
}
