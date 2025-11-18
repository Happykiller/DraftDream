import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { CreateEquipmentUsecase } from '@src/usecases/sport/equipment/create.equipment.usecase';
import { CreateEquipmentUsecaseDto } from '@src/usecases/sport/equipment/equipment.usecase.dto';
import { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateEquipmentUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let equipmentRepositoryMock: MockProxy<BddServiceEquipmentMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateEquipmentUsecase;

  const dto: CreateEquipmentUsecaseDto = {
    slug: 'barbell',
    locale: 'en-US',
    label: 'Barbell',
    visibility: 'public',
    createdBy: 'coach-1',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
  const equipment: EquipmentUsecaseModel = {
    id: 'equipment-1',
    slug: 'barbell',
    locale: 'en-us',
    label: 'Barbell',
    visibility: 'public',
    createdBy: 'coach-1',
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

    usecase = new CreateEquipmentUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create equipment through the repository', async () => {
    equipmentRepositoryMock.create.mockResolvedValue(equipment);

    const result = await usecase.execute(dto);

    expect(equipmentRepositoryMock.create).toHaveBeenCalledWith({
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(equipment);
  });

  it('should return null when repository creation returns null', async () => {
    equipmentRepositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository creation fails', async () => {
    const failure = new Error('write failure');
    equipmentRepositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_EQUIPMENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateEquipmentUsecase#execute => ${failure.message}`);
  });
});
