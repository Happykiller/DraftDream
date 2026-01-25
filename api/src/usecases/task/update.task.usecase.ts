// src/usecases/task/update.task.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { UpdateTaskUsecaseDto } from '@usecases/task/task.usecase.dto';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { mapTaskToUsecase } from '@usecases/task/task.mapper';

export class UpdateTaskUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateTaskUsecaseDto): Promise<TaskUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const existing = await this.inversify.bddService.task.get({ id: payload.id });
      if (!existing) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isCreator = existing.createdBy === session.userId;
      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.UPDATE_TASK_FORBIDDEN);
      }

      const updated = await this.inversify.bddService.task.update(payload.id, {
        label: payload.label,
        priority: payload.priority,
        status: payload.status,
        day: payload.day,
      });
      return updated ? mapTaskToUsecase(updated) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateTaskUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.UPDATE_TASK_USECASE);
    }
  }
}
