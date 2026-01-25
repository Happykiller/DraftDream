import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTaskMongo } from '@services/db/mongo/repositories/task.repository';
import { UpdateTaskUsecase } from '@usecases/task/update.task.usecase';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateTaskUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let taskRepositoryMock: BddServiceTaskMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateTaskUsecase;

  const now = new Date('2024-01-15T00:00:00.000Z');
  const task: TaskUsecaseModel = {
    id: 'task-1',
    label: 'Review plan',
    priority: TaskPriority.MIDDLE,
    status: TaskStatus.TODO,
    day: now,
    createdBy: 'coach-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    taskRepositoryMock = {
      get: createMockFn(),
      update: createMockFn(),
    } as unknown as BddServiceTaskMongo;

    bddServiceMock = {
      task: taskRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new UpdateTaskUsecase(inversifyMock);
  });

  it('should update a task when the user is the creator', async () => {
    const updated: TaskUsecaseModel = {
      ...task,
      label: 'Updated',
      priority: TaskPriority.HIGH,
      status: TaskStatus.DONE,
    };

    asMock(taskRepositoryMock.get).mockResolvedValue(task);
    asMock(taskRepositoryMock.update).mockResolvedValue(updated);

    const result = await usecase.execute({
      id: task.id,
      label: 'Updated',
      priority: TaskPriority.HIGH,
      status: TaskStatus.DONE,
      session: { userId: 'coach-1', role: Role.COACH },
    });

    expect(asMock(taskRepositoryMock.update).mock.calls[0]).toEqual([
      task.id,
      {
        label: 'Updated',
        priority: TaskPriority.HIGH,
        status: TaskStatus.DONE,
        day: undefined,
      },
    ]);
    expect(result).toEqual(updated);
  });

  it('should throw a domain error when user is not authorized', async () => {
    asMock(taskRepositoryMock.get).mockResolvedValue(task);

    await expect(usecase.execute({
      id: task.id,
      label: 'Updated',
      session: { userId: 'other-user', role: Role.COACH },
    })).rejects.toThrow(ERRORS.UPDATE_TASK_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0][0]).toContain('UpdateTaskUsecase#execute');
  });
});
