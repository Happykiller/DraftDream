import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientMongo } from '@services/db/mongo/repositories/client/client.repository';
import { DeleteClientUsecase } from '@usecases/client/client/delete.client.usecase';
import { DeleteClientUsecaseDto } from '@usecases/client/client/client.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteClientUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteClientUsecase;

  const dto: DeleteClientUsecaseDto = { id: 'client-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { client: BddServiceClientMongo }).client = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteClientUsecase(inversifyMock);
  });

  it('should delete a client via the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(repositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('delete failed');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CLIENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteClientUsecase#execute => ${failure.message}`);
  });
});
