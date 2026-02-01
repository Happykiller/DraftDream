import { beforeEach, describe, expect, it } from '@jest/globals';

import { Role } from '@src/common/role.enum';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTaskMongo } from '@services/db/mongo/repositories/task.repository';
import { ListTasksUsecase } from '@usecases/task/list.tasks.usecase';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

describe('ListTasksUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let taskRepositoryMock: BddServiceTaskMongo;
  let usecase: ListTasksUsecase;

  const now = new Date('2024-01-10T00:00:00.000Z');
  const items: TaskUsecaseModel[] = [
    {
      id: 'task-1',
      label: 'Review plan',
      priority: TaskPriority.MIDDLE,
      status: TaskStatus.TODO,
      day: now,
      createdBy: 'coach-1',
      createdAt: now,
      updatedAt: now,
    },
  ];

  beforeEach(() => {
    taskRepositoryMock = {
      listTasks: createMockFn(),
    } as unknown as BddServiceTaskMongo;

    bddServiceMock = {
      task: taskRepositoryMock,
    } as unknown as BddServiceMongo;

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: { error: createMockFn() },
    } as unknown as Inversify;

    usecase = new ListTasksUsecase(inversifyMock);
  });

  it('should list tasks scoped to the user for non-admin roles', async () => {
    asMock(taskRepositoryMock.listTasks).mockResolvedValue({
      items,
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await usecase.execute({
      priority: TaskPriority.MIDDLE,
      createdBy: 'someone-else',
      session: { userId: 'coach-1', role: Role.COACH },
    });

    expect(asMock(taskRepositoryMock.listTasks).mock.calls[0][0]).toEqual(
      expect.objectContaining({ createdBy: 'coach-1', priority: TaskPriority.MIDDLE }),
    );
    expect(result.items).toHaveLength(1);
  });

  it('should allow admins to filter by creator', async () => {
    asMock(taskRepositoryMock.listTasks).mockResolvedValue({
      items,
      total: 1,
      page: 1,
      limit: 20,
    });

    await usecase.execute({
      createdBy: 'coach-1',
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(asMock(taskRepositoryMock.listTasks).mock.calls[0][0]).toEqual(
      expect.objectContaining({ createdBy: 'coach-1' }),
    );
  });
});
