import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientActivityPreferenceMongo } from '@services/db/mongo/repositories/client/activity-preference.repository';
import { UpdateClientActivityPreferenceUsecase } from '@usecases/client/activity-preference/update.client-activity-preference.usecase';
import { ClientActivityPreferenceUsecaseModel } from '@usecases/client/activity-preference/client-activity-preference.usecase.model';
import { UpdateClientActivityPreferenceUsecaseDto } from '@usecases/client/activity-preference/client-activity-preference.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateClientActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateClientActivityPreferenceUsecase;

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

  const dto: UpdateClientActivityPreferenceUsecaseDto = {
    id: preference.id,
    slug: 'hiit',
    locale: 'fr-FR',
    label: 'HIIT',
    visibility: 'private',
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientActivityPreference: BddServiceClientActivityPreferenceMongo }).clientActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new UpdateClientActivityPreferenceUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update client activity preference through the repository', async () => {
    repositoryMock.update.mockResolvedValue(preference);

    const result = await usecase.execute(dto);

    expect(repositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
    });
    expect(result).toEqual(preference);
  });

  it('should return null when repository update returns null', async () => {
    repositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CLIENT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateClientActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});
