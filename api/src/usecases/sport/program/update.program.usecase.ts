// src\\usecases\\program\\update.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { UpdateProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { mapProgramToUsecase } from '@src/usecases/sport/program/program.mapper';
import type { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export class UpdateProgramUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(id: string, dto: UpdateProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;

      // Fetch existing program to check ownership
      const existing = await this.inversify.bddService.program.get({ id });
      if (!existing) {
        return null;
      }

      // Authorization check: only creator or admin can update
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = existing.createdBy === session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.UPDATE_PROGRAM_FORBIDDEN);
      }

      // Enforce visibility rules: only admins can set PUBLIC visibility
      if (payload.visibility === 'PUBLIC' && session.role !== Role.ADMIN) {
        throw new Error(ERRORS.UPDATE_PROGRAM_FORBIDDEN);
      }

      // Build update payload without session
      const toUpdate: Partial<typeof payload> & { slug?: string } = {};
      if (payload.label !== undefined) {
        toUpdate.label = payload.label;
        toUpdate.slug = buildSlug({ label: payload.label, fallback: 'program', locale: payload.locale });
      }
      if (payload.locale !== undefined) toUpdate.locale = payload.locale;
      if (payload.duration !== undefined) toUpdate.duration = payload.duration;
      if (payload.frequency !== undefined) toUpdate.frequency = payload.frequency;
      if (payload.startDate !== undefined) toUpdate.startDate = payload.startDate;
      if (payload.endDate !== undefined) toUpdate.endDate = payload.endDate;
      if (payload.description !== undefined) toUpdate.description = payload.description;
      if (payload.visibility !== undefined) toUpdate.visibility = payload.visibility;
      if (payload.userId !== undefined) toUpdate.userId = payload.userId;
      if (payload.sessions !== undefined) {
        toUpdate.sessions = payload.sessions.map((sessionItem) => {
          return {
            ...sessionItem,
            slug: buildSlug({ label: sessionItem.label, fallback: 'session', locale: sessionItem.locale ?? payload.locale }),
          };
        });
      }
      const updated = await this.inversify.bddService.program.update(id, toUpdate);
      return updated ? mapProgramToUsecase(updated) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateProgramUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.UPDATE_PROGRAM_USECASE);
    }
  }
}
