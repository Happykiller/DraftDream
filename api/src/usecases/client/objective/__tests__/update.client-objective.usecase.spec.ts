import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientObjectiveMongo } from '@services/db/mongo/repositories/client/objective.repository';
import { UpdateClientObjectiveUsecase } from '@usecases/client/objective/update.client-objective.usecase';
import { UpdateClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateClientObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let clientObjectiveRepositoryMock: MockProxy<BddServiceClientObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateClientObjectiveUsecase;

  const dto: UpdateClientObjectiveUsecaseDto = {
    id: 'objective-4',
    slug: 'maintain',
    locale: 'es-ES',
    label: 'Mantener',
    visibility: 'private',
  };

  const now = new Date('2024-02-13T14:05:00.000Z');
  const clientObjective: ClientObjectiveUsecaseModel = {
    id: 'objective-4',
    slug: 'maintain',
    locale: 'es-es',
    label: 'Mantener',
    visibility: 'private',
    createdBy: 'coach-9',
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

    usecase = new UpdateClientObjectiveUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the client objective through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue('updated-objective');
    clientObjectiveRepositoryMock.update.mockResolvedValue(clientObjective);

    const result = await usecase.execute(dto);

    expect(clientObjectiveRepositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: 'updated-objective',
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      slug: dto.slug,
      label: dto.label,
      fallback: 'client-objective',
    });
    expect(result).toEqual(clientObjective);
  });

  it('should return null when the repository update returns null', async () => {
    clientObjectiveRepositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository update fails', async () => {
    const failure = new Error('update failure');
    clientObjectiveRepositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CLIENT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateClientObjectiveUsecase#execute => ${failure.message}`);
  });
});

