import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectObjectiveMongo } from '@services/db/mongo/repositories/prospect/objective.repository';
import { UpdateProspectObjectiveUsecase } from '@usecases/prospect/objective/update.prospect-objective.usecase';
import { UpdateProspectObjectiveDto } from '@services/db/dtos/prospect/objective.dto';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateProspectObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateProspectObjectiveUsecase;

  const dto: UpdateProspectObjectiveDto = {
    locale: 'es-ES',
    label: 'Mantener',
    visibility: 'PRIVATE',
  };
  const id = 'objective-4';

  const now = new Date('2024-02-13T14:05:00.000Z');
  const objective: ProspectObjective = {
    slug: "test-slug",
    id: 'objective-4',
    locale: 'es-es',
    label: 'Mantener',
    visibility: 'PRIVATE',
    createdBy: 'coach-9',
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

    usecase = new UpdateProspectObjectiveUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the prospect objective through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue('updated-objective');
    repositoryMock.update.mockResolvedValue(objective);

    const result = await usecase.execute({ ...dto, id });

    expect(repositoryMock.update).toHaveBeenCalledWith(id, {
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      slug: expect.any(String),
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'objective',
    });
    expect(result).toEqual(objective);
  });

  it('should return null when the repository update returns null', async () => {
    repositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute({ ...dto, id });

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute({ ...dto, id })).rejects.toThrow(ERRORS.UPDATE_PROSPECT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateProspectObjectiveUsecase#execute => ${failure.message}`);
  });
});
