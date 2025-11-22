import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientActivityPreferenceMongo } from '@services/db/mongo/repositories/client/activity-preference.repository';
import { DeleteClientActivityPreferenceUsecase } from '@usecases/client/activity-preference/delete.client-activity-preference.usecase';
import { DeleteClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteClientActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteClientActivityPreferenceUsecase;

  const dto: DeleteClientActivityPreferenceUsecaseDto = { id: 'preference-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientActivityPreference: BddServiceClientActivityPreferenceMongo }).clientActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteClientActivityPreferenceUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete client activity preference through the repository', async () => {
    repositoryMock.delete.mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(repositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should propagate repository result when delete returns false', async () => {
    repositoryMock.delete.mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when repository delete fails', async () => {
    const failure = new Error('delete failure');
    repositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteClientActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});
