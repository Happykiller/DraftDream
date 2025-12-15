// src/usecases/equipment/create.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';
import { CreateEquipmentUsecaseDto } from '@src/usecases/sport/equipment/equipment.usecase.dto';

export class CreateEquipmentUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateEquipmentUsecaseDto): Promise<EquipmentUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'equipment', locale: dto.locale });
      const created = await this.inversify.bddService.equipment.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_EQUIPMENT_USECASE);
    }
  }
}
