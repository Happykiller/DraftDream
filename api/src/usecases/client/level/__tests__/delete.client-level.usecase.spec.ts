import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientLevelMongo } from '@services/db/mongo/repositories/client/level.repository';
import { DeleteClientLevelUsecase } from '@usecases/client/level/delete.client-level.usecase';
import { DeleteClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteClientLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteClientLevelUsecase;

  const dto: DeleteClientLevelUsecaseDto = { id: 'level-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientLevel: BddServiceClientLevelMongo }).clientLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteClientLevelUsecase(inversifyMock);
  });

  it('should delete a level through the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    await expect(usecase.execute(dto)).resolves.toBe(true);
  });

  it('should log and throw when repository deletion fails', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CLIENT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteClientLevelUsecase#execute => ${failure.message}`);
  });
});
