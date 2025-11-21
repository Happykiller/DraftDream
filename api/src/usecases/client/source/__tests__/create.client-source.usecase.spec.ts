import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientSourceMongo } from '@services/db/mongo/repositories/client/source.repository';
import { CreateClientSourceUsecase } from '@usecases/client/source/create.client-source.usecase';
import { CreateClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateClientSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateClientSourceUsecase;

  const dto: CreateClientSourceUsecaseDto = {
    locale: 'fr',
    label: 'Client',
    visibility: 'public',
    createdBy: 'admin-1',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
  const source: ClientSourceUsecaseModel = {
    id: 'source-1',
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
    repositoryMock = mock<BddServiceClientSourceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientSource: BddServiceClientSourceMongo }).clientSource = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateClientSourceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a client source through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(source.slug);
    repositoryMock.create.mockResolvedValue(source);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      slug: source.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'client-source',
    });
    expect(result).toEqual(source);
  });

  it('should return null when repository creation returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository creation fails', async () => {
    const failure = new Error('create failure');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CLIENT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateClientSourceUsecase#execute => ${failure.message}`);
  });
});
