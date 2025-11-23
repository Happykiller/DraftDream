import { Role } from '@src/common/role.enum';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

/**
 * Independent usecase DTO for creating meal days.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateMealDayUsecaseDto {
  locale: string;
  label: string;
  description?: string;
  mealIds: string[];
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface GetMealDayUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListMealDaysUsecaseDto {
  q?: string;
  locale?: string;
  visibility?: 'private' | 'public';
  createdBy?: string;
  createdByIn?: string[];
  accessibleFor?: { ownerId: string; includeCreatorIds?: string[] };
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
  session: UsecaseSession;
}

/**
 * Independent usecase DTO for updating meal days.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateMealDayUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  description?: string;
  mealIds?: string[];
  visibility?: 'private' | 'public';
}

export interface DeleteMealDayUsecaseDto {
  id: string;
  session: UsecaseSession;
}
