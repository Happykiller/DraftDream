import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/client/status.repository';
import { DeleteClientStatusUsecase } from '@usecases/client/status/delete.client-status.usecase';
import { DeleteClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteClientStatusUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientStatusMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteClientStatusUsecase;

  const dto: DeleteClientStatusUsecaseDto = { id: 'status-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientStatusMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientStatus: BddServiceClientStatusMongo }).clientStatus = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteClientStatusUsecase(inversifyMock);
  });

  it('should delete a status through the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    await expect(usecase.execute(dto)).resolves.toBe(true);
  });

  it('should log and throw when repository deletion fails', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CLIENT_STATUS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteClientStatusUsecase#execute => ${failure.message}`);
  });
});
