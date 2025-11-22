import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientMongo } from '@services/db/mongo/repositories/client/client.repository';
import { CreateClientUsecase } from '@usecases/client/client/create.client.usecase';
import { CreateClientUsecaseDto } from '@usecases/client/client/client.usecase.dto';
import { ClientUsecaseModel } from '@usecases/client/client/client.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateClientUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateClientUsecase;

  const dto: CreateClientUsecaseDto = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@fitdesk.com',
    phone: '+3300000000',
    statusId: 'status-1',
    levelId: 'level-1',
    objectiveIds: ['obj-1'],
    activityPreferenceIds: ['pref-1'],
    medicalConditions: 'Asthma',
    allergies: 'Pollen',
    notes: 'Morning calls only',
    sourceId: 'source-1',
    budget: 1200,
    dealDescription: '6 months personal coaching',
    desiredStartDate: new Date('2024-07-01T00:00:00.000Z'),
    createdBy: 'admin-1',
  };

  const now = new Date('2024-06-01T10:00:00.000Z');
  const client: ClientUsecaseModel = {
    id: 'client-1',
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    statusId: dto.statusId,
    levelId: dto.levelId,
    objectiveIds: dto.objectiveIds!,
    activityPreferenceIds: dto.activityPreferenceIds!,
    medicalConditions: dto.medicalConditions,
    allergies: dto.allergies,
    notes: dto.notes,
    sourceId: dto.sourceId,
    budget: dto.budget,
    dealDescription: dto.dealDescription,
    desiredStartDate: dto.desiredStartDate!,
    createdBy: dto.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { client: BddServiceClientMongo }).client = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateClientUsecase(inversifyMock);
  });

  it('should create a client via the repository', async () => {
    repositoryMock.create.mockResolvedValue(client);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
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
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(client);
  });

  it('should return null when repository returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository throws', async () => {
    const failure = new Error('create failed');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CLIENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateClientUsecase#execute => ${failure.message}`);
  });
});
