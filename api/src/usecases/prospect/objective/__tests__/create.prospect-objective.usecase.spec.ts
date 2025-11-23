import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectObjectiveMongo } from '@services/db/mongo/repositories/prospect/objective.repository';
import { CreateProspectObjectiveUsecase } from '@usecases/prospect/objective/create.prospect-objective.usecase';
import { CreateProspectObjectiveDto } from '@services/db/dtos/prospect/objective.dto';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateProspectObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateProspectObjectiveUsecase;

  const dto: CreateProspectObjectiveDto = {
    locale: 'fr-FR',
    label: 'Perte de poids',
    visibility: 'public',
    createdBy: 'admin-1',
    slug: 'test-slug',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
  const objective: ProspectObjective = {
    slug: "test-slug",
    id: 'objective-1',
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
    repositoryMock = mock<BddServiceProspectObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectObjective: BddServiceProspectObjectiveMongo }).prospectObjective = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateProspectObjectiveUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create prospect objective through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(objective.slug);
    repositoryMock.create.mockResolvedValue(objective);

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
      fallback: 'objective',
    });
    expect(result).toEqual(objective);
  });

  it('should return null when repository creation returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository creation fails', async () => {
    const failure = new Error('create failure');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_PROSPECT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateProspectObjectiveUsecase#execute => ${failure.message}`);
  });
});
