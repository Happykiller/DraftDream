// src\\usecases\\program\\create.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { CreateProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { mapProgramToUsecase } from '@src/usecases/sport/program/program.mapper';
import type { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export class CreateProgramUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Creates a new program; returns null on duplicate slug/locale (active docs). */
  async execute(dto: CreateProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'program' });
      const sessions = dto.sessions.map((session) => {
        return {
          ...session,
          slug: buildSlug({ label: session.label, fallback: 'session' }),
        };
      });

      const created = await this.inversify.bddService.program.create({
        ...dto,
        slug,
        sessions,
      });
      return created ? mapProgramToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateProgramUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_PROGRAM_USECASE);
    }
  }
}
