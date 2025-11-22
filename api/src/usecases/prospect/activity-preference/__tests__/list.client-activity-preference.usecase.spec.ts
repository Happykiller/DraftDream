import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientActivityPreferenceMongo } from '@services/db/mongo/repositories/client/activity-preference.repository';
import { ListClientActivityPreferencesUsecase } from '@usecases/client/activity-preference/list.client-activity-preference.usecase';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';
import { ListClientActivityPreferencesUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListClientActivityPreferencesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListClientActivityPreferencesUsecase;

  const now = new Date('2024-02-10T12:00:00.000Z');
  const preference: ClientActivityPreferenceUsecaseModel = {
    id: 'preference-1',
    slug: 'musculation',
    locale: 'fr-fr',
    label: 'Musculation',
    visibility: 'public',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  const dto: ListClientActivityPreferencesUsecaseDto = {
    q: 'musculation',
    locale: 'fr-FR',
    createdBy: 'admin-1',
    visibility: 'public',
    limit: 10,
    page: 2,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientActivityPreference: BddServiceClientActivityPreferenceMongo }).clientActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListClientActivityPreferencesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list client activity preferences through the repository', async () => {
    const repositoryResult = {
      items: [preference],
      total: 1,
      page: 2,
      limit: 10,
    };
    repositoryMock.list.mockResolvedValue(repositoryResult);

    const result = await usecase.execute(dto);

    expect(repositoryMock.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual(repositoryResult);
  });

  it('should pass default DTO when nothing specified', async () => {
    const repositoryResult = {
      items: [preference],
      total: 1,
      page: 1,
      limit: 20,
    };
    repositoryMock.list.mockResolvedValue(repositoryResult);

    const result = await usecase.execute();

    expect(repositoryMock.list).toHaveBeenCalledWith({});
    expect(result).toEqual(repositoryResult);
  });

  it('should log and throw a domain error when repository list fails', async () => {
    const failure = new Error('list failure');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_CLIENT_ACTIVITY_PREFERENCES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListClientActivityPreferencesUsecase#execute => ${failure.message}`);
  });
});
