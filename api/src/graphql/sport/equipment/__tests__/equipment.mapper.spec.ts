import { describe, expect, it } from '@jest/globals';
import { mapEquipmentUsecaseToGql } from '../equipment.mapper';

import { EquipmentVisibility } from '@src/graphql/sport/equipment/equipment.gql.types';
import type { EquipmentUsecaseModel } from '@src/usecases/sport/equipment/equipment.usecase.model';

describe('mapEquipmentUsecaseToGql', () => {
  it('maps visibility to the GraphQL enum', () => {
    const createdAt = new Date('2023-10-01T00:00:00.000Z');
    const updatedAt = new Date('2023-10-02T00:00:00.000Z');

    const model: EquipmentUsecaseModel = {
      id: 'equipment-1',
      slug: 'barbell',
      locale: 'fr-FR',
      label: 'Barre',
      visibility: 'private',
      createdBy: 'coach-11',
      createdAt,
      updatedAt,
    };

    const result = mapEquipmentUsecaseToGql(model);

    expect(result).toEqual({
      id: 'equipment-1',
      slug: 'barbell',
      locale: 'fr-FR',
      label: 'Barre',
      visibility: EquipmentVisibility.PRIVATE,
      createdBy: 'coach-11',
      createdAt,
      updatedAt,
    });
  });
});
