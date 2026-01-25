import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTaskMongo } from '@services/db/mongo/repositories/task.repository';
import { DeleteTaskUsecase } from '@usecases/task/delete.task.usecase';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteTaskUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let taskRepositoryMock: BddServiceTaskMongo;
  let loggerMock: LoggerMock;
  let usecase: DeleteTaskUsecase;

  const now = new Date('2024-03-01T00:00:00.000Z');
  const task: TaskUsecaseModel = {
    id: 'task-1',
    label: 'Clean plan',
    priority: 'LOW',
    status: 'TODO',
    day: now,
    createdBy: 'coach-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    taskRepositoryMock = {
      get: createMockFn(),
      delete: createMockFn(),
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

    usecase = new DeleteTaskUsecase(inversifyMock);
  });

  it('should soft delete when user is admin', async () => {
    asMock(taskRepositoryMock.get).mockResolvedValue(task);
    asMock(taskRepositoryMock.delete).mockResolvedValue(true);

    const result = await usecase.execute({
      id: task.id,
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result).toBe(true);
  });

  it('should throw when user is not authorized', async () => {
    asMock(taskRepositoryMock.get).mockResolvedValue(task);

    await expect(usecase.execute({
      id: task.id,
      session: { userId: 'other-user', role: Role.COACH },
    })).rejects.toThrow(ERRORS.DELETE_TASK_FORBIDDEN);
  });
});
