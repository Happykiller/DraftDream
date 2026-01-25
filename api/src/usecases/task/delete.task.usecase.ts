// src/usecases/task/delete.task.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteTaskUsecaseDto } from '@usecases/task/task.usecase.dto';

export class DeleteTaskUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteTaskUsecaseDto): Promise<boolean> {
    try {
      const task = await this.inversify.bddService.task.get({ id: dto.id });
      if (!task) {
        return false;
      }

      const isAdmin = dto.session.role === Role.ADMIN;
      const isCreator = task.createdBy === dto.session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_TASK_FORBIDDEN);
      }

      return await this.inversify.bddService.task.delete(dto.id);
    } catch (e: any) {
      if (e?.message === ERRORS.DELETE_TASK_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`DeleteTaskUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.DELETE_TASK_USECASE);
    }
  }
}
