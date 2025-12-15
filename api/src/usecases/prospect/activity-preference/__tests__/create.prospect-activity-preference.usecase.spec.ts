import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectActivityPreferenceMongo } from '@services/db/mongo/repositories/prospect/activity-preference.repository';
import { CreateProspectActivityPreferenceUsecase } from '@usecases/prospect/activity-preference/create.prospect-activity-preference.usecase';
import { CreateProspectActivityPreferenceDto } from '@services/db/dtos/prospect/activity-preference.dto';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateProspectActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateProspectActivityPreferenceUsecase;

  const dto: CreateProspectActivityPreferenceDto = {
    locale: 'fr-FR',
    label: 'Musculation',
    visibility: 'PUBLIC',
    createdBy: 'admin-1',
    slug: 'test-slug',
  };

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

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectActivityPreference: BddServiceProspectActivityPreferenceMongo }).prospectActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateProspectActivityPreferenceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create prospect activity preference through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(preference.slug);
    (repositoryMock.create as any).mockResolvedValue(preference);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      slug: expect.any(String),
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'activity-preference',
    });
    expect(result).toEqual(preference);
  });

  it('should return null when repository creation returns null', async () => {
    (repositoryMock.create as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository creation fails', async () => {
    const failure = new Error('create failure');
    (repositoryMock.create as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateProspectActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});
