// src\usecases\session\create.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { CreateSessionUsecaseDto } from '@src/usecases/sport/session/session.usecase.dto';
import { mapSessionToUsecase } from '@src/usecases/sport/session/session.mapper';
import type { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';

export class CreateSessionUsecase {
  constructor(private readonly inversify: Inversify) { }

  /** Creates a new session; returns null on slug/locale conflict. */
  async execute(dto: CreateSessionUsecaseDto): Promise<SessionUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'session' });
      const created = await this.inversify.bddService.session.create({
        ...dto,
        slug,
      });
      return created ? mapSessionToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateSessionUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_SESSION_USECASE);
    }
  }
}
