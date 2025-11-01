import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { GetEquipmentUsecase } from '@usecases/equipment/get.equipment.usecase';
import { GetEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetEquipmentUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let equipmentRepositoryMock: MockProxy<BddServiceEquipmentMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetEquipmentUsecase;

  const dto: GetEquipmentUsecaseDto = { id: 'equipment-2' };
  const now = new Date('2024-02-11T08:30:00.000Z');
  const equipment: EquipmentUsecaseModel = {
    id: 'equipment-2',
    slug: 'dumbbell',
    locale: 'en-us',
    label: 'Dumbbell',
    visibility: 'private',
    createdBy: 'coach-3',
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

    usecase = new GetEquipmentUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should retrieve equipment by id through the repository', async () => {
    equipmentRepositoryMock.get.mockResolvedValue(equipment);

    const result = await usecase.execute(dto);

    expect(equipmentRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(equipment);
  });

  it('should return null when repository returns null', async () => {
    equipmentRepositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository get fails', async () => {
    const failure = new Error('read failure');
    equipmentRepositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_EQUIPMENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetEquipmentUsecase#execute => ${failure.message}`);
  });
});
