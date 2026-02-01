// src/usecases/task/create.task.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { CreateTaskUsecaseDto } from '@usecases/task/task.usecase.dto';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { mapTaskToUsecase } from '@usecases/task/task.mapper';

export class CreateTaskUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateTaskUsecaseDto): Promise<TaskUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.task.create({
        label: dto.label,
        priority: dto.priority,
        status: dto.status,
        day: dto.day,
        createdBy: dto.session.userId,
      });
      return created ? mapTaskToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateTaskUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_TASK_USECASE);
    }
  }
}
