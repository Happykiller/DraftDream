import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { CreateMuscleUsecase } from '@src/usecases/sport/muscle/create.muscle.usecase';
import { CreateMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';
import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    // Simple slugify for testing purposes
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

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
    locale: 'en-US',
    label: 'Biceps',
    visibility: 'PUBLIC',
    createdBy: 'coach-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const muscle: MuscleUsecaseModel = {
    id: 'muscle-1',
    slug: 'biceps',
    locale: 'en-us',
    label: 'Biceps',
    visibility: 'PUBLIC',
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
    (muscleRepositoryMock.create as any).mockResolvedValue(muscle);

    const result = await usecase.execute(dto);

    expect(muscleRepositoryMock.create).toHaveBeenCalledWith({
      slug: 'biceps',
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(muscle);
    expect(result).not.toBe(muscle);
  });

  it('should return null when the repository returns null', async () => {
    (muscleRepositoryMock.create as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    (muscleRepositoryMock.create as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_MUSCLE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateMuscleUsecase#execute => ${failure.message}`,
    );
  });
});
