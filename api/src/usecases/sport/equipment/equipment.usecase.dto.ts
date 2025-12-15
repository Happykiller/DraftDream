// src/usecases/sport/equipment/equipment.usecase.dto.ts

/**
 * Independent usecase DTO for creating equipment.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateEquipmentUsecaseDto {
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

export interface GetEquipmentUsecaseDto {
  id: string;
}

export interface ListEquipmentUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

/**
 * Independent usecase DTO for updating equipment.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateEquipmentUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface DeleteEquipmentUsecaseDto {
  id: string;
}
