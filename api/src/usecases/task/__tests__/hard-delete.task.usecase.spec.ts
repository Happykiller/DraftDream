import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTaskMongo } from '@services/db/mongo/repositories/task.repository';
import { HardDeleteTaskUsecase } from '@usecases/task/hard-delete.task.usecase';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('HardDeleteTaskUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let taskRepositoryMock: BddServiceTaskMongo;
  let loggerMock: LoggerMock;
  let usecase: HardDeleteTaskUsecase;

  beforeEach(() => {
    taskRepositoryMock = {
      hardDelete: createMockFn(),
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

    usecase = new HardDeleteTaskUsecase(inversifyMock);
  });

  it('should hard delete task when user is admin', async () => {
    asMock(taskRepositoryMock.hardDelete).mockResolvedValue(true);

    const result = await usecase.execute({
      id: 'task-1',
      session: { userId: 'admin-1', role: Role.ADMIN },
    });

    expect(result).toBe(true);
  });

  it('should throw when user is not admin', async () => {
    await expect(usecase.execute({
      id: 'task-1',
      session: { userId: 'coach-1', role: Role.COACH },
    })).rejects.toThrow(ERRORS.HARD_DELETE_TASK_FORBIDDEN);
  });
});
