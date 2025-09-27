// src/usecases/equipment/update.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';
import { UpdateEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';

export class UpdateEquipmentUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateEquipmentUsecaseDto): Promise<EquipmentUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.equipment.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
      });
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_EQUIPMENT_USECASE);
    }
  }
}
