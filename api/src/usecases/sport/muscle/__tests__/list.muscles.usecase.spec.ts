import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { ListMusclesUsecase } from '@src/usecases/sport/muscle/list.muscles.usecase';
import { ListMusclesUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';
import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListMusclesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let muscleRepositoryMock: MockProxy<BddServiceMuscleMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListMusclesUsecase;

  const dto: ListMusclesUsecaseDto = {
    page: 2,
    limit: 10,
    locale: 'en-US',
  };

  const muscles: MuscleUsecaseModel[] = [
    {
      id: 'muscle-1',
      slug: 'quadriceps',
      locale: 'en-US',
      label: 'Quadriceps',
      visibility: 'PUBLIC',
      createdBy: 'coach-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-10T00:00:00.000Z'),
    },
    {
      id: 'muscle-2',
      slug: 'hamstrings',
      locale: 'en-US',
      label: 'Hamstrings',
      visibility: 'PRIVATE',
      createdBy: 'coach-2',
      createdAt: new Date('2024-02-01T00:00:00.000Z'),
      updatedAt: new Date('2024-02-10T00:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    muscleRepositoryMock = mock<BddServiceMuscleMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { muscle: BddServiceMuscleMongo }).muscle =
      muscleRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListMusclesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list muscles through the repository', async () => {
    (muscleRepositoryMock.listMuscles as any).mockResolvedValue({
      items: muscles,
      total: muscles.length,
      page: dto.page!,
      limit: dto.limit!,
    });

    const result = await usecase.execute(dto);

    expect(muscleRepositoryMock.listMuscles).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      items: muscles,
      total: muscles.length,
      page: dto.page,
      limit: dto.limit,
    });
    expect(result.items[0]).not.toBe(muscles[0]);
    expect(result.items[1]).not.toBe(muscles[1]);
  });

  it('should call the repository with default parameters when none are provided', async () => {
    (muscleRepositoryMock.listMuscles as any).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await usecase.execute();

    expect(muscleRepositoryMock.listMuscles).toHaveBeenCalledWith({});
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('list failure');
    (muscleRepositoryMock.listMuscles as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MUSCLES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `ListMusclesUsecase#execute => ${failure.message}`,
    );
  });
});
