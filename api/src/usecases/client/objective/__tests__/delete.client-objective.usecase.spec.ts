import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientObjectiveMongo } from '@services/db/mongo/repositories/client/objective.repository';
import { DeleteClientObjectiveUsecase } from '@usecases/client/objective/delete.client-objective.usecase';
import { DeleteClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteClientObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let clientObjectiveRepositoryMock: MockProxy<BddServiceClientObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteClientObjectiveUsecase;

  const dto: DeleteClientObjectiveUsecaseDto = { id: 'objective-5' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    clientObjectiveRepositoryMock = mock<BddServiceClientObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientObjective: BddServiceClientObjectiveMongo }).clientObjective = clientObjectiveRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteClientObjectiveUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the client objective through the repository', async () => {
    clientObjectiveRepositoryMock.delete.mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(clientObjectiveRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when the repository deletion fails', async () => {
    clientObjectiveRepositoryMock.delete.mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when repository delete fails', async () => {
    const failure = new Error('delete failure');
    clientObjectiveRepositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CLIENT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteClientObjectiveUsecase#execute => ${failure.message}`);
  });
});

