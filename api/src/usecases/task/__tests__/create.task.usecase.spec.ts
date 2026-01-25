import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTaskMongo } from '@services/db/mongo/repositories/task.repository';
import { CreateTaskUsecase } from '@usecases/task/create.task.usecase';
import { CreateTaskUsecaseDto } from '@usecases/task/task.usecase.dto';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateTaskUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let taskRepositoryMock: BddServiceTaskMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateTaskUsecase;

  const now = new Date('2024-01-01T00:00:00.000Z');
  const dto: CreateTaskUsecaseDto = {
    label: 'Daily mobility',
    priority: TaskPriority.LOW,
    status: TaskStatus.TODO,
    day: now,
    session: { userId: 'coach-123', role: Role.COACH },
  };

  const task: TaskUsecaseModel = {
    id: 'task-1',
    label: 'Daily mobility',
    priority: TaskPriority.LOW,
    status: TaskStatus.TODO,
    day: now,
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    taskRepositoryMock = {
      create: createMockFn(),
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

    usecase = new CreateTaskUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a task through the repository', async () => {
    asMock(taskRepositoryMock.create).mockResolvedValue(task);

    const result = await usecase.execute(dto);

    expect(asMock(taskRepositoryMock.create).mock.calls[0]).toEqual([
      {
        label: dto.label,
        priority: dto.priority,
        status: dto.status,
        day: dto.day,
        createdBy: dto.session.userId,
      },
    ]);
    expect(result).toEqual(task);
  });

  it('should return null when the repository returns null', async () => {
    asMock(taskRepositoryMock.create).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    asMock(taskRepositoryMock.create).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_TASK_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateTaskUsecase#execute => ${failure.message}`,
    ]);
  });
});
