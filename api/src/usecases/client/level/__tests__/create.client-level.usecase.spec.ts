import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientLevelMongo } from '@services/db/mongo/repositories/client/level.repository';
import { CreateClientLevelUsecase } from '@usecases/client/level/create.client-level.usecase';
import { CreateClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateClientLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateClientLevelUsecase;

  const dto: CreateClientLevelUsecaseDto = {
    slug: 'client',
    locale: 'fr',
    label: 'Client',
    visibility: 'public',
    createdBy: 'admin-1',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
  const level: ClientLevelUsecaseModel = {
    id: 'level-1',
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
    repositoryMock = mock<BddServiceClientLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientLevel: BddServiceClientLevelMongo }).clientLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateClientLevelUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a client level through the repository', async () => {
    repositoryMock.create.mockResolvedValue(level);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(level);
  });

  it('should return null when repository creation returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository creation fails', async () => {
    const failure = new Error('create failure');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CLIENT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateClientLevelUsecase#execute => ${failure.message}`);
  });
});
