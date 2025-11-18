import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { DeleteEquipmentUsecase } from '@src/usecases/sport/equipment/delete.equipment.usecase';
import { DeleteEquipmentUsecaseDto } from '@src/usecases/sport/equipment/equipment.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteEquipmentUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let equipmentRepositoryMock: MockProxy<BddServiceEquipmentMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteEquipmentUsecase;

  const dto: DeleteEquipmentUsecaseDto = { id: 'equipment-5' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    equipmentRepositoryMock = mock<BddServiceEquipmentMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { equipment: BddServiceEquipmentMongo }).equipment = equipmentRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteEquipmentUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete equipment through the repository', async () => {
    equipmentRepositoryMock.delete.mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(equipmentRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when repository delete returns false', async () => {
    equipmentRepositoryMock.delete.mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when repository delete fails', async () => {
    const failure = new Error('delete failure');
    equipmentRepositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_EQUIPMENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteEquipmentUsecase#execute => ${failure.message}`);
  });
});
