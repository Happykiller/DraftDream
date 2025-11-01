// src/usecases/meal-plan/meal-plan.usecase.dto.ts

import {
  CreateMealPlanDto as CreateMealPlanServiceDto,
  GetMealPlanDto as GetMealPlanServiceDto,
  ListMealPlansDto as ListMealPlansServiceDto,
  MealPlanDaySnapshotDto as MealPlanDaySnapshotServiceDto,
  MealPlanMealSnapshotDto as MealPlanMealSnapshotServiceDto,
  MealPlanMealTypeSnapshotDto as MealPlanMealTypeSnapshotServiceDto,
  UpdateMealPlanDto as UpdateMealPlanServiceDto,
} from '@services/db/dtos/meal-plan.dto';
import type { UsecaseSession } from '@usecases/program/program.usecase.dto';

export type CreateMealPlanUsecaseDto = CreateMealPlanServiceDto;
export type GetMealPlanRepositoryDto = GetMealPlanServiceDto;
export type GetMealPlanUsecaseDto = GetMealPlanRepositoryDto & { session: UsecaseSession };
export type ListMealPlansRepositoryDto = ListMealPlansServiceDto;
export type ListMealPlansUsecaseDto = ListMealPlansRepositoryDto & { session: UsecaseSession };
export type UpdateMealPlanUsecaseDto = UpdateMealPlanServiceDto;
export type DeleteMealPlanUsecaseDto = { id: string; session: UsecaseSession };
export type MealPlanDaySnapshotUsecaseDto = MealPlanDaySnapshotServiceDto;
export type MealPlanMealSnapshotUsecaseDto = MealPlanMealSnapshotServiceDto;
export type MealPlanMealTypeSnapshotUsecaseDto = MealPlanMealTypeSnapshotServiceDto;
