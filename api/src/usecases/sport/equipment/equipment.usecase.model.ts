// src/usecases/equipment/model/equipment.usecase.model.ts
export interface EquipmentUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
