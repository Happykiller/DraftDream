import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { CreateMuscleUsecase } from '@usecases/muscle/create.muscle.usecase';
import { CreateMuscleUsecaseDto } from '@usecases/muscle/muscle.usecase.dto';
import { MuscleUsecaseModel } from '@usecases/muscle/muscle.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateMuscleUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let muscleRepositoryMock: MockProxy<BddServiceMuscleMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateMuscleUsecase;

  const dto: CreateMuscleUsecaseDto = {
    slug: 'biceps',
    locale: 'en-US',
    label: 'Biceps',
    visibility: 'public',
    createdBy: 'coach-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const muscle: MuscleUsecaseModel = {
    id: 'muscle-1',
    slug: 'biceps',
    locale: 'en-us',
    label: 'Biceps',
    visibility: 'public',
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
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

    usecase = new CreateMuscleUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a muscle through the repository', async () => {
    muscleRepositoryMock.create.mockResolvedValue(muscle);

    const result = await usecase.execute(dto);

    expect(muscleRepositoryMock.create).toHaveBeenCalledWith({
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(muscle);
  });

  it('should return null when the repository returns null', async () => {
    muscleRepositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    muscleRepositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_MUSCLE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateMuscleUsecase#execute => ${failure.message}`,
    );
  });
});
