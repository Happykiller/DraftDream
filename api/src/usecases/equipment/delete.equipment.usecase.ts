// src/usecases/equipment/delete.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';

export class DeleteEquipmentUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteEquipmentUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.equipment.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_EQUIPMENT_USECASE);
    }
  }
}
