import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceEquipmentMongo } from '@services/db/mongo/repositories/equipment.repository';
import { UpdateEquipmentUsecase } from '@src/usecases/sport/equipment/update.equipment.usecase';
import { UpdateEquipmentUsecaseDto } from '@src/usecases/sport/equipment/equipment.usecase.dto';
import { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    // Simple slugify for testing purposes
    if (label === 'Rack à squat') return 'rack-a-squat';
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateEquipmentUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let equipmentRepositoryMock: MockProxy<BddServiceEquipmentMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateEquipmentUsecase;

  const dto: UpdateEquipmentUsecaseDto = {
    id: 'equipment-4',
    locale: 'fr-FR',
    label: 'Rack à squat',
  };

  const now = new Date('2024-02-13T07:15:00.000Z');
  const equipment: EquipmentUsecaseModel = {
    id: 'equipment-4',
    slug: 'rack-a-squat',
    locale: 'fr-fr',
    label: 'Rack à squat',
    visibility: 'PRIVATE',
    createdBy: 'coach-5',
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

    usecase = new UpdateEquipmentUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update equipment through the repository', async () => {
    (equipmentRepositoryMock.update as any).mockResolvedValue(equipment);

    const result = await usecase.execute(dto);

    expect(equipmentRepositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: 'rack-a-squat',
      locale: dto.locale,
      label: dto.label,
    });
    expect(result).toEqual(equipment);
  });

  it('should return null when repository update returns null', async () => {
    (equipmentRepositoryMock.update as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository update fails', async () => {
    const failure = new Error('update failure');
    (equipmentRepositoryMock.update as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_EQUIPMENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateEquipmentUsecase#execute => ${failure.message}`);
  });
});
