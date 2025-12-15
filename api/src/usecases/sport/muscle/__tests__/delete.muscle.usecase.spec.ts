import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMuscleMongo } from '@services/db/mongo/repositories/muscle.repository';
import { DeleteMuscleUsecase } from '@src/usecases/sport/muscle/delete.muscle.usecase';
import { DeleteMuscleUsecaseDto } from '@src/usecases/sport/muscle/muscle.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteMuscleUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let muscleRepositoryMock: MockProxy<BddServiceMuscleMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteMuscleUsecase;

  const dto: DeleteMuscleUsecaseDto = {
    id: 'muscle-123',
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

    usecase = new DeleteMuscleUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the muscle through the repository', async () => {
    (muscleRepositoryMock.delete as any).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(muscleRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when the repository returns false', async () => {
    (muscleRepositoryMock.delete as any).mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when deletion fails', async () => {
    const failure = new Error('database failure');
    (muscleRepositoryMock.delete as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_MUSCLE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteMuscleUsecase#execute => ${failure.message}`,
    );
  });
});
