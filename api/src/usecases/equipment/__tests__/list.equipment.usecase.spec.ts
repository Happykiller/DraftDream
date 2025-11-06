import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { ListEquipmentUsecase, ListEquipmentUsecaseResult } from '@usecases/equipment/list.equipment.usecase';
import { ListEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListEquipmentUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let equipmentRepositoryMock: MockProxy<BddServiceEquipmentMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListEquipmentUsecase;

  const now = new Date('2024-02-12T09:45:00.000Z');
  const equipment: EquipmentUsecaseModel = {
    id: 'equipment-3',
    slug: 'kettlebell',
    locale: 'en-us',
    label: 'Kettlebell',
    visibility: 'public',
    createdBy: 'coach-4',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    equipmentRepositoryMock = mock<BddServiceEquipmentMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { equipment: BddServiceEquipmentMongo }).equipment = equipmentRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListEquipmentUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list equipments through the repository', async () => {
    const dto: ListEquipmentUsecaseDto = {
      q: 'bell',
      locale: 'en-US',
      createdBy: 'coach-4',
      visibility: 'public',
      limit: 10,
      page: 2,
      sort: { updatedAt: -1 },
    };

    const repositoryResult: ListEquipmentUsecaseResult = {
      items: [equipment],
      total: 1,
      page: 2,
      limit: 10,
    };

    equipmentRepositoryMock.listEquipments.mockResolvedValue(repositoryResult);

    const result = await usecase.execute(dto);

    expect(equipmentRepositoryMock.listEquipments).toHaveBeenCalledWith(dto);
    expect(result).toEqual(repositoryResult);
    expect(result.items[0]).not.toBe(repositoryResult.items[0]);
  });

  it('should list equipments with default parameters when dto is omitted', async () => {
    const repositoryResult: ListEquipmentUsecaseResult = {
      items: [equipment],
      total: 1,
      page: 1,
      limit: 20,
    };

    equipmentRepositoryMock.listEquipments.mockResolvedValue(repositoryResult);

    const result = await usecase.execute();

    expect(equipmentRepositoryMock.listEquipments).toHaveBeenCalledWith({});
    expect(result).toEqual(repositoryResult);
  });

  it('should log and throw a domain error when repository list fails', async () => {
    const failure = new Error('list failure');
    equipmentRepositoryMock.listEquipments.mockRejectedValue(failure);

    await expect(usecase.execute()).rejects.toThrow(ERRORS.LIST_EQUIPMENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListEquipmentUsecase#execute => ${failure.message}`);
  });
});
