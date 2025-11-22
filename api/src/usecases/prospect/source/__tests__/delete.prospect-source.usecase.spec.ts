import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectSourceMongo } from '@services/db/mongo/repositories/prospect/source.repository';
import { DeleteProspectSourceUsecase } from '@usecases/prospect/source/delete.prospect-source.usecase';
import { GetProspectSourceDto } from '@services/db/dtos/prospect/source.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteProspectSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteProspectSourceUsecase;

  const dto: GetProspectSourceDto = { id: 'source-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectSourceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectSource: BddServiceProspectSourceMongo }).prospectSource = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteProspectSourceUsecase(inversifyMock);
  });

  it('should delete a source', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    await expect(usecase.execute(dto)).resolves.toBe(true);
    expect(repositoryMock.delete).toHaveBeenCalledWith(dto.id);
  });

  it('should return false when delete fails in repository', async () => {
    repositoryMock.delete.mockResolvedValue(false);

    await expect(usecase.execute(dto)).resolves.toBe(false);
  });

  it('should log and throw when repository throws', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_PROSPECT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteProspectSourceUsecase#execute => ${failure.message}`);
  });
});
