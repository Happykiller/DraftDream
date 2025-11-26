// src\usecases\session\update.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { UpdateSessionUsecaseDto } from '@src/usecases/sport/session/session.usecase.dto';
import { mapSessionToUsecase } from '@src/usecases/sport/session/session.mapper';
import type { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';

export class UpdateSessionUsecase {
  constructor(private readonly inversify: Inversify) { }

  /** Partial update; returns null on unique conflict or not found. */
  async execute(id: string, dto: UpdateSessionUsecaseDto): Promise<SessionUsecaseModel | null> {
    try {
      const toUpdate: any = { ...dto };
      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'session' });
      }
      const updated = await this.inversify.bddService.session.update(id, toUpdate);
      return updated ? mapSessionToUsecase(updated) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateSessionUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.UPDATE_SESSION_USECASE);
    }
  }
}
