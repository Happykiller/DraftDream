// src/usecases/equipment/update.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';
import { UpdateEquipmentUsecaseDto } from '@src/usecases/sport/equipment/equipment.usecase.dto';

export class UpdateEquipmentUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateEquipmentUsecaseDto): Promise<EquipmentUsecaseModel | null> {
    try {
      const toUpdate: any = {
        locale: dto.locale,
        label: dto.label,
      };

      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'equipment' });
      }
      const updated = await this.inversify.bddService.equipment.update(
        dto.id,
        toUpdate,
      );
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(
        `UpdateEquipmentUsecase#execute => ${e?.message ?? e}`,
      );
      throw new Error(ERRORS.UPDATE_EQUIPMENT_USECASE);
    }
  }
}
