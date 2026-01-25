// src/usecases/task/hard-delete.task.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { HardDeleteTaskUsecaseDto } from '@usecases/task/task.usecase.dto';

export class HardDeleteTaskUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: HardDeleteTaskUsecaseDto): Promise<boolean> {
    try {
      if (dto.session.role !== Role.ADMIN) {
        throw new Error(ERRORS.HARD_DELETE_TASK_FORBIDDEN);
      }

      return await this.inversify.bddService.task.hardDelete(dto.id);
    } catch (e: any) {
      if (e?.message === ERRORS.HARD_DELETE_TASK_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`HardDeleteTaskUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.HARD_DELETE_TASK_USECASE);
    }
  }
}
