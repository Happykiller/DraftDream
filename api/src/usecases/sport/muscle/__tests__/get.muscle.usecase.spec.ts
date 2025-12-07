import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { GetMuscleUsecase } from '@src/usecases/sport/muscle/get.muscle.usecase';
import { GetMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';
import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetMuscleUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let muscleRepositoryMock: MockProxy<BddServiceMuscleMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetMuscleUsecase;

  const dto: GetMuscleUsecaseDto = {
    id: 'muscle-456',
  };

  const muscle: MuscleUsecaseModel = {
    id: 'muscle-456',
    slug: 'triceps',
    locale: 'en-US',
    label: 'Triceps',
    visibility: 'PRIVATE',
    createdBy: 'coach-2',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-02-02T00:00:00.000Z'),
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    muscleRepositoryMock = mock<BddServiceMuscleMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { muscle: BddServiceMuscleMongo }).muscle =
      muscleRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetMuscleUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the muscle retrieved from the repository', async () => {
    muscleRepositoryMock.get.mockResolvedValue(muscle);

    const result = await usecase.execute(dto);

    expect(muscleRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(muscle);
    expect(result).not.toBe(muscle);
  });

  it('should return null when the muscle is not found', async () => {
    muscleRepositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('repository failure');
    muscleRepositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_MUSCLE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `GetMuscleUsecase#execute => ${failure.message}`,
    );
  });
});
