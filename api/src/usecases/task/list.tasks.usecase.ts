// src/usecases/task/list.tasks.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { ListTasksUsecaseDto } from '@usecases/task/task.usecase.dto';

export interface ListTasksUsecaseResult {
  items: TaskUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListTasksUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListTasksUsecaseDto): Promise<ListTasksUsecaseResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;
      const createdBy = isAdmin ? filters.createdBy : session.userId;

      const res = await this.inversify.bddService.task.listTasks({
        priority: filters.priority,
        status: filters.status,
        day: filters.day,
        dayFrom: filters.dayFrom,
        dayTo: filters.dayTo,
        createdBy,
        limit: filters.limit,
        page: filters.page,
      });

      return {
        items: res.items.map((item) => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListTasksUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.LIST_TASKS_USECASE);
    }
  }
}
