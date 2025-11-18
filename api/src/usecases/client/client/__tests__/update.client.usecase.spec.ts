import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientMongo } from '@services/db/mongo/repositories/client/client.repository';
import { UpdateClientUsecase } from '@usecases/client/client/update.client.usecase';
import { UpdateClientUsecaseDto } from '@usecases/client/client/client.usecase.dto';
import { ClientUsecaseModel } from '@usecases/client/client/client.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateClientUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateClientUsecase;

  const dto: UpdateClientUsecaseDto = {
    id: 'client-1',
    firstName: 'Jane',
    budget: 1400,
  };

  const now = new Date('2024-06-01T10:00:00.000Z');
  const client: ClientUsecaseModel = {
    id: dto.id,
    firstName: dto.firstName!,
    lastName: 'Doe',
    email: 'jane@fitdesk.com',
    objectiveIds: [],
    activityPreferenceIds: [],
    budget: dto.budget,
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  } as ClientUsecaseModel;

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { client: BddServiceClientMongo }).client = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new UpdateClientUsecase(inversifyMock);
  });

  it('should update a client via the repository', async () => {
    repositoryMock.update.mockResolvedValue(client);

    const result = await usecase.execute(dto);

    expect(repositoryMock.update).toHaveBeenCalledWith(dto.id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      statusId: dto.statusId,
      levelId: dto.levelId,
      objectiveIds: dto.objectiveIds,
      activityPreferenceIds: dto.activityPreferenceIds,
      medicalConditions: dto.medicalConditions,
      allergies: dto.allergies,
      notes: dto.notes,
      sourceId: dto.sourceId,
      budget: dto.budget,
      dealDescription: dto.dealDescription,
      desiredStartDate: dto.desiredStartDate,
    });
    expect(result).toEqual(client);
  });

  it('should return null when repository returns null', async () => {
    repositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('update failed');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CLIENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateClientUsecase#execute => ${failure.message}`);
  });
});
