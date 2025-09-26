// src/usecases/equipment/get.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';

export class GetEquipmentUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetEquipmentUsecaseDto): Promise<EquipmentUsecaseModel | null> {
    try {
      const eq = await this.inversify.bddService.getEquipment(dto.id);
      return eq ? { ...eq } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_EQUIPMENT_USECASE);
    }
  }
}
