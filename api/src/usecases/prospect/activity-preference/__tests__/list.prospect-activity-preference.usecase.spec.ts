import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectActivityPreferenceMongo } from '@services/db/mongo/repositories/prospect/activity-preference.repository';
import { ListProspectActivityPreferencesUsecase } from '@usecases/prospect/activity-preference/list.prospect-activity-preference.usecase';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { ListProspectActivityPreferencesDto } from '@services/db/dtos/prospect/activity-preference.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListProspectActivityPreferencesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListProspectActivityPreferencesUsecase;

  const now = new Date('2024-02-10T12:00:00.000Z');
  const preference: ProspectActivityPreference = {
    slug: "test-slug",
    id: 'preference-1',
    locale: 'fr-fr',
    label: 'Musculation',
    visibility: 'PUBLIC',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  const dto: ListProspectActivityPreferencesDto = {
    q: 'musculation',
    locale: 'fr-FR',
    createdBy: 'admin-1',
    visibility: 'PUBLIC',
    limit: 10,
    page: 2,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectActivityPreference: BddServiceProspectActivityPreferenceMongo }).prospectActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListProspectActivityPreferencesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list prospect activity preferences through the repository', async () => {
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

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROSPECT_ACTIVITY_PREFERENCES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListProspectActivityPreferencesUsecase#execute => ${failure.message}`);
  });
});
