import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientActivityPreferenceMongo } from '@services/db/mongo/repositories/client/activity-preference.repository';
import { CreateClientActivityPreferenceUsecase } from '@usecases/client/activity-preference/create.client-activity-preference.usecase';
import { CreateClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateClientActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateClientActivityPreferenceUsecase;

  const dto: CreateClientActivityPreferenceUsecaseDto = {
    locale: 'fr-FR',
    label: 'Musculation',
    visibility: 'public',
    createdBy: 'admin-1',
  };

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

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientActivityPreference: BddServiceClientActivityPreferenceMongo }).clientActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateClientActivityPreferenceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create client activity preference through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(preference.slug);
    repositoryMock.create.mockResolvedValue(preference);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      slug: preference.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'activity-preference',
    });
    expect(result).toEqual(preference);
  });

  it('should return null when repository creation returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository creation fails', async () => {
    const failure = new Error('create failure');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateClientActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});
