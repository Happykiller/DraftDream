import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectActivityPreferenceMongo } from '@services/db/mongo/repositories/prospect/activity-preference.repository';
import { UpdateProspectActivityPreferenceUsecase } from '@usecases/prospect/activity-preference/update.prospect-activity-preference.usecase';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import { UpdateProspectActivityPreferenceDto } from '@services/db/dtos/prospect/activity-preference.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateProspectActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateProspectActivityPreferenceUsecase;

  const now = new Date('2024-02-10T12:00:00.000Z');
  const preference: ProspectActivityPreference = {
    slug: "test-slug",
    id: 'preference-1',
    locale: 'fr-fr',
    label: 'Musculation',
    visibility: 'public',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  const dto: UpdateProspectActivityPreferenceDto = {
    locale: 'fr-FR',
    label: 'HIIT',
    visibility: 'private',
  };
  const id = preference.id;

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectActivityPreference: BddServiceProspectActivityPreferenceMongo }).prospectActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new UpdateProspectActivityPreferenceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update prospect activity preference through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue('generated-hiit');
    repositoryMock.update.mockResolvedValue(preference);

    const result = await usecase.execute({ ...dto, id });

    expect(repositoryMock.update).toHaveBeenCalledWith(id, {
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      slug: expect.any(String),
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'activity-preference',
    });
    expect(result).toEqual(preference);
  });

  it('should return null when repository update returns null', async () => {
    repositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute({ ...dto, id });

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute({ ...dto, id })).rejects.toThrow(ERRORS.UPDATE_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateProspectActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});
