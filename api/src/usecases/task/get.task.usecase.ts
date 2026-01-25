// src/usecases/task/get.task.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { GetTaskUsecaseDto } from '@usecases/task/task.usecase.dto';

export class GetTaskUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetTaskUsecaseDto): Promise<TaskUsecaseModel | null> {
    try {
      const task = await this.inversify.bddService.task.get({ id: dto.id });
      if (!task) {
        return null;
      }

      const isAdmin = dto.session.role === Role.ADMIN;
      const isCreator = task.createdBy === dto.session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.GET_TASK_FORBIDDEN);
      }

      return { ...task };
    } catch (e: any) {
      if (e?.message === ERRORS.GET_TASK_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetTaskUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_TASK_USECASE);
    }
  }
}
