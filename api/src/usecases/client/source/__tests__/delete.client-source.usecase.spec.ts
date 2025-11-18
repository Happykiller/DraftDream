import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientSourceMongo } from '@services/db/mongo/repositories/client/source.repository';
import { DeleteClientSourceUsecase } from '@usecases/client/source/delete.client-source.usecase';
import { DeleteClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteClientSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteClientSourceUsecase;

  const dto: DeleteClientSourceUsecaseDto = { id: 'source-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientSourceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientSource: BddServiceClientSourceMongo }).clientSource = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteClientSourceUsecase(inversifyMock);
  });

  it('should delete a source through the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    await expect(usecase.execute(dto)).resolves.toBe(true);
  });

  it('should log and throw when repository deletion fails', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CLIENT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteClientSourceUsecase#execute => ${failure.message}`);
  });
});
