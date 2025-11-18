import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { UpdateMuscleUsecase } from '@src/usecases/sport/muscle/update.muscle.usecase';
import { UpdateMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';
import { MuscleUsecaseModel } from '@src/usecases/sport/muscle/muscle.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateMuscleUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let muscleRepositoryMock: MockProxy<BddServiceMuscleMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateMuscleUsecase;

  const dto: UpdateMuscleUsecaseDto = {
    id: 'muscle-789',
    slug: 'deltoids',
    locale: 'en-US',
    label: 'Deltoids',
  };

  const updatedMuscle: MuscleUsecaseModel = {
    id: 'muscle-789',
    slug: 'deltoids',
    locale: 'en-US',
    label: 'Deltoids',
    visibility: 'public',
    createdBy: 'coach-3',
    createdAt: new Date('2024-03-01T00:00:00.000Z'),
    updatedAt: new Date('2024-04-01T00:00:00.000Z'),
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

    usecase = new UpdateMuscleUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the muscle through the repository', async () => {
    muscleRepositoryMock.update.mockResolvedValue(updatedMuscle);

    const result = await usecase.execute(dto);

    expect(muscleRepositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
    });
    expect(result).toEqual(updatedMuscle);
    expect(result).not.toBe(updatedMuscle);
  });

  it('should return null when the repository returns null', async () => {
    muscleRepositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('update failure');
    muscleRepositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_MUSCLE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `UpdateMuscleUsecase#execute => ${failure.message}`,
    );
  });
});
