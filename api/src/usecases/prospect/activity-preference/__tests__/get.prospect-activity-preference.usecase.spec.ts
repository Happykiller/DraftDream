import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectActivityPreferenceMongo } from '@services/db/mongo/repositories/prospect/activity-preference.repository';
import { GetProspectActivityPreferenceUsecase } from '@usecases/prospect/activity-preference/get.prospect-activity-preference.usecase';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { GetProspectActivityPreferenceDto } from '@services/db/dtos/prospect/activity-preference.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetProspectActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetProspectActivityPreferenceUsecase;

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

  const dto: GetProspectActivityPreferenceDto = { id: preference.id };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectActivityPreference: BddServiceProspectActivityPreferenceMongo }).prospectActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetProspectActivityPreferenceUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should get prospect activity preference through the repository', async () => {
    repositoryMock.get.mockResolvedValue(preference);

    const result = await usecase.execute(dto);

    expect(repositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(preference);
  });

  it('should return null when repository returns null', async () => {
    repositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository get fails', async () => {
    const failure = new Error('get failure');
    repositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetProspectActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});
