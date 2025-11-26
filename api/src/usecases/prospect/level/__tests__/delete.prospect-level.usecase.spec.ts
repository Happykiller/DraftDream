import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectLevelMongo } from '@services/db/mongo/repositories/prospect/level.repository';
import { DeleteProspectLevelUsecase } from '@usecases/prospect/level/delete.prospect-level.usecase';
import { GetProspectLevelDto } from '@services/db/dtos/prospect/level.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteProspectLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteProspectLevelUsecase;

  const dto: GetProspectLevelDto = { id: 'level-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectLevel: BddServiceProspectLevelMongo }).prospectLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteProspectLevelUsecase(inversifyMock);
  });

  it('should delete a level through the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    await expect(usecase.execute(dto)).resolves.toBe(true);
  });

  it('should log and throw when repository deletion fails', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_PROSPECT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteProspectLevelUsecase#execute => ${failure.message}`);
  });
});
