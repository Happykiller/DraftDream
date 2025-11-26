// src/usecases/equipment/list.equipment.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';
import { ListEquipmentUsecaseDto } from '@src/usecases/sport/equipment/equipment.usecase.dto';

export interface ListEquipmentUsecaseResult {
  items: EquipmentUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListEquipmentUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListEquipmentUsecaseDto = {}): Promise<ListEquipmentUsecaseResult> {
    try {
      const res = await this.inversify.bddService.equipment.listEquipments(dto);
      return {
        items: res.items.map(i => ({ ...i })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListEquipmentUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.LIST_EQUIPMENT_USECASE);
    }
  }
}
