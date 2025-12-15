// src/services/db/dto/equipment.dto.ts
export interface CreateEquipmentDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

export type UpdateEquipmentDto = Partial<Pick<CreateEquipmentDto, 'slug' | 'locale' | 'label' | 'visibility'>>;

export interface GetEquipmentDto { id: string }

export interface ListEquipmentDto {
  q?: string;                     // search on slug (regex)
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
