// src/usecases/equipment/dto/create.equipment.usecase.dto.ts
export interface CreateEquipmentUsecaseDto {
  slug: string;
  locale: string;
  name: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

// src/usecases/equipment/dto/get.equipment.usecase.dto.ts
export interface GetEquipmentUsecaseDto {
  id: string;
}

// src/usecases/equipment/dto/list.equipment.usecase.dto.ts
export interface ListEquipmentUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

// src/usecases/equipment/dto/update.equipment.usecase.dto.ts
export interface UpdateEquipmentUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  name?: string;
}

// src/usecases/equipment/dto/delete.equipment.usecase.dto.ts
export interface DeleteEquipmentUsecaseDto {
  id: string;
}
