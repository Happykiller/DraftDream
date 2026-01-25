import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTaskMongo } from '@services/db/mongo/repositories/task.repository';
import { GetTaskUsecase } from '@usecases/task/get.task.usecase';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetTaskUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let taskRepositoryMock: BddServiceTaskMongo;
  let loggerMock: LoggerMock;
  let usecase: GetTaskUsecase;

  const now = new Date('2024-02-01T00:00:00.000Z');
  const task: TaskUsecaseModel = {
    id: 'task-1',
    label: 'Follow-up',
    priority: TaskPriority.HIGH,
    status: TaskStatus.DONE,
    day: now,
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    taskRepositoryMock = {
      get: createMockFn(),
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

    usecase = new GetTaskUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return task when user is admin', async () => {
    asMock(taskRepositoryMock.get).mockResolvedValue(task);

    const result = await usecase.execute({
      id: task.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result).toEqual(task);
  });

  it('should return null when task does not exist', async () => {
    asMock(taskRepositoryMock.get).mockResolvedValue(null);

    const result = await usecase.execute({
      id: 'missing',
      session: { userId: 'coach-123', role: Role.COACH },
    });

    expect(result).toBeNull();
  });

  it('should throw when user is not allowed to access the task', async () => {
    asMock(taskRepositoryMock.get).mockResolvedValue(task);

    await expect(usecase.execute({
      id: task.id,
      session: { userId: 'other-user', role: Role.COACH },
    })).rejects.toThrow(ERRORS.GET_TASK_FORBIDDEN);
  });
});
