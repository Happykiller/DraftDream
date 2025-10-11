// src/usecases/equipment/create.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';
import { CreateEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';

export class CreateEquipmentUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateEquipmentUsecaseDto): Promise<EquipmentUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.equipment.create({
        slug: dto.slug,
        locale: dto.locale,
        name: dto.name,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_EQUIPMENT_USECASE);
    }
  }
}
