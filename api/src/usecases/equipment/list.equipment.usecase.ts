// src/usecases/equipment/list.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';
import { ListEquipmentUsecaseDto } from '@usecases/equipment/equipment.usecase.dto';

export interface ListEquipmentUsecaseResult {
  items: EquipmentUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListEquipmentUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListEquipmentUsecaseDto = {}): Promise<ListEquipmentUsecaseResult> {
    try {
      const res = await this.inversify.bddService.listEquipments(dto);
      return {
        items: res.items.map(i => ({ ...i })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_EQUIPMENT_USECASE);
    }
  }
}
