// src\\usecases\\program\\update.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
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
      const toUpdate: any = { ...dto };
      if (dto.slug) {
        toUpdate.slug = buildSlug({ label: dto.slug, fallback: 'program' });
      } else if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'program' });
      }
      if (dto.sessions) {
        toUpdate.sessions = dto.sessions.map((session) => {
          return {
            ...session,
            slug: buildSlug({ label: session.label, fallback: 'session' }),
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
