import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/client/status.repository';
import { CreateClientStatusUsecase } from '@usecases/client/status/create.client-status.usecase';
import { CreateClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateClientStatusUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientStatusMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateClientStatusUsecase;

  const dto: CreateClientStatusUsecaseDto = {
    locale: 'fr',
    label: 'Client',
    visibility: 'public',
    createdBy: 'admin-1',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
  const status: ClientStatusUsecaseModel = {
    id: 'status-1',
    slug: 'client',
    locale: 'fr',
    label: 'Client',
    visibility: 'public',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientStatusMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientStatus: BddServiceClientStatusMongo }).clientStatus = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateClientStatusUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a client status through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(status.slug);
    repositoryMock.create.mockResolvedValue(status);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      slug: status.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      slug: dto.slug,
      label: dto.label,
      fallback: 'client-status',
    });
    expect(result).toEqual(status);
  });

  it('should return null when repository creation returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository creation fails', async () => {
    const failure = new Error('create failure');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CLIENT_STATUS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateClientStatusUsecase#execute => ${failure.message}`);
  });
});
