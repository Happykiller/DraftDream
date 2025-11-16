// src/usecases/meal-day/meal-day.usecase.dto.ts

import {
  CreateMealDayDto as CreateMealDayServiceDto,
  GetMealDayDto as GetMealDayServiceDto,
  ListMealDaysDto as ListMealDaysServiceDto,
  UpdateMealDayDto as UpdateMealDayServiceDto,
} from '@services/db/dtos/meal-day.dto';
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

export type CreateMealDayUsecaseDto = CreateMealDayServiceDto;
export type GetMealDayRepositoryDto = GetMealDayServiceDto;
export type GetMealDayUsecaseDto = GetMealDayRepositoryDto & { session: UsecaseSession };
export type ListMealDaysRepositoryDto = ListMealDaysServiceDto;
export type ListMealDaysUsecaseDto = ListMealDaysRepositoryDto & { session: UsecaseSession };
export type UpdateMealDayUsecaseDto = UpdateMealDayServiceDto;
export interface DeleteMealDayUsecaseDto { id: string; session: UsecaseSession }

