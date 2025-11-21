import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientObjectiveMongo } from '@services/db/mongo/repositories/client/objective.repository';
import { CreateClientObjectiveUsecase } from '@usecases/client/objective/create.client-objective.usecase';
import { CreateClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateClientObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let clientObjectiveRepositoryMock: MockProxy<BddServiceClientObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateClientObjectiveUsecase;

  const dto: CreateClientObjectiveUsecaseDto = {
    locale: 'fr-FR',
    label: 'Perte de poids',
    visibility: 'public',
    createdBy: 'admin-1',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
  const clientObjective: ClientObjectiveUsecaseModel = {
    id: 'objective-1',
    slug: 'weight-loss',
    locale: 'fr-fr',
    label: 'Perte de poids',
    visibility: 'public',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    clientObjectiveRepositoryMock = mock<BddServiceClientObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientObjective: BddServiceClientObjectiveMongo }).clientObjective = clientObjectiveRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateClientObjectiveUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create client objective through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(clientObjective.slug);
    clientObjectiveRepositoryMock.create.mockResolvedValue(clientObjective);

    const result = await usecase.execute(dto);

    expect(clientObjectiveRepositoryMock.create).toHaveBeenCalledWith({
      slug: clientObjective.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      slug: dto.slug,
      label: dto.label,
      fallback: 'client-objective',
    });
    expect(result).toEqual(clientObjective);
  });

  it('should return null when repository creation returns null', async () => {
    clientObjectiveRepositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository creation fails', async () => {
    const failure = new Error('create failure');
    clientObjectiveRepositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CLIENT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateClientObjectiveUsecase#execute => ${failure.message}`);
  });
});

