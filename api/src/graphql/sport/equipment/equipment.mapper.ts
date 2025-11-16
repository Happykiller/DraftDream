// src/graphql/equipment/equipment.mapper.ts
import { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';
import { EquipmentGql, EquipmentVisibility } from '@src/graphql/sport/equipment/equipment.gql.types';

export function mapEquipmentUsecaseToGql(m: EquipmentUsecaseModel): EquipmentGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    label: m.label,
    visibility: m.visibility as EquipmentVisibility,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
