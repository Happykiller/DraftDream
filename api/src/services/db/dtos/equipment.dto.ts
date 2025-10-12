// src/services/db/dto/equipment.dto.ts
export type CreateEquipmentDto = {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
};

export type UpdateEquipmentDto = Partial<Pick<CreateEquipmentDto, 'slug' | 'locale' | 'label'>>;

export type GetEquipmentDto = { id: string };

export type ListEquipmentDto = {
  q?: string;                     // search on slug (regex)
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
};
