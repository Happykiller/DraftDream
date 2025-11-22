import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectObjectiveMongo } from '@services/db/mongo/repositories/prospect/objective.repository';
import { DeleteProspectObjectiveUsecase } from '@usecases/prospect/objective/delete.prospect-objective.usecase';
import { GetProspectObjectiveDto } from '@services/db/dtos/prospect/objective.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteProspectObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteProspectObjectiveUsecase;

  const dto: GetProspectObjectiveDto = { id: 'objective-5' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectObjective: BddServiceProspectObjectiveMongo }).prospectObjective = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteProspectObjectiveUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the prospect objective through the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(repositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when the repository deletion fails', async () => {
    repositoryMock.delete.mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when repository delete fails', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_PROSPECT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteProspectObjectiveUsecase#execute => ${failure.message}`);
  });
});
