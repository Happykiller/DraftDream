// src/usecases/muscle/list.muscles.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MuscleUsecaseModel } from '@usecases/muscle/muscle.usecase.model';
import { ListMusclesUsecaseDto } from '@usecases/muscle/muscle.usecase.dto';

export interface ListMusclesUsecaseResult {
  items: MuscleUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListMusclesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListMusclesUsecaseDto = {}): Promise<ListMusclesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.muscle.listMuscles(dto);
      return {
        items: res.items.map(i => ({ ...i })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListMusclesUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_MUSCLES_USECASE);
    }
  }
}
