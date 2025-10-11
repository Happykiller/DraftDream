// src/usecases/equipment/model/equipment.usecase.model.ts
export interface EquipmentUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  name: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
