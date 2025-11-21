// src/usecases/meal-day/meal-day.usecase.dto.ts

import {
  CreateMealDayDto as CreateMealDayServiceDto,
  GetMealDayDto as GetMealDayServiceDto,
  ListMealDaysDto as ListMealDaysServiceDto,
  UpdateMealDayDto as UpdateMealDayServiceDto,
} from '@services/db/dtos/meal-day.dto';
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

export type CreateMealDayUsecaseDto = Omit<CreateMealDayServiceDto, 'slug'>;
export type GetMealDayRepositoryDto = GetMealDayServiceDto;
export type GetMealDayUsecaseDto = GetMealDayRepositoryDto & { session: UsecaseSession };
export type ListMealDaysRepositoryDto = ListMealDaysServiceDto;
export type ListMealDaysUsecaseDto = ListMealDaysRepositoryDto & { session: UsecaseSession };
export type UpdateMealDayUsecaseDto = Omit<UpdateMealDayServiceDto, 'slug'>;
export interface DeleteMealDayUsecaseDto { id: string; session: UsecaseSession }

