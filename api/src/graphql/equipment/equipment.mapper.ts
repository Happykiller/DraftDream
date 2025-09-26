// src/graphql/equipment/equipment.mapper.ts
import { EquipmentUsecaseModel } from '@usecases/equipment/equipment.usecase.model';
import { EquipmentGql, EquipmentVisibility } from '@graphql/equipment/equipment.gql.types';

export function mapEquipmentUsecaseToGql(m: EquipmentUsecaseModel): EquipmentGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    visibility: m.visibility as EquipmentVisibility,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
